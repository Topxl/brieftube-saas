---
stepsCompleted: [1, 2, 3, 4, 5, 6]
status: "complete"
inputDocuments:
  - "/home/vj/Bureau/Projets/BriefTube/_bmad-output/project-context.md"
  - "/home/vj/Bureau/Projets/BriefTube/package.json"
date: "2026-02-17"
author: "vin"
project_name: "BriefTube"
---

# Product Brief: BriefTube

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

BriefTube résout le problème de surcharge d'informations YouTube pour les utilisateurs multi-abonnés. Conçu initialement pour gérer 200+ chaînes YouTube sans perdre de temps ni rater de contenu, BriefTube automatise la création de résumés audio livrés directement sur Telegram. Ce qui commence comme un outil de productivité personnel évolue vers une plateforme communautaire où les utilisateurs créent et partagent des playlists curées de chaînes, transformant la consommation passive en découverte active de savoir.

**Proposition de Valeur:** Transformez la surcharge YouTube en savoir accessible grâce à des résumés audio automatiques livrés sur Telegram, avec playlists communautaires pour découvrir le meilleur contenu curé par vos pairs.

---

## Core Vision

### Problem Statement

Les utilisateurs YouTube actifs (200+ abonnements) font face à une surcharge d'informations impossible à gérer. Regarder toutes les vidéos publiées est irréaliste, mais rater du contenu génère de la frustration et du FOMO. Les solutions manuelles existantes (copier URLs → outils de transcription → lecture de résumés) sont chronophages et inefficaces, nécessitant ce processus pour des dizaines de vidéos quotidiennes, tout en ratant du contenu à cause de notifications manquantes.

### Problem Impact

**Impact Temps:** Plusieurs heures par jour perdues à trier et consommer du contenu manuellement

**Impact Psychologique:** Stress lié à la surcharge d'informations et culpabilité de rater du contenu pertinent

**Impact Opportunité:** Perte d'apprentissage et de veille dans des domaines d'intérêt multiples

**Utilisateurs Cibles:** Professionnels en veille technologique/business, créateurs de contenu suivant leur niche, passionnés multi-intérêts, toute personne abonnée à 50+ chaînes YouTube

### Why Existing Solutions Fall Short

Les solutions actuelles (apps de résumé YouTube, extensions navigateur) ne résolvent pas le problème de manière holistique:

- **Pas d'automatisation complète:** Requièrent intervention manuelle pour chaque vidéo
- **Pas de format audio mobile:** Résumés texte uniquement, impossible à consommer en multitâche
- **Pas d'intégration workflow:** Solutions isolées qui n'entrent pas dans le flux quotidien
- **Pas de dimension communautaire:** Chacun doit découvrir et trier seul ses sources

### Proposed Solution

BriefTube automatise entièrement le processus de veille YouTube:

1. **Automatisation Totale:** Surveillance continue de toutes les chaînes abonnées
2. **Résumés Audio Intelligents:** Génération automatique de résumés audio de qualité via IA
3. **Livraison Telegram:** Intégration dans un canal de communication quotidien (mobile-first)
4. **Écoute Partout:** Format audio permettant consommation pendant sport, déplacements, tâches routinières
5. **Playlists Communautaires:** Curation collaborative où les utilisateurs créent et partagent des collections de chaînes thématiques
6. **Découverte Facilitée:** Accès à des playlists curées par la communauté pour découvrir de nouveaux contenus pertinents

### Key Differentiators

**1. Automatisation Sans Friction**

- Zéro intervention manuelle après configuration initiale
- Plus aucune vidéo ratée grâce à la surveillance continue

**2. Audio-First sur Telegram**

- Intégration dans le flux de communication quotidien
- Consommation en multitâche (sport, conduite, cuisine, etc.)
- Mobile-native pour écoute partout

**3. Vision Communautaire (Unique)**

- Plateforme de curation collective de savoir
- Playlists créées et partagées par la communauté
- Effet réseau: plus d'utilisateurs = plus de playlists de qualité = plus de valeur
- Transformation de l'outil personnel en marketplace de connaissances

**4. Timing Optimal**

- IA/LLMs de haute qualité pour résumés pertinents
- Explosion du contenu YouTube (surcharge croissante)
- Adoption massive de Telegram comme canal de communication

**5. Développement Piloté par Utilisateurs**

- Projet en phase initiale permettant co-création avec early adopters
- Roadmap flexible basée sur feedback réel (ex: amélioration onboarding via screenshot des abonnements)

---

## Target Users

### Primary Users

**Persona 1: Le "Information Junkie" (Utilisateur Principal)**

**Profil:**

- Professionnel actif ou passionné multi-intérêts
- Abonné à 50-200+ chaînes YouTube
- Manque chronique de temps mais soif d'apprentissage
- Utilise Telegram quotidiennement
- Mode de vie actif (sport, déplacements, multitâche)

**Problème Vécu:**

- Reçoit des dizaines de nouvelles vidéos par jour
- Processus manuel actuel (copier URLs → transcription → lecture) prend plusieurs heures
- Rate du contenu malgré les efforts (notifications manquantes)
- Frustration et FOMO constant

**Besoin:**

- Automatisation totale de la veille YouTube
- Format audio pour écoute en multitâche
- Aucune vidéo ratée
- Intégration dans son workflow quotidien (Telegram)

**Success Criteria:**

- "Je ne rate plus aucune vidéo importante"
- "Je gagne 2-3 heures par jour"
- "Je peux écouter pendant mes activités quotidiennes"

---

**Persona 2: Le "Community Curator" (Utilisateur Secondaire)**

**Profil:**

- Expert dans un domaine spécifique (tech, business, design, etc.)
- Connaît les meilleures chaînes YouTube de sa niche
- Veut partager ses découvertes avec la communauté
- Aime organiser et structurer l'information

**Besoin:**

- Créer des playlists thématiques de chaînes YouTube
- Partager sa curation avec d'autres
- Être reconnu comme expert/curateur dans sa niche
- Découvrir ce que d'autres experts recommandent

**Success Criteria:**

- "Ma playlist est suivie par X personnes"
- "J'aide d'autres à découvrir du contenu de qualité"
- "Je découvre moi-même de nouvelles sources via les playlists communautaires"

---

### Secondary Users

**N/A** - Les deux personas ci-dessus couvrent les rôles principaux (consommateur + curateur)

---

### User Journey

**Phase 1: Découverte**

- Recherche de solution à la surcharge YouTube
- Découvre BriefTube via bouche-à-oreille, réseaux sociaux, ou recherche Google
- Lit la proposition de valeur: "résumés audio automatiques sur Telegram"

**Phase 2: Onboarding**

- S'inscrit sur la plateforme
- **Pain Point Actuel:** Doit ajouter manuellement chaque chaîne YouTube
- **Vision Future:** Onboarding simplifié (screenshot liste d'abonnements ou import automatique)
- Configure ses préférences (fréquence, longueur résumés, voix TTS)
- Connecte son compte Telegram

**Phase 3: Utilisation Quotidienne (Core Loop)**

- **Matin:** Reçoit résumés audio des nouvelles vidéos sur Telegram
- **Pendant la journée:** Écoute pendant sport, déplacements, tâches routinières
- **Fin de journée:** A consommé 10-20 résumés sans effort conscient
- **Découverte:** Explore les playlists communautaires pour trouver de nouvelles sources

**Phase 4: Moment "Aha!"**

- Réalise après 1 semaine: "J'ai consommé 100+ vidéos sans passer des heures devant l'écran"
- **Plus aucune vidéo ratée** + **gain de temps massif** + **intégration transparente**

**Phase 5: Usage Long-Terme & Engagement Communautaire**

- BriefTube devient partie intégrante de la routine quotidienne
- Commence à créer ses propres playlists pour partager ses découvertes
- Participe activement à la communauté de curation
- Recommande BriefTube à son réseau professionnel/amis

---

## Success Metrics

### User Success Metrics

**Indicateurs que le produit fonctionne pour les utilisateurs:**

**Gain de Temps (Objectif Principal):**

- Temps économisé par utilisateur: **2-3 heures par jour**
- Nombre de vidéos consommées via BriefTube vs visionnage traditionnel: **10-20 résumés/jour**

**Engagement & Habitude:**

- Taux de complétion des résumés audio: **>60%** (indicateur d'utilité)
- Utilisateurs actifs quotidiens: **>80%** des utilisateurs inscrits
- Retention hebdomadaire: **>70%** (produit devient une habitude)

**Valeur Perçue:**

- "Moment Aha!": **<1 semaine** après onboarding
- Net Promoter Score (NPS): **>50** (recommandation forte)
- Taux de désabonnement mensuel: **<5%**

**Engagement Communautaire:**

- Utilisateurs qui explorent des playlists communautaires: **>40%**
- Utilisateurs qui créent des playlists: **>15%** (curateurs actifs)

---

### Business Objectives

**Phase 1 (3 mois) - Validation Produit:**

- **100 early adopters** utilisateurs actifs
- **Proof of value**: 80%+ rétention après 1 mois
- **Feedback loop**: 50+ retours utilisateurs pour amélioration onboarding
- **Validation technique**: Système stable gérant 1000+ résumés/jour

**Phase 2 (6-12 mois) - Croissance & Communauté:**

- **1000+ utilisateurs actifs**
- **100+ playlists communautaires** créées
- **Effet réseau**: 50%+ des nouveaux utilisateurs via playlists découvertes
- **Monétisation**: Lancement plan Pro avec 10%+ adoption

**Objectifs Long-Terme:**

- Devenir la **plateforme de référence** pour curation de savoir YouTube
- Effet réseau fort: communauté active de curateurs
- Modèle économique viable (freemium avec plan Pro)

---

### Key Performance Indicators (KPIs)

**KPIs d'Engagement Utilisateur:**

- **DAU/MAU ratio**: >30% (utilisation quotidienne forte)
- **Résumés écoutés par utilisateur/jour**: Moyenne >5
- **Taux de complétion audio**: >60%
- **Churn rate mensuel**: <5%

**KPIs de Croissance:**

- **Nouveaux utilisateurs/mois**: Croissance de 20%+ MoM
- **Channels trackés par utilisateur**: Moyenne >30
- **Viral coefficient**: >1.2 (croissance organique)

**KPIs Communautaires:**

- **Playlists créées/mois**: >20
- **Abonnements aux playlists**: Moyenne 10 abonnés par playlist
- **Curateurs actifs**: >15% de la base utilisateurs

**KPIs Business:**

- **MRR (Monthly Recurring Revenue)**: Croissance constante via plan Pro
- **Conversion Free→Pro**: >10% après 1 mois d'usage
- **LTV/CAC ratio**: >3:1
- **Coûts infrastructure/utilisateur**: <$2/mois

---

## MVP Scope

### Core Features (In Scope for MVP)

**1. Gestion des Abonnements YouTube**

- ✅ Inscription utilisateur avec authentification
- ✅ Ajout manuel de chaînes YouTube (par URL ou ID)
- ✅ Liste des chaînes abonnées avec gestion (ajouter/supprimer)
- ✅ Limite de chaînes par plan (Free: 5, Pro: illimité)

**2. Monitoring & Traitement Automatique**

- ✅ Surveillance continue des nouvelles vidéos sur chaînes abonnées
- ✅ Détection automatique de nouvelles publications
- ✅ Génération de résumés via IA (transcription + summarization)
- ✅ Conversion texte → audio (TTS)
- ✅ Stockage et gestion du statut de traitement

**3. Livraison Telegram**

- ✅ Connexion compte Telegram utilisateur
- ✅ Livraison automatique des résumés audio sur Telegram
- ✅ Configuration de la voix TTS (préférences utilisateur)
- ✅ Notification push pour nouvelles vidéos traitées

**4. Système de Billing**

- ✅ Plan Free (5 chaînes max)
- ✅ Plan Pro (chaînes illimitées + traitement prioritaire)
- ✅ Intégration Stripe pour abonnements
- ✅ Gestion du cycle de vie des subscriptions

**5. Dashboard Utilisateur**

- ✅ Aperçu des chaînes abonnées
- ✅ Statistiques de base (nombre de résumés reçus)
- ✅ Gestion du profil et préférences
- ✅ État de connexion Telegram

---

### Out of Scope for MVP

**Reporté en Version 2.0+ (Post-MVP):**

❌ **Playlists Communautaires**

- Création/partage de playlists de chaînes
- Marketplace de playlists curées
- Système de réputation pour curateurs
- **Raison:** Feature complexe, nécessite masse critique d'utilisateurs d'abord

❌ **Onboarding Avancé**

- Import via screenshot de liste d'abonnements
- Connexion Google/YouTube pour import automatique
- **Raison:** MVP peut fonctionner avec onboarding manuel, optimisation vient après validation

❌ **Analytics Avancées**

- Statistiques détaillées de consommation
- Insights sur types de contenu préférés
- Recommandations personnalisées
- **Raison:** Nice-to-have, pas essentiel pour la valeur principale

❌ **Features Sociales**

- Partage de résumés avec d'autres utilisateurs
- Commentaires/discussions sur résumés
- **Raison:** Focus MVP sur consommation individuelle d'abord

❌ **Personnalisation Avancée**

- Longueur de résumés ajustable
- Filtrage par thématiques
- Planification horaire de livraison
- **Raison:** Optimisation post-validation du produit

---

### MVP Success Criteria

**Critères de validation du MVP (Phase 1 - 3 mois):**

**Validation Technique:**

- ✅ Système stable traitant **1000+ résumés/jour** sans erreur
- ✅ Latence de traitement: **<30 minutes** par vidéo
- ✅ Taux de succès de livraison Telegram: **>95%**

**Validation Utilisateur:**

- ✅ **100 early adopters** utilisateurs actifs
- ✅ **Rétention 1 mois**: >80%
- ✅ **Engagement quotidien**: >70% des utilisateurs écoutent leurs résumés
- ✅ **NPS**: >40 (satisfaction forte)

**Validation Business:**

- ✅ **Feedback qualitatif**: 50+ retours utilisateurs pour roadmap
- ✅ **Conversion Pro**: >5% des utilisateurs passent au plan payant
- ✅ **Coûts sous contrôle**: <$2/utilisateur/mois
- ✅ **Signal croissance organique**: >20% des nouveaux users via recommandations

**Décision Go/No-Go:**
Si ces critères sont atteints après 3 mois → Investir dans Phase 2 (croissance + communauté)
Si non atteints → Pivoter ou ajuster la proposition de valeur

---

### Future Vision (Post-MVP)

**Version 2.0 - Plateforme Communautaire (6-12 mois):**

**Features Communautaires:**

- Création et partage de playlists de chaînes
- Marketplace de playlists curées par thématiques
- Système de follow pour curateurs populaires
- Badges et réputation pour contributeurs actifs

**Onboarding Optimisé:**

- Import automatique via screenshot (OCR + IA)
- Connexion Google/YouTube pour import direct des abonnements
- Onboarding en <2 minutes au lieu de processus manuel

**Personnalisation Avancée:**

- Longueur de résumés configurable (court/moyen/long)
- Filtrage intelligent par thématiques/mots-clés
- Planification horaire de livraison
- Multi-langue et voix TTS personnalisées

**Analytics & Insights:**

- Dashboard utilisateur avec statistiques détaillées
- Temps économisé calculé automatiquement
- Insights sur types de contenu les plus consommés
- Recommandations basées sur historique

**Expansion & Intégrations:**

- Support d'autres plateformes (Podcasts, Twitch, etc.)
- Intégrations tierces (Notion, Obsidian pour notes)
- API publique pour développeurs
- Apps mobiles natives (iOS/Android)

**Monétisation Évoluée:**

- Plan Pro+ avec features premium (résumés ultra-rapides, transcriptions complètes)
- Plans entreprise pour équipes
- Sponsorship de playlists populaires
