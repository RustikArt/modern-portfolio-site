# Guide de Déploiement - Rustikop Website

## 🚀 Déploiement sur Vercel

Ce guide vous explique comment déployer votre site web sur Vercel de manière sécurisée.

### Prérequis

- Un compte Vercel (https://vercel.com)
- Git installé sur votre machine
- Les clés API Stripe et EmailJS

### Étape 1 : Préparer votre dépôt Git

```bash
# Initialiser le dépôt Git (si ce n'est pas déjà fait)
git init

# Ajouter les fichiers
git add .

# Commit initial
git commit -m "Initial commit: Rustikop website"

# Ajouter le dépôt distant (remplacez par votre URL)
git remote add origin https://github.com/votre-username/rustikop-website.git

# Pousser vers GitHub
git branch -M main
git push -u origin main
```

### Étape 2 : Configurer les variables d'environnement sur Vercel

1. Allez sur https://vercel.com/dashboard
2. Créez un nouveau projet ou sélectionnez un existant
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez les variables suivantes :

```
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_ORDER_TEMPLATE_ID=your_order_template_id
VITE_EMAILJS_TEMPLATE_ID=your_contact_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
EMAILJS_PRIVATE_KEY=your_private_key

VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_SECRET_KEY=sk_live_your_key

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

ALLOWED_ORIGINS=https://rustikop.vercel.app,https://www.rustikop.vercel.app
```

### Étape 3 : Déployer

**Option A : Déploiement automatique via GitHub**

1. Connectez votre dépôt GitHub à Vercel
2. Chaque push sur `main` déploiera automatiquement

**Option B : Déploiement manuel via CLI**

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel

# Déployer en production
vercel --prod
```

### Étape 4 : Vérifier le déploiement

1. Visitez votre URL Vercel
2. Vérifiez que tous les éléments se chargent correctement
3. Testez les formulaires de contact
4. Testez le processus de paiement Stripe

## 🔒 Sécurité

### Points importants

1. **Variables d'environnement** : Ne commitez jamais le fichier `.env` avec vos clés réelles
2. **CORS** : Les domaines autorisés sont configurés dans `api/middleware.js`
3. **Rate limiting** : Les endpoints API ont un rate limiting pour prévenir les abus
4. **Validation** : Toutes les données sont validées côté serveur

### Régénérer les clés compromises

Si vous avez accidentellement exposé vos clés :

1. **Stripe** : Allez dans Dashboard → Developers → API Keys → Régénérez les clés
2. **EmailJS** : Allez dans Account → Security → Régénérez les clés
3. **Supabase** : Allez dans Project Settings → API → Régénérez les clés

## 📊 Monitoring

### Logs Vercel

```bash
# Voir les logs en temps réel
vercel logs --follow

# Voir les logs de production
vercel logs --prod
```

### Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| 500 Internal Server Error | Variables d'environnement manquantes | Vérifiez les variables sur Vercel |
| 429 Too Many Requests | Rate limiting déclenché | Attendez ou augmentez la limite |
| CORS Error | Domaine non autorisé | Ajoutez le domaine dans `ALLOWED_ORIGINS` |
| Stripe Error | Clé invalide | Vérifiez la clé dans les variables |

## 🔄 Mise à jour

Pour mettre à jour le site :

```bash
# Faire vos modifications
git add .
git commit -m "Description des changements"
git push origin main

# Vercel déploiera automatiquement
```

## 📞 Support

Pour toute question, contactez : rustikop@outlook.fr

## 📝 Checklist de déploiement

- [ ] Toutes les variables d'environnement sont configurées
- [ ] Les clés Stripe sont en mode LIVE
- [ ] Les clés EmailJS sont correctes
- [ ] Le domaine est configuré dans ALLOWED_ORIGINS
- [ ] Les tests de paiement passent
- [ ] Les emails de contact fonctionnent
- [ ] Le site est accessible publiquement
- [ ] Les performances sont acceptables
- [ ] Les erreurs sont loggées correctement
