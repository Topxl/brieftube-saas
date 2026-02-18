# BriefTube — Spécifications UX : Refonte du parcours utilisateur

**Date :** 2026-02-19
**Auteur :** BMad Master
**Statut :** Spécifications v1.0 — À valider

---

## Table des matières

1. [Vision & principes directeurs](#1-vision--principes-directeurs)
2. [Architecture de l'information](#2-architecture-de-linformation)
3. [Modèle de données : Sources](#3-modèle-de-données--sources)
4. [Parcours utilisateur cible](#4-parcours-utilisateur-cible)
5. [Spécifications : Wizard d'onboarding](#5-spécifications--wizard-donboarding)
6. [Spécifications : Dashboard unifié](#6-spécifications--dashboard-unifié)
7. [Spécifications : Modale "Ajouter une source"](#7-spécifications--modale-ajouter-une-source)
8. [Spécifications : Composant Sources](#8-spécifications--composant-sources)
9. [Spécifications : Composant Résumés](#9-spécifications--composant-résumés)
10. [Spécifications : Composant Livraison](#10-spécifications--composant-livraison)
11. [États et gestion des erreurs](#11-états-et-gestion-des-erreurs)
12. [Responsive & mobile](#12-responsive--mobile)
13. [Navigation : Simplification](#13-navigation--simplification)
14. [Extensibilité future](#14-extensibilité-future)
15. [Fichiers impactés & plan de migration](#15-fichiers-impactés--plan-de-migration)

---

## 1. Vision & principes directeurs

### Objectif
Réduire le temps entre "arrivée sur le site" et "premier résumé reçu" de 7+ pages/étapes à un parcours fluide en 3 étapes sur 2 écrans maximum.

### Principes

| Principe | Description |
|---|---|
| **Valeur d'abord** | Les résumés sont visibles dès le dashboard, même vide |
| **Progressif** | Le setup ne bloque jamais — chaque étape est optionnelle/reportable |
| **Extensible** | L'architecture "Sources" accueille chaînes, playlists, podcasts sans refonte |
| **Non-bloquant** | Telegram non connecté = on peut quand même utiliser l'app (lecture in-app) |
| **Feedback immédiat** | Chaque action donne un retour visuel instantané |
| **Mobile-first** | Chaque composant pensé mobile en premier |

### Ce qui change
- `channels` → renommé `sources` (concept extensible)
- 4 pages dashboard → 1 dashboard avec sections inline
- Stepper passif → Wizard actif post-login
- Settings séparés → Livraison inline dans le dashboard
- Import YouTube → Intégré dans "Ajouter une source"

---

## 2. Architecture de l'information

```
BriefTube
│
├── / (landing)
│   └── CTA principal → Google OAuth direct
│
├── /onboarding (nouveau : wizard post-login, 3 étapes)
│   ├── Étape 1 : Ajouter une source
│   ├── Étape 2 : Choisir la voix audio
│   └── Étape 3 : Connecter Telegram
│
└── /dashboard (dashboard unifié — remplace les 4 pages)
    ├── Section : Sources (liste + ajout inline)
    ├── Section : Résumés (feed audio)
    └── Section : Livraison (Telegram + voix)
```

### Pages supprimées
- `/dashboard/channels` → fusionné dans `/dashboard`
- `/dashboard/settings` → fusionné dans `/dashboard`

### Pages conservées
- `/dashboard/billing` → conservée (logique Stripe complexe)

---

## 3. Modèle de données : Sources

Le renommage `channels` → `sources` prépare l'extensibilité.

### Type `Source`
```ts
type SourceType = "youtube_channel" | "youtube_playlist" // futur: "podcast" | "newsletter"

type Source = {
  id: string
  user_id: string
  source_type: SourceType
  external_id: string          // channel_id ou playlist_id
  name: string
  avatar_url: string | null
  active: boolean
  created_at: string
}
```

### Migration DB
La table `subscriptions` existante est conservée avec ajout de :
- `source_type` (text, default: 'youtube_channel')

Aucune donnée existante n'est perdue. Migration non-destructive.

---

## 4. Parcours utilisateur cible

```
T+0   →  Landing page
          CTA : "Commencer gratuitement" → Google OAuth direct
          (pas de redirect vers /login séparé)

T+1   →  Authentification Google (OAuth standard)

T+1   →  /onboarding (wizard — si premier login)
          Étape 1 : Ajouter une source (obligatoire pour continuer)
          Étape 2 : Choisir sa voix audio
          Étape 3 : Connecter Telegram (non-bloquant)

T+3   →  /dashboard (état initial post-wizard)
          Sources : 1 source ajoutée, visible
          Résumés : "En attente du premier résumé..."
          Livraison : Telegram connecté OU "Connecter plus tard"

T+X   →  Résumé reçu sur Telegram + visible dans le feed
```

**Durée estimée setup complet : 2-3 minutes** (vs 6-7 minutes actuellement)

---

## 5. Spécifications : Wizard d'onboarding

### Route
`/onboarding` — Page protégée (requiert auth), redirect vers `/dashboard` si déjà onboardé.

### Condition d'affichage
Montré uniquement si `profiles.onboarding_completed = false` (nouveau champ).

### Layout
- Full-screen centré
- Indicateur de progression en haut (3 points/barres)
- Bouton "Passer" disponible à chaque étape sauf étape 1
- Bouton "Retour" disponible à partir de l'étape 2
- Persistance : si l'utilisateur ferme, reprend à l'étape en cours

---

### Étape 1 — Ajouter une source

**Objectif :** Que l'utilisateur ajoute au moins une source avant de continuer.

**Contenu :**
```
Titre :       "Quelle chaîne veux-tu suivre ?"
Sous-titre :  "Colle un lien YouTube ou cherche une chaîne"

Composant :   [Input] + [Bouton "Ajouter"]
              Ou : [Bouton "Importer depuis YouTube"]

État vide :   Bouton "Continuer" désactivé
État rempli : Affiche la source ajoutée (avatar + nom)
              Bouton "Continuer" activé
```

**Comportement :**
- L'input accepte : URL youtube.com/@channel, URL youtube.com/channel/ID, ID brut
- La détection de type (chaîne vs playlist) est automatique à partir de l'URL
  - `youtube.com/@` ou `youtube.com/channel/` → `youtube_channel`
  - `youtube.com/playlist?list=` → `youtube_playlist`
- Feedback immédiat après ajout : avatar + nom affichés, badge "Ajouté"
- L'utilisateur peut ajouter plusieurs sources avant de continuer
- "Continuer" n'est actif que si au moins 1 source ajoutée

**États de l'input :**
- Default : placeholder "youtube.com/@mkbhd"
- Loading : spinner, input désactivé
- Success : input vidé, source affichée sous le formulaire
- Error : message d'erreur sous l'input, input reste actif

---

### Étape 2 — Choisir la voix audio

**Objectif :** Personnaliser l'expérience audio.

**Contenu :**
```
Titre :       "Dans quelle langue veux-tu tes résumés ?"
Sous-titre :  "Tu pourras changer ça à tout moment"

Composant :   Grille de boutons voix (comme dans settings actuel)
              + Bouton [▶ Écouter un exemple] par voix

Bouton :      "Continuer →"
Lien :        "Passer" (applique la voix par défaut)
```

**Comportement :**
- La voix sélectionnée est sauvegardée immédiatement
- L'exemple audio joue un extrait de ~5 secondes
- La voix par défaut (fr-FR-DeniseNeural) est pré-sélectionnée

---

### Étape 3 — Connecter Telegram

**Objectif :** Connecter le canal de livraison.

**Contenu :**
```
Titre :       "Connecte Telegram pour recevoir tes résumés"
Sous-titre :  "Tes résumés audio seront envoyés automatiquement"

Instructions :
  1. Clique sur le bouton ci-dessous
  2. Dans Telegram, appuie sur "Démarrer"
  3. Reviens ici — la connexion se fait automatiquement

Composant :   [Bouton bleu Telegram "Ouvrir BriefTubeBot"]
              + Indicateur de polling : "En attente de connexion..."
              (spinner discret)

Bouton :      "Aller au dashboard →" (activé immédiatement si connecté)
Lien :        "Passer — je connecterai plus tard"
              (texte : "Tu recevras quand même tes résumés ici")
```

**Comportement :**
- Le token Telegram est généré automatiquement à l'arrivée sur cette étape (pas besoin de cliquer "Générer")
- Polling Supabase toutes les 3 secondes sur `profiles.telegram_connected`
- Dès que `telegram_connected = true` :
  - Le spinner s'arrête
  - Affiche une icône de succès verte
  - Le bouton "Continuer" s'active avec label "C'est parti !"
  - Transition automatique vers le dashboard après 2 secondes
- Si l'utilisateur clique "Passer" :
  - `profiles.onboarding_completed = true`
  - Redirect vers `/dashboard`
  - Une bannière inline dans le dashboard rappelle de connecter Telegram (une fois, dismissable)

---

## 6. Spécifications : Dashboard unifié

### Route
`/dashboard` — Remplace toutes les sous-pages sauf `/dashboard/billing`.

### Layout général

```
┌──────────────────────────────────────────────────────────┐
│  HEADER                                                   │
│  "BriefTube"           [plan badge]  [Passer à Pro?]     │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  SECTION : MES SOURCES                                   │
│  ─────────────────────────────────────────────────────   │
│  [Liste des sources] + [+ Ajouter une source]            │
│                                                           │
│  SECTION : RÉSUMÉS RÉCENTS                               │
│  ─────────────────────────────────────────────────────   │
│  [Feed des résumés audio]                                │
│                                                           │
│  SECTION : LIVRAISON                                     │
│  ─────────────────────────────────────────────────────   │
│  [Statut Telegram] [Sélection voix]                      │
│                                                           │
├──────────────────────────────────────────────────────────┤
│  NAVIGATION MOBILE (bottom bar existante)                 │
│  [Dashboard] [Sources] [Résumés] [Profil]               │
└──────────────────────────────────────────────────────────┘
```

### Header
- Logo BriefTube (lien vers `/`)
- Badge plan : `Free` (gris), `Pro Trial — X jours` (orange), `Pro` (rouge)
- Bouton "Passer à Pro" visible uniquement en plan Free post-trial
- Lien vers `/dashboard/billing`

### Comportement
- Server Component principal (SSR)
- Les sections Sources et Livraison sont des Client Components pour les interactions
- La section Résumés peut être Server Component avec Suspense

---

## 7. Spécifications : Modale "Ajouter une source"

### Déclencheur
- Bouton "+ Ajouter une source" dans la section Sources du dashboard
- Bouton "+ Ajouter" dans le wizard (étape 1)

### Contenu

```
Titre :   "Ajouter une source"

Input :   [🔍 Colle un lien YouTube...]
          Placeholder : "youtube.com/@chaîne, playlist, ..."

Détection automatique :
  ┌─────────────────────────────────────────────────────┐
  │ [icône chaîne] Chaîne YouTube                       │
  │ MKBHD — 18M abonnés                                 │
  │                                      [Ajouter ✓]   │
  └─────────────────────────────────────────────────────┘

  OU (futur — playlists) :
  ┌─────────────────────────────────────────────────────┐
  │ [icône playlist] Playlist YouTube                   │
  │ "Best of Kurzgesagt — 24 vidéos"                   │
  │                                      [Ajouter ✓]   │
  └─────────────────────────────────────────────────────┘

Import :  [Importer depuis YouTube →]
          (ouvre le flow OAuth YouTube existant)
```

### Comportement
- Utilise `dialogManager.custom()` (pattern existant du projet)
- La détection du type se fait dès que l'URL est valide (debounce 300ms)
- Preview de la source affichée avant confirmation (avatar + nom + type)
- "Ajouter" déclenche `POST /api/subscriptions`
- Succès : modale se ferme, source apparaît dans la liste avec animation
- Erreur : message sous l'input, modale reste ouverte

### Types d'URL acceptés (regex)
```
youtube_channel :
  - https://www.youtube.com/@{handle}
  - https://www.youtube.com/channel/{id}
  - {id} brut (24 caractères)

youtube_playlist (futur) :
  - https://www.youtube.com/playlist?list={id}
```

---

## 8. Spécifications : Composant Sources

### Localisation
Section 1 du dashboard unifié.

### État vide
```
┌─────────────────────────────────────────────┐
│                                             │
│  [icône Sources]                            │
│  "Aucune source pour l'instant"             │
│  "Ajoute une chaîne YouTube pour commencer" │
│                                             │
│  [+ Ajouter une source]                     │
│                                             │
└─────────────────────────────────────────────┘
```

### État avec sources
```
┌──────────────────────────────────────────────────────┐
│  MES SOURCES                    [+ Ajouter]          │
│  ────────────────────────────────────────────────    │
│  [avatar] MKBHD              Chaîne  [···]           │
│  [avatar] Veritasium         Chaîne  [···]           │
│  [avatar] Best of Kurzgesagt Playlist [···] (futur)  │
└──────────────────────────────────────────────────────┘
```

### Ligne source
- Avatar (image ou initiale)
- Nom de la source
- Badge de type (`Chaîne` ou `Playlist`)
- Menu contextuel `[···]` :
  - "Voir sur YouTube →" (ouvre dans un nouvel onglet)
  - "Supprimer" (confirmation via `dialogManager.confirm()`)

### Limite Free
- Affiche `2/5 sources` dans le header de la section
- Quand la limite est atteinte, le bouton "+ Ajouter" est remplacé par un banner inline :
  ```
  "Limite atteinte (5/5) — Passer à Pro pour sources illimitées [→]"
  ```

---

## 9. Spécifications : Composant Résumés

### Localisation
Section 2 du dashboard unifié.

### État vide (aucune source)
```
"Ajoute une source pour recevoir tes premiers résumés"
```

### État vide (sources ajoutées, pas encore de résumé)
```
[icône horloge]
"Ton premier résumé arrive bientôt"
"BriefTube surveille tes sources et te notifiera dès qu'une nouvelle vidéo est résumée."
```

### État avec résumés
```
┌──────────────────────────────────────────────────────────┐
│  RÉSUMÉS RÉCENTS                                         │
│  ──────────────────────────────────────────────────────  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ [avatar] MKBHD · il y a 2h                        │  │
│  │ "The best smartphones of 2025, ranked"            │  │
│  │ [▶ Écouter — 4min 23s]                            │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ [avatar] Veritasium · il y a 5h                   │  │
│  │ "Why does math work?"                             │  │
│  │ [▶ Écouter — 6min 01s]                            │  │
│  └────────────────────────────────────────────────────┘  │
│  [Voir plus]                                             │
└──────────────────────────────────────────────────────────┘
```

### Lecteur audio inline
- Bouton play/pause
- Barre de progression cliquable
- Durée totale affichée
- Un seul résumé joue à la fois (pause les autres)

---

## 10. Spécifications : Composant Livraison

### Localisation
Section 3 du dashboard unifié (en bas, moins visible — c'est du paramétrage).

### Layout
```
┌──────────────────────────────────────────────────────┐
│  LIVRAISON                                           │
│  ──────────────────────────────────────────────────  │
│  Telegram                                            │
│  [● Connecté]  ou  [○ Non connecté — Connecter →]   │
│                                                      │
│  Voix audio                                          │
│  [Denise (Français) ▼]  ← select compact            │
└──────────────────────────────────────────────────────┘
```

### Telegram — État connecté
```
[● vert] Connecté
[Déconnecter]  (confirmation via dialogManager)
```

### Telegram — État non connecté
```
[○] Non connecté
[Connecter Telegram →]  → ouvre une modale inline (pas de navigation)
```

**Modale de connexion Telegram :**
- Génère le token automatiquement
- Affiche le bouton "Ouvrir BriefTubeBot"
- Polling live toutes les 3 secondes
- Auto-fermeture à la connexion avec toast succès

### Voix audio
- Select compact (pas la grille complète des settings)
- Changement sauvegardé immédiatement
- Toast de confirmation

---

## 11. États et gestion des erreurs

### États globaux du dashboard

| Condition | Affichage |
|---|---|
| Chargement initial | Squelettes (skeleton) dans chaque section |
| Sources vides | Empty state avec CTA "Ajouter" |
| Résumés vides + sources actives | "En attente du premier résumé..." |
| Telegram non connecté | Bannière dismissable en haut (une fois) |
| Essai Pro expirant | Bannière "X jours restants" au-dessus des sources |
| Limite sources atteinte | Banner inline dans la section Sources |

### Gestion des erreurs API

| Erreur | Comportement |
|---|---|
| Ajout source échoue | Toast erreur + modale reste ouverte |
| URL invalide | Message sous l'input, pas de toast |
| Chaîne introuvable | "Chaîne introuvable. Vérifie l'URL." |
| Limite atteinte | "Limite atteinte. Passe à Pro pour plus." |
| Erreur réseau | Toast générique "Une erreur est survenue. Réessaie." |

---

## 12. Responsive & mobile

### Bottom navigation (existante)
Conserver les 4 onglets existants, mais adapter les labels :
- Overview → Home (icône maison)
- Channels → Sources (icône liste)
- Settings → livraison inline, donc Settings peut pointer vers Billing
- Billing → Billing (icône carte)

### Mobile — Dashboard
- Les 3 sections empilées verticalement
- La section Livraison est scrollable (en bas, peu critique)
- Le header de chaque section est sticky à l'intérieur de sa zone

### Mobile — Wizard
- Full-screen
- Clavier numérique évité (pas de champ numéro de téléphone)
- Boutons full-width en bas

---

## 13. Navigation : Simplification

### Avant
```
/dashboard
/dashboard/channels   ← supprimé (fusionné)
/dashboard/settings   ← supprimé (fusionné)
/dashboard/billing    ← conservé
/dashboard/summaries  ← supprimé (fusionné dans /dashboard)
```

### Après
```
/onboarding           ← nouveau
/dashboard            ← dashboard unifié
/dashboard/billing    ← conservé
```

### Redirections à mettre en place
```
/dashboard/channels  → /dashboard
/dashboard/settings  → /dashboard
/dashboard/summaries → /dashboard
```

---

## 14. Extensibilité future

### Playlists YouTube
Aucune refonte nécessaire :
1. Ajouter la détection `youtube.com/playlist?list=` dans la modale
2. Ajouter `source_type = 'youtube_playlist'` dans l'API
3. Afficher le badge `Playlist` dans la liste des sources
4. Adapter le worker Python pour monitorer des playlists

### Autres types de sources (futur)
La modale "Ajouter une source" peut s'enrichir avec de nouveaux types détectés automatiquement à partir de l'URL, sans modifier le reste du dashboard.

### Canaux de livraison supplémentaires (futur)
La section Livraison peut accueillir d'autres destinations (Email, Discord, WhatsApp) en ajoutant des lignes dans la section existante — sans refonte de l'architecture.

---

## 15. Fichiers impactés & plan de migration

### Nouveaux fichiers
```
app/onboarding/
  page.tsx                    ← wizard principal
  layout.tsx                  ← layout full-screen sans nav

src/components/dashboard/
  sources-section.tsx         ← section Sources du dashboard
  delivery-section.tsx        ← section Livraison
  add-source-modal.tsx        ← modale ajout source unifiée
  telegram-connect-modal.tsx  ← modale connexion Telegram inline
```

### Fichiers modifiés
```
app/dashboard/page.tsx        ← dashboard unifié (3 sections)
app/dashboard/layout.tsx      ← ajouter redirect /onboarding si !onboarding_completed
src/lib/supabase/server.ts    ← aucun changement
```

### Fichiers supprimés (après migration)
```
app/dashboard/channels/page.tsx   ← contenu migré dans sources-section.tsx
app/dashboard/settings/page.tsx   ← contenu migré dans delivery-section.tsx
app/dashboard/summaries/page.tsx  ← déjà un redirect, à supprimer
```

### Migration base de données
```sql
-- Ajout du champ onboarding_completed
ALTER TABLE profiles ADD COLUMN onboarding_completed boolean DEFAULT false;

-- Marquer les utilisateurs existants comme onboardés
UPDATE profiles SET onboarding_completed = true WHERE created_at < NOW();

-- Ajout du type source (pour l'extensibilité future)
ALTER TABLE subscriptions ADD COLUMN source_type text DEFAULT 'youtube_channel';
```

---

## Résumé des décisions clés

| Décision | Justification |
|---|---|
| Wizard `/onboarding` séparé | Ne pollue pas le dashboard, logique isolée |
| Token Telegram auto-généré | Supprime un clic inutile |
| Polling côté client (Telegram) | UX fluide sans rechargement de page |
| `dialogManager` pour les modales | Cohérent avec le pattern existant du projet |
| Sections inline vs pages | Réduit les navigations, contexte toujours visible |
| Concept "Sources" dès maintenant | Préparation playlists sans refonte future |
| Bottom nav conservée | Déjà implémentée, bon pattern mobile |
