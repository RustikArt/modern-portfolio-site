import Stripe from 'stripe';
import {
    setCorsHeaders,
    handleCorsPreFlight,
    validateCartItem,
    validatePromoCode,
    validateRedirectUrl,
    checkRateLimit,
    handleError
} from './middleware.js';

// Validate Stripe configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
    console.error('CRITICAL ERROR: STRIPE_SECRET_KEY missing in environment variables');
    console.error('Set STRIPE_SECRET_KEY in .env');
}

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

// CORS: Use environment variable, fallback to hardcoded list
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://rustikop.vercel.app,http://localhost:5173,http://localhost:3000').split(',').map(o => o.trim());

export default async function handler(req, res) {
    // Configurer les headers CORS
    setCorsHeaders(res);
    
    // Gérer les requêtes OPTIONS
    if (handleCorsPreFlight(req, res)) {
        return;
    }

    // Check if Stripe is configured
    if (!stripe) {
        return res.status(500).json({
            error: 'Service unavailable',
            message: 'Stripe configuration missing. Check STRIPE_SECRET_KEY in environment variables.'
        });
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Rate limiting
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        if (!checkRateLimit(clientIp, 20, 60000)) {
            return res.status(429).json({ error: 'Trop de requêtes. Veuillez réessayer plus tard.' });
        }

        const { cart, promo, success_url, cancel_url } = req.body;

        // Validation des données
        if (!Array.isArray(cart) || cart.length === 0) {
            return res.status(400).json({ error: 'Panier invalide' });
        }

        // Valider chaque article du panier
        for (const item of cart) {
            validateCartItem(item);
        }

        // Valider les URLs de redirection
        if (!validateRedirectUrl(success_url, ALLOWED_ORIGINS)) {
            return res.status(400).json({ error: 'URL de succès invalide' });
        }
        if (!validateRedirectUrl(cancel_url, ALLOWED_ORIGINS)) {
            return res.status(400).json({ error: 'URL d\'annulation invalide' });
        }

        // Valider le code promo si fourni
        if (promo) {
            validatePromoCode(promo);
        }

            // Calculer la remise totale
            let totalDiscountCents = 0;
            const subtotalCents = cart.reduce((acc, item) => acc + (Math.round(item.price * 100) * item.quantity), 0);

            if (promo) {
                if (promo.type === 'percent') {
                    totalDiscountCents = Math.round(subtotalCents * (promo.value / 100));
                } else if (promo.type === 'fixed') {
                    totalDiscountCents = Math.round(promo.value * 100);
                }
            }

            // S'assurer que la remise ne dépasse pas le total
            totalDiscountCents = Math.min(totalDiscountCents, subtotalCents);

            // Préparer les articles avec les prix ajustés
            let remainingDiscount = totalDiscountCents;
            const line_items = cart.map((item) => {
                const product_data = {
                    name: item.name + (promo ? ' (Promo appliquée)' : ''),
                };

                if (item.image && (item.image.startsWith('http') || item.image.startsWith('https'))) {
                    product_data.images = [item.image];
                }

                let itemTotalCents = Math.round(item.price * 100) * item.quantity;

                // Déduire la remise de cet article
                const deduction = Math.min(remainingDiscount, itemTotalCents);
                itemTotalCents -= deduction;
                remainingDiscount -= deduction;

                // Calculer le nouveau montant unitaire
                const newUnitAmount = Math.max(0, Math.floor(itemTotalCents / item.quantity));

                return {
                    price_data: {
                        currency: 'eur',
                        product_data: product_data,
                        unit_amount: newUnitAmount,
                    },
                    quantity: item.quantity,
                };
            });

        // Préparer la configuration de session
        const sessionConfig = {
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: success_url,
            cancel_url: cancel_url,
            // Ajouter des métadonnées pour le suivi
            metadata: {
                promo_code: promo?.code || 'none',
                timestamp: new Date().toISOString()
            }
        };

        const session = await stripe.checkout.sessions.create(sessionConfig);
        res.status(200).json({ id: session.id, url: session.url });

    } catch (err) {
        handleError(res, err, 500);
    }
}
