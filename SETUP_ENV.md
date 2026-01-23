# 📋 CONFIGURATION - LOCAL & VERCEL

## 🖥️ DÉVELOPPEMENT LOCAL

### Étape 1: Copier Template
```bash
cd modern-portfolio-site
cp .env.example .env.local
```

### Étape 2: Remplir .env.local

Ouvrez `.env.local` et ajoutez vos vraies clés:

#### Supabase
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs... # GARDEZ SECRET!
```
**Où trouver:**
1. https://supabase.com/dashboard
2. Settings → API
3. Copy URL et Keys

#### Stripe
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx  # GARDEZ SECRET!
```
**Où trouver:**
1. https://dashboard.stripe.com/apikeys
2. Copy Publishable et Secret Keys

#### EmailJS
```env
VITE_EMAILJS_SERVICE_ID=service_xxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxx
```
**Où trouver:**
1. https://dashboard.emailjs.com/
2. Account → API Keys + Service/Template IDs

### Étape 3: Tester Localement
```bash
npm install
npm run dev
# http://localhost:5173 s'ouvre
```

**Checklist de test:**
- [ ] Pas d'erreur console (F12)
- [ ] Page d'accueil charge
- [ ] Inscription fonctionne
- [ ] Connexion fonctionne
- [ ] Shop affiche produits
- [ ] Panier fonctionne
- [ ] Stripe checkout fonctionne

---

## 🚀 PRODUCTION (VERCEL)

### Étape 1: Connecter Repository
```bash
vercel login
vercel
```

Suivez les prompts pour connecter votre repo GitHub.

### Étape 2: Ajouter Variables d'Environnement

**Via Vercel Dashboard:**
1. https://vercel.com/dashboard
2. Sélectionnez votre projet
3. Settings → Environment Variables
4. Ajouter chaque variable

**Variables à ajouter (copier depuis `.env.local`):**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
VITE_EMAILJS_SERVICE_ID
VITE_EMAILJS_TEMPLATE_ID
VITE_EMAILJS_PUBLIC_KEY
ALLOWED_ORIGINS=https://YOUR_DOMAIN.vercel.app
```

### Étape 3: Déployer
```bash
# Option A: Auto-deploy (recommandé)
git push origin main
# Vercel déploie automatiquement

# Option B: Deploy manuel
vercel deploy --prod
```

### Étape 4: Vérifier
```bash
# Voir les logs
vercel logs --prod

# Tester: https://your-domain.vercel.app
# Inscription → Login → Shop → Checkout
```

---

## ✅ Checklist Final

### Avant Déploiement
- [ ] `.env.local` créé et rempli
- [ ] `npm run build` réussit
- [ ] Test complet en local
- [ ] `.gitignore` contient `.env*`

### Après Ajout Vercel Env Vars
- [ ] Vercel Dashboard affiche toutes les variables
- [ ] Aucune variable vide
- [ ] Format URLs correct (https://...)
- [ ] Stripe keys en mode LIVE (pas TEST)

### Après Premier Déploiement
- [ ] Build Vercel réussi (pas d'erreur)
- [ ] Site charge sans erreur console (F12)
- [ ] Inscription fonctionne
- [ ] Paiement Stripe fonctionne
- [ ] Commandes sauvegardées en Supabase

---

## 🆘 TROUBLESHOOTING

### "Env vars missing" Error
```bash
# Solution:
1. Vérifier .env.local existe
2. Redémarrer dev server: npm run dev
3. Vérifier format: ne pas avoir d'espaces
```

### Stripe "Invalid API Key"
```bash
# Solution:
1. Vérifier pk_live_ (pas pk_test_)
2. Vérifier sk_live_ (pas sk_test_)
3. Format correct sans espaces
```

### Supabase 403 Forbidden
```bash
# Solution:
1. Vérifier RLS policies: Supabase Dashboard
2. Vérifier service_role key
3. Tables existent dans Supabase
```

### Build Échoue
```bash
# Solution:
npm run build --verbose  # Voir l'erreur
npm install             # Réinstaller dépendances
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📱 Variables d'Environnement Expliquées

| Variable | Type | Description |
|----------|------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | URL de votre instance Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Clé anonyme pour accès client |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Clé admin serveur (JAMAIS public) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public | Clé Stripe côté client |
| `STRIPE_SECRET_KEY` | Secret | Clé Stripe côté serveur |
| `VITE_EMAILJS_*` | Public | Clés EmailJS pour contact form |
| `ALLOWED_ORIGINS` | Config | Domaines autorisés (CORS) |

**Public** = Visible en client (ok)  
**Secret** = Serveur seulement (ne jamais exposer)

---

**Vous êtes prêt à déployer!** 🚀
