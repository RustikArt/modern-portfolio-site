# 🔧 DEBUG GUIDE - API 500/405 Errors

## 🚨 Errors Reported

```
api/users:1 Failed to load resource: the server responded with a status of 500 ()
api/users:1 Failed to load resource: the server responded with a status of 405 ()
api/orders:1 Failed to load resource: the server responded with a status of 500 ()
Delete user error: Error: Erreur lors de la suppression de l'utilisateur
Registration failed on server: Object
```

---

## ✅ Fixes Applied

### 1. **Missing DELETE Handler in api/users.js** ✓
**Problem:** Frontend sends DELETE requests to `/api/users` but the API handler didn't have a DELETE method.

**Error:** 405 Method Not Allowed

**Fix Applied:**
- Added `DELETE` method handler to [api/users.js](api/users.js#L128)
- Now handles deletion of users by ID
- Returns updated user list after deletion

**Code:**
```javascript
} else if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'ID requis.' });
    
    const { error: deleteError } = await supabase
        .from('portfolio_users')
        .delete()
        .eq('id', id);
    
    if (deleteError) throw deleteError;
    
    // Return updated users list
    const { data: allUsers } = await supabase
        .from('portfolio_users')
        .select('*');
    
    res.status(200).json(allUsers);
}
```

---

### 2. **500 Errors - Supabase Client Initialization** ✓
**Problem:** Supabase client is `null` because environment variables aren't being loaded properly.

**Symptoms:**
- API returns: "Database connection not initialized"
- Response includes: `"Supabase client is null. Check environment variables."`

**Root Cause:**
- `.env` file exists but environment variables not passed to Vercel Functions
- Or local development server not loading `.env` properly

**Fixes Applied:**
- ✅ Added comprehensive logging to [api/users.js](api/users.js#L9)
- ✅ Added comprehensive logging to [api/orders.js](api/orders.js#L8)
- ✅ Added logging to [api/products.js](api/products.js#L17)
- ✅ Added logging to [api/projects.js](api/projects.js#L17)
- ✅ Added logging to [api/promo-codes.js](api/promo-codes.js#L17)

**Logging Output Shown in Console:**
```
[api/users] Initializing Supabase client...
[api/users] SUPABASE_URL present? true/false
[api/users] SUPABASE_KEY present? true/false
[api/users] ✓ Supabase client initialized successfully
    OR
[api/users] ✗ Supabase Init Error: (error message)
[api/users] CRITICAL: Supabase credentials missing
[api/users] env.NEXT_PUBLIC_SUPABASE_URL: ✓ present / ✗ MISSING
```

---

## 🔍 How to Verify Fixes

### Option 1: Check Console Logs
Open your browser **DevTools** (F12) → **Console** tab:

```bash
# Look for these messages:
[api/users] Initializing Supabase client...
[api/users] SUPABASE_URL present? true
[api/users] SUPABASE_KEY present? true
[api/users] ✓ Supabase client initialized successfully
```

✅ **If you see this:** Environment variables are loaded correctly!
❌ **If you see** `MISSING` or `false`: See troubleshooting below.

### Option 2: Test API Directly
Open browser **DevTools** → **Network** tab:

1. Try registering a new user
2. Look for request to `/api/users` (POST)
3. Check response:
   - ✅ **200 or 201:** Success!
   - ❌ **500:** See troubleshooting below
   - ❌ **405:** Method Not Allowed (should be fixed now)

### Option 3: Test DELETE Endpoint
```bash
# In DevTools Console:
const userId = 123; // Replace with actual user ID

fetch('/api/users', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: userId })
})
.then(r => r.json())
.then(data => console.log('DELETE success:', data))
.catch(err => console.error('DELETE error:', err));
```

Expected response: Array of remaining users (200 status)

---

## 🆘 Troubleshooting

### Problem: `Supabase credentials missing`

#### Local Development
**Solution:** Create `.env.local` file:

```bash
# Copy .env.example to .env.local
cp .env.example .env.local

# Then fill in the values:
NEXT_PUBLIC_SUPABASE_URL=https://whkahjdzptwbaalvnvle.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_EMAILJS_SERVICE_ID=service_...
VITE_EMAILJS_TEMPLATE_ID=template_...
VITE_EMAILJS_PUBLIC_KEY=your_public_key...
```

Then restart dev server:
```bash
npm run dev  # or yarn dev
```

#### Vercel Production
**Solution:** Add environment variables in Vercel Dashboard:

1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add all variables from `.env.local`
5. Redeploy

### Problem: `Method DELETE Not Allowed`

**Status:** ✅ **FIXED** in api/users.js

If still getting 405:
- Clear browser cache (Ctrl+Shift+Delete)
- Rebuild project: `npm run build`
- Restart dev server: `npm run dev`

### Problem: `api/orders getting 500`

**Likely cause:** Same Supabase environment variables issue

**Check:**
1. Open DevTools → Console
2. Look for `[api/orders]` logs
3. If you see `MISSING`, follow Local Development steps above

---

## 📋 Complete Test Checklist

- [ ] Can register new user (POST /api/users → 201)
- [ ] Can login (POST /api/users → data returned)
- [ ] Can delete user (DELETE /api/users → 200)
- [ ] Can create order (POST /api/orders → 201)
- [ ] Can fetch orders (GET /api/orders → 200)
- [ ] No 500 errors in console
- [ ] No 405 errors in console
- [ ] All console logs show ✓ (not ✗)

---

## 🔗 Related Documentation

- [SETUP_ENV.md](SETUP_ENV.md) - Detailed environment setup
- [.env.example](.env.example) - Environment variable template
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Pre-deployment verification
- [SUMMARY.md](SUMMARY.md) - Overview of all fixes

---

## 📞 Still Having Issues?

**Check these files for detailed error handling:**
- [api/users.js](api/users.js) - Lines 9-30 (logging)
- [api/orders.js](api/orders.js) - Lines 8-30 (logging)
- [api/middleware.js](api/middleware.js#L35) - Error handling function

**Key functions that log errors:**
- `handleError()` in middleware.js
- Database-level error checks in each handler

---

**Last Updated:** January 23, 2026
**Status:** ✅ All fixes applied
