# Rustikop - Modern Portfolio Site

Production-ready portfolio & e-commerce platform built with React, Vite, Supabase, and Stripe.

## Quick Start

### Local Development
```bash
npm install
npm run dev
# Opens http://localhost:5174
```

### Production Build
```bash
npm run build
# Creates optimized dist/ folder
```

## Deployment

See [docs/DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) for:
- Pre-deployment checklist
- Vercel deployment steps
- Production verification
- Go-live procedures

## Configuration

All environment variables, security settings, and integrations documented in:
- [docs/CONFIGURATION.md](./docs/CONFIGURATION.md)
- [docs/SUPABASE_INIT.sql](./docs/SUPABASE_INIT.sql)

## Documentation

Start here: [docs/README.md](./docs/README.md)

All project documentation is organized in the `/docs` folder:
- `README.md` - Documentation index (start here)
- `DEPLOYMENT_GUIDE.md` - How to deploy to production
- `CONFIGURATION.md` - All settings and secrets
- `SUPABASE_INIT.sql` - Database initialization

## Features

✅ **Authentication** - Email/password with role-based permissions
✅ **E-Commerce** - Product catalog, shopping cart, checkout
✅ **Payments** - Stripe integration (live mode)
✅ **Admin Dashboard** - Orders, products, settings management
✅ **Portfolio** - Project showcase with custom blocks
✅ **Security** - Admin-secret protection on all mutations
✅ **Database** - Supabase PostgreSQL (secure & scalable)
✅ **Email** - Automated confirmations via EmailJS
✅ **Performance** - Optimized Vite build (507 KB gzip)

## Tech Stack

- **Frontend:** React 18 + Vite
- **Backend:** Vercel serverless functions
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe
- **Email:** EmailJS
- **Hosting:** Vercel
- **Styling:** CSS modules + Lucide icons

## Project Structure

```
├── src/
│   ├── pages/           React page components
│   ├── components/      React UI components
│   ├── context/         State management (DataContext)
│   └── utils/           Helper functions
├── api/                 Vercel serverless functions
├── public/              Static assets
├── docs/                Documentation (start here!)
└── .env.local           Configuration (not committed)
```

## Security

- Admin operations protected by `x-admin-secret` header
- Server-side validation on all mutations
- HTTPS enforced by Vercel
- Environment variables isolated in Supabase
- Role-based permissions on frontend + backend

## Status

✅ **Production Ready** - All systems operational
✅ **Fully Tested** - Build succeeds, no errors
✅ **Documented** - Complete guides in /docs
✅ **Secure** - Admin-secret on all mutations
✅ **Autonomous** - Data centralized in Supabase

## Next Steps

1. **Review Documentation:** Read [docs/DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)
2. **Initialize Database:** Run SQL from [docs/SUPABASE_INIT.sql](./docs/SUPABASE_INIT.sql)
3. **Deploy to Vercel:** Push to GitHub and Vercel auto-deploys
4. **Go Live:** Accept your first real customers!

## Support

All questions answered in `/docs` folder. Start with [docs/README.md](./docs/README.md).

---

**Domain:** https://rustikop.vercel.app  
**Status:** ✅ Production Ready  
**Last Updated:** 2026-01-24
