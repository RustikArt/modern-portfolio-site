/**
 * Middleware de validation et de sécurité pour les API endpoints
 */

// Configuration CORS
export function setCorsHeaders(res, reqOrigin) {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://rustikop.vercel.app').split(',');

    // Allow localhost and local IP patterns for testing
    let originToAllow = allowedOrigins[0];
    if (reqOrigin) {
        if (allowedOrigins.includes(reqOrigin) ||
            reqOrigin.includes('localhost') ||
            reqOrigin.includes('127.0.0.1') ||
            reqOrigin.includes('192.168.') ||
            reqOrigin.endsWith('.vercel.app')) {
            originToAllow = reqOrigin;
        }
    }

    res.setHeader('Access-Control-Allow-Origin', originToAllow);
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
    res.setHeader('Access-Control-Max-Age', '86400');
}

// Gérer les requêtes OPTIONS (CORS preflight)
export function handleCorsPreFlight(req, res) {
    if (req.method === 'OPTIONS') {
        setCorsHeaders(res, req.headers.origin);
        res.status(200).end();
        return true;
    }
    return false;
}

// Validation des données du panier
export function validateCartItem(item) {
    if (!item.name || typeof item.name !== 'string') {
        throw new Error('Invalid item name');
    }
    if (!item.price || typeof item.price !== 'number' || item.price < 0) {
        throw new Error('Invalid item price');
    }
    if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1) {
        throw new Error('Invalid item quantity');
    }
    if (item.image && typeof item.image !== 'string') {
        throw new Error('Invalid item image');
    }
    return true;
}

// Validation des données de promo
export function validatePromoCode(promo) {
    if (!promo.code || typeof promo.code !== 'string') {
        throw new Error('Invalid promo code');
    }
    if (!promo.type || !['percent', 'fixed'].includes(promo.type)) {
        throw new Error('Invalid promo type');
    }
    if (typeof promo.value !== 'number' || promo.value < 0) {
        throw new Error('Invalid promo value');
    }
    return true;
}

// Validation des URLs de redirection
export function validateRedirectUrl(url, allowedOrigins) {
    try {
        const parsedUrl = new URL(url);
        return allowedOrigins.some(origin => parsedUrl.origin === origin);
    } catch {
        return false;
    }
}

// Rate limiting simple (en mémoire pour Vercel)
const requestCounts = new Map();

export function checkRateLimit(identifier, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const key = `${identifier}-${Math.floor(now / windowMs)}`;

    const count = requestCounts.get(key) || 0;

    if (count >= maxRequests) {
        return false;
    }

    requestCounts.set(key, count + 1);

    // Nettoyer les anciennes entrées
    if (requestCounts.size > 10000) {
        const oldestKey = Math.min(...Array.from(requestCounts.keys()).map(k => parseInt(k.split('-')[1])));
        for (const [k] of requestCounts) {
            if (parseInt(k.split('-')[1]) <= oldestKey) {
                requestCounts.delete(k);
            }
        }
    }

    return true;
}

// Vérification d'authentification admin (x-admin-secret)
export function requireAdminAuth(req, res) {
    const ADMIN_API_SECRET = process.env.ADMIN_API_SECRET || '';
    const providedSecret = (req.headers['x-admin-secret'] || '').toString();

    // Si aucun secret n'est configuré, log un warning mais permets la requête (mode développement)
    if (!ADMIN_API_SECRET) {
        console.warn('[SECURITY] ADMIN_API_SECRET not configured - admin endpoints are unprotected!');
        return true;
    }

    // Vérifier le secret
    if (providedSecret !== ADMIN_API_SECRET) {
        setCorsHeaders(res, req.headers.origin);
        res.status(403).json({ error: 'Forbidden: Invalid or missing admin secret.' });
        return false;
    }

    return true;
}

// Gestion des erreurs standardisée
export function handleError(res, error, statusCode = 500) {
    console.error('API Error:', error);
    res.status(statusCode).json({
        error: error.message || 'Une erreur est survenue',
        timestamp: new Date().toISOString()
    });
}
