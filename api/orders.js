import { createClient } from '@supabase/supabase-js';
import { setCorsHeaders, handleCorsPreFlight, handleError } from './middleware.js';

// Configuration Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://whkahjdzptwbaalvnvle.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase;
try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        throw new Error('Supabase credentials missing.');
    }
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
    console.error('Supabase Init Error (Orders):', e);
}

export default async function handler(req, res) {
    setCorsHeaders(res, req.headers.origin);
    if (handleCorsPreFlight(req, res)) return;

    if (!supabase) {
        return res.status(500).json({ error: 'Database connection not initialized' });
    }

    try {
        if (req.method === 'GET') {
            const { data: orders, error } = await supabase
                .from('portfolio_orders')
                .select('*')
                .order('date', { ascending: false });

            if (error) {
                console.error('Supabase Select Orders Error:', error);
                return res.status(500).json({ error: 'Table "portfolio_orders" non trouvée ou inaccessible.', details: error });
            }
            res.status(200).json(orders || []);
        } else if (req.method === 'POST') {
            const newOrder = req.body;
            const { error: insertError } = await supabase
                .from('portfolio_orders')
                .insert([newOrder]);

            if (insertError) {
                console.error('Supabase Insert Order Error:', insertError);
                return res.status(500).json({ error: 'Échec de la création de la commande.', details: insertError });
            }

            const { data: allOrders, error: fetchError } = await supabase
                .from('portfolio_orders')
                .select('*')
                .order('date', { ascending: false });
            if (fetchError) throw fetchError;

            res.status(201).json(allOrders);
        } else if (req.method === 'PUT') {
            const { id, ...updatedOrder } = req.body;
            const { error: updateError } = await supabase
                .from('portfolio_orders')
                .update(updatedOrder)
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
        console.error('API Orders catch block:', error);
        handleError(res, error);
    }
}
