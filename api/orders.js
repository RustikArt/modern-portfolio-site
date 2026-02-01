import { createClient } from '@supabase/supabase-js';
import { setCorsHeaders, handleCorsPreFlight, handleError, requireAdminAuth } from '../lib/middleware.js';
import { sendDiscordNotification, DiscordNotifications } from '../lib/discord.js';

// Configuration Supabase - NEVER hardcode keys
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client
let supabase = null;
console.log('[api/orders] Initializing Supabase client...');
console.log('[api/orders] SUPABASE_URL present?', !!SUPABASE_URL);
console.log('[api/orders] SUPABASE_KEY present?', !!SUPABASE_KEY);

if (SUPABASE_URL && SUPABASE_KEY) {
    try {
        supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('[api/orders] ✓ Supabase client initialized successfully');
    } catch (e) {
        console.error('[api/orders] ✗ Supabase Init Error:', e.message);
        console.error('[api/orders] Full error:', e);
    }
} else {
    console.error('[api/orders] CRITICAL: Supabase credentials missing');
    console.error('[api/orders] NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓ present' : '✗ MISSING');
    console.error('[api/orders] SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_KEY ? '✓ present' : '✗ MISSING');
    console.error('[api/orders] env.NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ present' : '✗ MISSING');
    console.error('[api/orders] env.SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ present' : '✗ MISSING');
    console.error('[api/orders] env.NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ present' : '✗ MISSING');
}

export default async function handler(req, res) {
    setCorsHeaders(res, req.headers.origin);
    if (handleCorsPreFlight(req, res)) return;

    if (!supabase) {
        return res.status(500).json({
            error: 'Database connection not initialized',
            details: 'Supabase client is null. Check environment variables.',
            config: { url: SUPABASE_URL ? 'PRESENT' : 'MISSING', key: SUPABASE_KEY ? 'PRESENT' : 'MISSING' }
        });
    }

    try {
        if (req.method === 'GET') {
            const { data: orders, error } = await supabase
                .from('portfolio_orders')
                .select('*')
                .order('date', { ascending: false });

            if (error) {
                console.error('DATABASE ERROR (Select Orders):', JSON.stringify(error, null, 2));
                return res.status(500).json({
                    error: 'Impossible de lire les commandes',
                    message: error.message,
                    code: error.code
                });
            }
            res.status(200).json(orders || []);
        } else if (req.method === 'POST') {
            const body = req.body;

            // Map camelCase to snake_case for Supabase compatibility - ONLY include columns that exist in DB
            const orderToInsert = {
                customer_name: body.customerName || body.customer_name,
                email: body.email,
                total: body.total,
                status: body.status || 'Payé',
                items: typeof body.items === 'string' ? body.items : JSON.stringify(body.items),
                date: body.date || new Date().toISOString(),
                user_id: body.userId || body.user_id,
                payment_id: body.paymentId || body.payment_id,
                shipping: typeof body.shipping === 'string' ? body.shipping : JSON.stringify(body.shipping),
                newsletter: !!body.newsletter,
                discount: body.discount || 0,
                notes: body.notes || null,
                checklist: body.checklist ? (typeof body.checklist === 'string' ? body.checklist : JSON.stringify(body.checklist)) : null,
                archived: body.archived || false,
                completion_date: body.completionDate || body.completion_date || null,
                promo_code_used: body.promoCodeUsed || body.promo_code_used || null
            };

            // Log the data being inserted for debugging
            console.log('[api/orders] POST - Inserting order:', JSON.stringify(orderToInsert, null, 2));

            const { error: insertError } = await supabase
                .from('portfolio_orders')
                .insert([orderToInsert]);

            if (insertError) {
                console.error('Supabase Insert Order Error:', insertError);
                return res.status(500).json({
                    error: 'Échec de la création de la commande.',
                    message: insertError.message,
                    details: insertError
                });
            }

            // Send Discord notification for new order
            try {
                await sendDiscordNotification(DiscordNotifications.newOrder(orderToInsert));
            } catch (discordError) {
                console.warn('[api/orders] Discord notification failed:', discordError.message);
            }

            const { data: allOrders, error: fetchError } = await supabase
                .from('portfolio_orders')
                .select('*')
                .order('date', { ascending: false });
            if (fetchError) throw fetchError;

            res.status(201).json(allOrders);
        } else if (req.method === 'PUT') {
            if (!requireAdminAuth(req, res)) return;
            const { id, ...updatedOrder } = req.body;
            if (!id) return res.status(400).json({ error: 'ID requis.' });

            console.log('[api/orders] PUT - Updating order:', id, 'with data:', JSON.stringify(updatedOrder, null, 2));

            // Filter and map fields for update - only include fields that have values
            const cleanedUpdate = {};
            if (updatedOrder.customerName || updatedOrder.customer_name)
                cleanedUpdate.customer_name = updatedOrder.customerName || updatedOrder.customer_name;
            if (updatedOrder.status) cleanedUpdate.status = updatedOrder.status;
            if (updatedOrder.items) cleanedUpdate.items = typeof updatedOrder.items === 'string' ? updatedOrder.items : JSON.stringify(updatedOrder.items);
            if (updatedOrder.shipping) cleanedUpdate.shipping = typeof updatedOrder.shipping === 'string' ? updatedOrder.shipping : JSON.stringify(updatedOrder.shipping);
            if (updatedOrder.archived !== undefined) cleanedUpdate.archived = !!updatedOrder.archived;
            // Notes field
            if (updatedOrder.notes !== undefined) cleanedUpdate.notes = updatedOrder.notes;
            // Checklist field
            if (updatedOrder.checklist !== undefined) {
                cleanedUpdate.checklist = typeof updatedOrder.checklist === 'string' 
                    ? updatedOrder.checklist 
                    : JSON.stringify(updatedOrder.checklist);
            }
            // Completion date
            if (updatedOrder.completionDate || updatedOrder.completion_date) {
                cleanedUpdate.completion_date = updatedOrder.completionDate || updatedOrder.completion_date;
            }
            // Promo code used
            if (updatedOrder.promoCodeUsed !== undefined || updatedOrder.promo_code_used !== undefined) {
                cleanedUpdate.promo_code_used = updatedOrder.promoCodeUsed || updatedOrder.promo_code_used || null;
            }
            // Promo discount amount
            if (updatedOrder.promoDiscount !== undefined || updatedOrder.promo_discount !== undefined) {
                cleanedUpdate.promo_discount = parseFloat(updatedOrder.promoDiscount || updatedOrder.promo_discount || 0);
            }

            console.log('[api/orders] PUT - Cleaned update object:', JSON.stringify(cleanedUpdate, null, 2));

            const { error: updateError } = await supabase
                .from('portfolio_orders')
                .update(cleanedUpdate)
                .eq('id', id);

            if (updateError) {
                console.error('[api/orders] PUT - Update error:', JSON.stringify(updateError, null, 2));
                return res.status(500).json({
                    error: 'Échec de la mise à jour de la commande.',
                    message: updateError.message,
                    code: updateError.code,
                    details: updateError.details,
                    hint: updateError.hint
                });
            }

            const { data: allOrders, error: fetchError } = await supabase
                .from('portfolio_orders')
                .select('*')
                .order('date', { ascending: false });
            if (fetchError) throw fetchError;

            res.status(200).json(allOrders);
        } else if (req.method === 'DELETE') {
            if (!requireAdminAuth(req, res)) return;
            const { id } = req.body;
            if (!id) return res.status(400).json({ error: 'ID requis.' });

            const { error: deleteError } = await supabase
                .from('portfolio_orders')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            const { data: allOrders, error: fetchError } = await supabase
                .from('portfolio_orders')
                .select('*')
                .order('date', { ascending: false });
            if (fetchError) throw fetchError;

            res.status(200).json(allOrders);
        } else {
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('API Orders internal error:', error);
        handleError(res, error);
    }
}
