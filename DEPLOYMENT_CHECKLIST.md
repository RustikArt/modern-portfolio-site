# ✅ CHECKLIST PRÉ-DÉPLOIEMENT

## 🔒 SÉCURITÉ & CONFIGURATION

### Env Variables
- [ ] `.env.local` créé
- [ ] Toutes les variables remplies
- [ ] Pas d'espaces supplémentaires
- [ ] Format correct:
  - `NEXT_PUBLIC_SUPABASE_URL=https://...`
  - `STRIPE_SECRET_KEY=sk_live_...`

### Code Sécurisé
- [ ] Pas de clés hardcodées en code
- [ ] Vérifier: `grep -r "eyJhbGciOiJIUzI1NiIs" src/ api/` (aucun résultat)
- [ ] `.gitignore` contient `.env*`
- [ ] Jamais commité `.env`

### Vercel Env Vars
- [ ] Vercel Dashboard → Settings → Environment Variables
- [ ] Toutes les variables ajoutées (copié depuis `.env.local`)
- [ ] Aucune variable vide
- [ ] Format URLs: avec https://

---

## 🏗️ BUILD & CODE

### Build Réussit
```bash
npm run lint      # 0 erreurs
npm run build     # Succès
npm run preview   # Pas d'erreurs console
```
- [ ] `npm run lint` = aucune erreur
- [ ] `npm run build` = succès (dist/ créé)
- [ ] `npm run preview` = site fonctionne

### Code Quality
- [ ] Pas d'erreurs console en dev (F12)
- [ ] Pas d'erreurs console en preview (F12)
- [ ] Aucun TODO/FIXME critique
- [ ] Endpoints API respondent

---

## 🧪 FONCTIONNALITÉS TESTÉES

### Authentification
- [ ] Signup fonctionne
- [ ] Données sauvegardées en Supabase
- [ ] Login réussit
- [ ] Logout fonctionne
- [ ] Admin role fonctionne

### E-commerce
- [ ] Shop page charge produits
- [ ] Product detail fonctionne
- [ ] Add to cart fonctionne
- [ ] Cart affiche items corrects
- [ ] Remove from cart fonctionne

### Checkout
- [ ] Remplir shipping details
- [ ] Promo code applique réduction
- [ ] Total correct (avec/sans promo)
- [ ] Bouton "Procéder au paiement" visible

### Stripe Payment
```
Test Card: 4242 4242 4242 4242
Expiry: Any future date (12/25)
CVC: Any 3 digits (123)
```
- [ ] Modal Stripe apparaît
- [ ] Paiement accepté
- [ ] Redirected vers /checkout?success=true
- [ ] Success modal affiche
- [ ] Commande créée en Supabase

### Données
- [ ] Supabase: portfolio_products a 5+ items
- [ ] Supabase: portfolio_users contient user créé
- [ ] Supabase: portfolio_orders contient commande
- [ ] Fallback data si API down

---

## 🌐 VERCEL DEPLOYMENT

### Configuration Vercel
- [ ] Framework: Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Install command: `npm install`

### Avant Deploy
```bash
git status          # Aucun change non-commité
git log --oneline   # Voir commits
npm run build       # Dernier test
```
- [ ] Tous les fichiers committé en git
- [ ] Aucun `.env` commité
- [ ] Dernier build réussit

### Deployment
```bash
git push origin main
# ou
vercel deploy --prod
```
- [ ] Push vers main ou `vercel deploy`
- [ ] Vercel build log = succès
- [ ] Pas d'erreurs dans build logs

---

## 🔍 VÉRIFICATION POST-DEPLOY

### Site Accessible
- [ ] https://your-domain.vercel.app charge
- [ ] Pas de 404
- [ ] Pas d'erreur console (F12)

### Env Vars Chargent
```javascript
// Console F12:
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
// Doit afficher votre URL Supabase
```
- [ ] Supabase URL chargée (pas undefined)
- [ ] Stripe key chargée
- [ ] EmailJS keys chargées

### Fonctionnalités Prod
- [ ] Signup en prod fonctionne
- [ ] Login fonctionne
- [ ] Shop fonctionne
- [ ] Stripe paiement fonctionne (mode LIVE!)
- [ ] Commandes créées en Supabase

### Logs Propres
```bash
vercel logs --prod
```
- [ ] Pas d'erreurs rouges
- [ ] Pas de "credentials missing"
- [ ] Pas d'erreurs API

---

## 📋 FINAL CHECKLIST

Si TOUS les ☑️ sont cochés:

✅ **DÉPLOIEMENT RÉUSSI!**

```
[ ] Sécurité OK (env vars, pas de clés)
[ ] Build OK
[ ] Tests locaux OK
[ ] Vercel env vars OK
[ ] Vercel deploy OK
[ ] Production fonctionne
[ ] Logs propres
[ ] Flux paiement OK
```

---

## 🆘 PROBLÈMES COURANTS

| Problème | Solution |
|----------|----------|
| Build Vercel échoue | Vérifier `npm run build` en local |
| Env vars undefined | Redémarrer Vercel? Vérifier Dashboard |
| Stripe error | Mode LIVE? Format key? |
| Supabase error | RLS policies? Service role key? |
| 404 Pages | Vérifier vercel.json rewrites |

---

**Prêt?** Allez-y! 🚀

Besoin d'aide? Consultez:
- [SETUP_ENV.md](SETUP_ENV.md) - Instructions détaillées
- [README_FR.md](README_FR.md) - Vue d'ensemble
