# 📧 Configuration Email - BriefTube

## 🔧 Mode Développement (Actuel)

**Sans clé Resend configurée**, les emails ne sont **pas envoyés** mais les **liens de vérification s'affichent dans les logs**.

### Comment voir les liens de vérification

1. **Démarrez le serveur** :
   ```bash
   pnpm dev
   ```

2. **Essayez de vous connecter/inscrire**

3. **Regardez les logs dans le terminal** :
   ```
   ================================================================================
   📧 EMAIL VERIFICATION LINK:
   ================================================================================
   http://localhost:3000/api/auth/verify-email?token=abc123...
   ================================================================================
   ```

4. **Copiez le lien et ouvrez-le** dans votre navigateur

✅ **C'est tout !** Pas besoin de recevoir un vrai email en développement.

---

## 🚀 Mode Production (Resend)

Pour envoyer de vrais emails en production :

### 1. Créer un compte Resend

1. Allez sur https://resend.com
2. Créez un compte (gratuit jusqu'à 100 emails/jour)
3. Ajoutez et vérifiez votre domaine

### 2. Obtenir votre clé API

1. Dashboard Resend → API Keys
2. Créez une nouvelle clé
3. Copiez la clé (format: `re_xxxxxxxxxxxxx`)

### 3. Configurer l'environnement

Éditez `.env.local` :

```bash
# Remplacez les placeholders par vos vraies valeurs
RESEND_API_KEY="re_votre_vraie_cle_ici"
EMAIL_FROM="noreply@votredomaine.com"
NEXT_PUBLIC_EMAIL_CONTACT="contact@votredomaine.com"
```

### 4. Redémarrer le serveur

```bash
pnpm dev
```

✅ Les emails seront maintenant envoyés via Resend !

---

## 🔍 Troubleshooting

### "Je ne vois pas les liens dans les logs"

**Vérifiez** :
- Le serveur dev tourne (`pnpm dev`)
- Les logs ne sont pas cachés (regardez le terminal)
- `RESEND_API_KEY` n'est pas configuré (sinon mode production activé)

### "Les emails Resend ne partent pas"

**Vérifiez** :
1. La clé API est valide (commence par `re_`)
2. Le domaine est vérifié sur Resend
3. `EMAIL_FROM` utilise le domaine vérifié
4. Les logs pour voir les erreurs Resend

### "Emails en spam"

**Solutions** :
1. Configurez SPF, DKIM, DMARC sur votre domaine
2. Utilisez un domaine vérifié (pas de placeholder)
3. Évitez les mots comme "test", "dev" dans les emails

---

## 📊 Configuration actuelle

```bash
Mode: Développement
Email adapter: Console (logs uniquement)
Resend: Non configuré (placeholder)
```

Pour voir les liens de vérification → Regardez les logs du terminal `pnpm dev`

---

## 📚 Ressources

- [Documentation Resend](https://resend.com/docs)
- [Better Auth Email Setup](https://www.better-auth.com/docs/authentication/email-password)
- [Vérifier un domaine sur Resend](https://resend.com/docs/send-with-domains)
