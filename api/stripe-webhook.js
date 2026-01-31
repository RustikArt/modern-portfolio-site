import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Configuration Stripe
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

// Configuration Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

/**
 * Stripe Webhook Handler
 * Reçoit les événements de paiement confirmés par Stripe
 * 
 * IMPORTANT: Ce webhook doit être configuré dans le Dashboard Stripe:
 * 1. Aller sur https://dashboard.stripe.com/webhooks
 * 2. Ajouter un endpoint: https://rustikop.vercel.app/api/stripe-webhook
 * 3. Sélectionner l'événement: checkout.session.completed
 * 4. Copier le Webhook Secret dans les variables Vercel (STRIPE_WEBHOOK_SECRET)
 */
export default async function handler(req, res) {
    // Stripe webhooks only use POST
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    if (!stripe) {
        console.error('[Webhook] Stripe not configured');
        return res.status(500).json({ error: 'Stripe not configured' });
    }

    // Get the raw body for signature verification
    const rawBody = await getRawBody(req);
    const signature = req.headers['stripe-signature'];

    let event;

    try {
        // Verify the webhook signature
        if (STRIPE_WEBHOOK_SECRET) {
            event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
        } else {
            // Development mode - parse without verification (NOT RECOMMENDED FOR PRODUCTION)
            event = JSON.parse(rawBody.toString());
        }
    } catch (err) {
        return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await handleCheckoutCompleted(event.data.object);
                break;

            case 'checkout.session.expired':
            case 'payment_intent.succeeded':
            case 'payment_intent.payment_failed':
                // Events handled silently
                break;

            default:
                // Unhandled event types
                break;
        }

        res.status(200).json({ received: true });
    } catch (err) {
        res.status(500).json({ error: 'Webhook processing failed' });
    }
}

/**
 * Handle successful checkout completion
 */
async function handleCheckoutCompleted(session) {
    console.log('[Webhook] Processing checkout.session.completed:', session.id);

    // Extract metadata
    const metadata = session.metadata || {};
    const customerEmail = session.customer_details?.email || session.customer_email;
    const amountTotal = session.amount_total / 100; // Convert from cents

    console.log('[Webhook] Session details:', {
        id: session.id,
        email: customerEmail,
        amount: amountTotal,
        promo: metadata.promo_code
    });

    // Check if order already exists (idempotency)
    if (supabase) {
        const { data: existingOrder } = await supabase
            .from('portfolio_orders')
            .select('id')
            .eq('payment_id', session.id)
            .single();

        if (existingOrder) {
            console.log('[Webhook] Order already exists for session:', session.id);
            return;
        }

        // Get line items from Stripe
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        
        const items = lineItems.data.map(item => ({
            name: item.description,
            quantity: item.quantity,
            price: item.amount_total / 100 / item.quantity
        }));

        // Create order in database
        const orderData = {
            customer_name: session.customer_details?.name || 'Client',
            email: customerEmail,
            total: amountTotal,
            status: 'Payé',
            items: JSON.stringify(items),
            date: new Date().toISOString(),
            payment_id: session.id,
            shipping: JSON.stringify(session.shipping_details || {}),
            notes: `Webhook confirmé - Promo: ${metadata.promo_code || 'aucun'}`,
            checklist: JSON.stringify([
                { id: 1, label: 'Brief client reçu', completed: false },
                { id: 2, label: 'Concept design validé', completed: false },
                { id: 3, label: 'Production / Création', completed: false },
                { id: 4, label: 'Envoi finalisé', completed: false }
            ])
        };

        const { error } = await supabase
            .from('portfolio_orders')
            .insert([orderData]);

        if (error) {
            console.error('[Webhook] Failed to create order:', error);
            throw error;
        }

        console.log('[Webhook] Order created successfully for session:', session.id);
    } else {
        console.warn('[Webhook] Supabase not configured - order not saved to database');
    }
}

/**
 * Get raw body from request for signature verification
 */
async function getRawBody(req) {
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            resolve(Buffer.from(data));
        });
        req.on('error', reject);
    });
}

// Disable body parsing for webhooks (needed for signature verification)
export const config = {
    api: {
        bodyParser: false,
    },
};
