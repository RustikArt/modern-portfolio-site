# 🇫🇷 DÉMARRAGE RAPIDE

## ✅ Les Corrections Sont Appliquées!

Vos fichiers critiques ont été sécurisés:
- ✅ Clés Supabase supprimées du code
- ✅ Clé Stripe sécurisée (backend seulement)
- ✅ `.env.example` créé avec tous les paramètres
- ✅ `vite.config.js` configuré
- ✅ CORS sécurisé

---

## 🚀 EN 3 ÉTAPES (10 minutes)

### 1️⃣ Configuration Locale
```bash
# Copier le template
cp .env.example .env.local

# Ouvrir .env.local et remplir avec VOS vraies clés:
# NEXT_PUBLIC_SUPABASE_URL = https://...
# SUPABASE_SERVICE_ROLE_KEY = eyJh...
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_...
# STRIPE_SECRET_KEY = sk_live_...
# etc.
```

**Où obtenir les clés:**
- Supabase: https://supabase.com/dashboard
- Stripe: https://dashboard.stripe.com/apikeys
- EmailJS: https://dashboard.emailjs.com/

### 2️⃣ Test Local
```bash
npm install
npm run dev
# http://localhost:5173 s'ouvre
# Tester: Inscription → Connexion → Boutique → Paiement
```

### 3️⃣ Déployer
```bash
# Ajouter env vars dans Vercel Dashboard:
# Settings → Environment Variables
# (Copier depuis votre .env.local)

vercel deploy --prod
```

---

## 📖 Documentation Recommandée

**Lisez dans cet ordre:**

1. **[README_FR.md](README_FR.md)** - Vue d'ensemble (5 min)
2. **[SETUP_ENV.md](SETUP_ENV.md)** - Instructions détaillées (10 min)
3. **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Avant de déployer
4. **[SUMMARY.md](SUMMARY.md)** - Résumé avec checklists

---

## ✅ Fichiers Clés

### Configurations
```
.env.example          ✅ Template env vars
config.js             ✅ Configuration externalisée
vite.config.js        ✅ Expose env vars au client
```

### API (Sécurisée)
```
api/products.js       ✅ Clés supprimées
api/users.js          ✅ Clés supprimées
api/orders.js         ✅ Clés supprimées
api/projects.js       ✅ Clés supprimées
api/promo-codes.js    ✅ Clés supprimées
api/create-checkout-session.js ✅ Stripe fixé
```

### Utilitaires
```
src/utils/normalization.js  ✅ Conversion données
src/utils/apiHelpers.js     ✅ Gestion erreurs
```

---

## ⚠️ IMPORTANT

Ne JAMAIS commiter `.env` ou `.env.local`:
```bash
# Vérifier .gitignore contient:
# .env
# .env.local
# .env.*.local
```

---

## 🆘 Besoin d'Aide?

1. Env vars ne chargent pas?
   - Redémarrer: `npm run dev`

2. Build échoue?
   - Taper: `npm run build --verbose`

3. Stripe error?
   - Vérifier format keys: `pk_live_...` ou `sk_live_...`

4. Plus de détails?
   - Lire [README_FR.md](README_FR.md)

---

**C'est tout!** Vous êtes prêt à déployer. 🚀
