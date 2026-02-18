# Plan de Simplification BriefTube

## 🎯 Objectif

Simplifier l'architecture en gardant uniquement **Supabase Auth avec Google OAuth** et supprimer toute la complexité Better-Auth/Organizations.

## ✅ Étape 1 : Configuration Google OAuth (FAIT ✓)

**Pages créées :**

- ✅ `/app/login/page.tsx` - Page de login avec Google
- ✅ `/app/login/_components/google-login-button.tsx` - Bouton Google OAuth
- ✅ `/app/auth/callback/route.ts` - Callback OAuth

**À faire (Manuel) :**

1. Aller sur https://supabase.com/dashboard/project/zetpgbrzehchzxodwbps/auth/providers
2. Activer "Google" provider
3. Créer OAuth credentials sur https://console.cloud.google.com/apis/credentials
   - **Application type:** Web application
   - **Authorized redirect URIs:** `https://zetpgbrzehchzxodwbps.supabase.co/auth/v1/callback`
4. Copier Client ID et Client Secret dans Supabase

## 🗑️ Étape 2 : Fichiers/Dossiers à Supprimer

### A. Dossiers complets à supprimer

```bash
# Better-Auth pages
rm -rf app/orgs/
rm -rf app/admin/
rm -rf app/auth/signin/
rm -rf app/auth/signup/
rm -rf app/auth/forget-password/
rm -rf app/auth/confirm-delete/
rm -rf app/(logged-in)/

# Prisma (non utilisé)
rm -rf prisma/
rm -rf src/generated/

# Organisation features
rm -rf src/features/organization/
rm -rf src/lib/organizations/
rm -rf src/query/org/

# Auth ancien système
rm -rf src/lib/auth/
rm src/lib/auth.ts
rm src/lib/auth-client.ts

# Hooks organisation
rm src/hooks/use-current-org.ts
```

### B. Fichiers individuels à supprimer

```bash
# Actions organisations
rm src/features/plans/plans.action.ts
rm src/features/billing/user-billing.action.ts
rm app/orgs/[orgSlug]/(navigation)/settings/billing/billing.action.ts

# Composants Better-Auth
rm src/features/auth/auth-button.tsx
rm src/features/auth/auth-button-client.tsx
rm src/features/auth/user-dropdown*.tsx

# Dialogs organisation
rm src/features/global-dialog/org-plan-dialog.tsx

# Migrations Prisma
rm prisma/migrate-billing-to-users.ts

# Proxy complexe
rm proxy.ts
```

### C. Dépendances à retirer (package.json)

```json
{
  "dependencies": {
    // À RETIRER :
    "better-auth": "^1.4.7",
    "@prisma/adapter-pg": "^7.1.0",
    "@prisma/client": "^7.1.0",
    "@prisma/client-runtime-utils": "^7.1.0",
    "pg": "^8.16.3",
    "ioredis": "^5.8.2"
  },
  "devDependencies": {
    // À RETIRER :
    "prisma": "^7.1.0"
  }
}
```

## 🔨 Étape 3 : Simplifier le Billing (Supabase uniquement)

### A. Créer actions Supabase simples

**Fichier:** `app/dashboard/billing/_actions/stripe.action.ts`

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function createCheckoutSession(planId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const session = await stripe.checkout.sessions.create({
    customer: profile?.stripe_customer_id,
    mode: "subscription",
    line_items: [{ price: planId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing`,
  });

  return session.url;
}

export async function createPortalSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const session = await stripe.billingPortal.sessions.create({
    customer: profile!.stripe_customer_id!,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing`,
  });

  return session.url;
}
```

### B. Webhook Stripe simplifié

**Garder uniquement:** `app/api/webhooks/stripe/route.ts`
**Simplifier pour** chercher dans `profiles` au lieu de `organization`

## 📝 Étape 4 : Mettre à jour les routes

### A. Rediriger anciennes routes

**Fichier:** `next.config.ts`

```typescript
async redirects() {
  return [
    {
      source: '/orgs/:path*',
      destination: '/dashboard',
      permanent: true,
    },
    {
      source: '/auth/signin',
      destination: '/login',
      permanent: true,
    },
    {
      source: '/auth/signup',
      destination: '/login',
      permanent: true,
    },
  ];
}
```

### B. Simplifier middleware

**Supprimer** toute la logique organisation du middleware

## 🧹 Étape 5 : Nettoyer CLAUDE.md

Supprimer les sections :

- ❌ Multi-tenant Organizations
- ❌ Authentication (Better Auth)
- ❌ Organization-based data access patterns

Garder uniquement :

- ✅ Supabase Auth
- ✅ User-based billing
- ✅ Simplified routes

## 📊 Comparaison Avant/Après

### AVANT (Complexe)

```
Routes:
├─ /orgs/[slug]/settings/billing
├─ /orgs/[slug]/settings/members
├─ /orgs/[slug]/settings/danger
├─ /admin/organizations
├─ /admin/users
├─ /auth/signin (email/password/OAuth)
├─ /auth/signup
└─ /dashboard (Supabase)

Auth: Better-Auth + Supabase (2 systèmes)
DB: Prisma (organization, user, member) + Supabase (profiles)
```

### APRÈS (Simple)

```
Routes:
├─ /login (Google uniquement)
├─ /dashboard
├─ /dashboard/billing
├─ /dashboard/channels
└─ /dashboard/settings

Auth: Supabase Auth (Google OAuth)
DB: Supabase (profiles uniquement)
```

## ✅ Checklist d'Exécution

### Phase 1 : Configuration Google OAuth

- [ ] Configurer Google OAuth sur Supabase Dashboard
- [ ] Tester la connexion avec Google
- [ ] Vérifier que le profil est créé automatiquement

### Phase 2 : Suppression fichiers

- [ ] Supprimer dossiers listés ci-dessus
- [ ] Supprimer fichiers individuels
- [ ] Retirer dépendances du package.json
- [ ] Run `pnpm install`

### Phase 3 : Simplifier billing

- [ ] Créer actions Stripe simplifiées
- [ ] Simplifier webhook Stripe
- [ ] Tester upgrade/cancel subscription

### Phase 4 : Routes

- [ ] Ajouter redirects dans next.config.ts
- [ ] Simplifier middleware
- [ ] Tester toutes les routes

### Phase 5 : Nettoyer

- [ ] Mettre à jour CLAUDE.md
- [ ] Mettre à jour README
- [ ] Run `pnpm clean`
- [ ] Run `pnpm test:ci`

## 🎉 Résultat Final

**Code supprimé :** ~15,000 lignes
**Complexité :** -80%
**Pages :** 50+ → 5
**Systèmes d'auth :** 2 → 1
**Base de données :** 2 → 1

**Expérience utilisateur :**
✅ Login en 1 clic (Google)
✅ Pas de mot de passe à retenir
✅ Interface simplifiée
✅ Moins de bugs potentiels
