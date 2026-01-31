# 📚 RUSTIKOP DOCUMENTATION

## Quick Start

1. **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Déploiement sur Vercel
2. **[CONFIGURATION.md](./CONFIGURATION.md)** - Configuration & secrets
3. **[SUPABASE_INIT.sql](./SUPABASE_INIT.sql)** - Initialisation base de données

---

## Fichiers de documentation

| Fichier | Description |
|---------|-------------|
| [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | Guide complet de déploiement (Vercel + Supabase) |
| [CONFIGURATION.md](./CONFIGURATION.md) | Variables d'environnement & sécurité |
| [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) | Liste des 13 variables Vercel |
| [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) | Audit de sécurité (secrets protégés) |
| [SUPABASE_INIT.sql](./SUPABASE_INIT.sql) | Script SQL complet d'initialisation |

---

## Architecture du projet

```
rustikop/
├── api/                    # Serverless functions (Vercel)
│   ├── users.js
│   ├── products.js
│   ├── projects.js
│   ├── orders.js
│   ├── settings.js
│   ├── announcements.js
│   ├── promo-codes.js
│   └── ...
├── src/
│   ├── pages/              # Pages React
│   ├── components/         # Composants réutilisables
│   ├── context/            # DataContext (state global)
│   └── utils/              # Fonctions utilitaires
├── public/
│   └── Logos/              # Logos du site (auto-détectés)
├── lib/
│   └── middleware.js       # Sécurité & validation CORS
└── docs/                   # Documentation (ici)
```

---

## Commandes utiles

```bash
# Développement local
npm run dev

# Build production
npm run build

# Déployer
git add . && git commit -m "update" && git push
```

---

## Checklist avant déploiement

- [ ] Variables d'environnement dans Vercel Dashboard
- [ ] SQL exécuté dans Supabase SQL Editor
- [ ] Test du build local : `npm run build`
- [ ] Test du site : https://rustikop.vercel.app

---

**Dernière mise à jour :** Janvier 2026
