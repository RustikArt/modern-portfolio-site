import { createClient } from '@supabase/supabase-js';
import { setCorsHeaders, handleCorsPreFlight, handleError, requireAdminAuth } from './middleware.js';

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

            // Map camelCase to snake_case for Supabase compatibility if needed
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
                discount: body.discount || 0
            };

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


            // Filter and map fields for update
            const cleanedUpdate = {};
            if (updatedOrder.customerName || updatedOrder.customer_name)
                cleanedUpdate.customer_name = updatedOrder.customerName || updatedOrder.customer_name;
            if (updatedOrder.status) cleanedUpdate.status = updatedOrder.status;
            if (updatedOrder.items) cleanedUpdate.items = typeof updatedOrder.items === 'string' ? updatedOrder.items : JSON.stringify(updatedOrder.items);
            if (updatedOrder.shipping) cleanedUpdate.shipping = typeof updatedOrder.shipping === 'string' ? updatedOrder.shipping : JSON.stringify(updatedOrder.shipping);
            if (updatedOrder.archived !== undefined) cleanedUpdate.archived = !!updatedOrder.archived;

            const { error: updateError } = await supabase
                .from('portfolio_orders')
                .update(cleanedUpdate)
                .eq('id', id);

            if (updateError) throw updateError;

            const { data: allOrders, error: fetchError } = await supabase
                .from('portfolio_orders')
                .select('*')
                .order('date', { ascending: false });
            if (fetchError) throw fetchError;

            res.status(200).json(allOrders);
        } else if (req.method === 'DELETE') {
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
