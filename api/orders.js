import { createClient } from '@supabase/supabase-js';
import { setCorsHeaders, handleCorsPreFlight, handleError } from './middleware.js';

const getSupabase = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Configuration manquante : Supabase URL ou Key non trouvée sur le serveur.');
    return createClient(url, key);
};

export default async function handler(req, res) {
    setCorsHeaders(res, req.headers.origin);
    if (handleCorsPreFlight(req, res)) return;

    try {
        const supabase = getSupabase();

        if (req.method === 'GET') {
            const { data: orders, error } = await supabase
                .from('portfolio_orders')
                .select('*')
                .order('date', { ascending: false });
            if (error) throw error;
            res.status(200).json(orders || []);
        } else if (req.method === 'POST') {
            const newOrder = req.body;
            const { error } = await supabase
                .from('portfolio_orders')
                .insert([newOrder])
                .select();
            if (error) throw error;

            const { data: allOrders, error: fetchError } = await supabase
                .from('portfolio_orders')
                .select('*')
                .order('date', { ascending: false });
            if (fetchError) throw fetchError;

            res.status(201).json(allOrders);
        } else if (req.method === 'PUT') {
            const { id, ...updatedOrder } = req.body;
            const { error } = await supabase
                .from('portfolio_orders')
                .update(updatedOrder)
                .eq('id', id)
                .select();
            if (error) throw error;

            const { data: allOrders, error: fetchError } = await supabase
                .from('portfolio_orders')
                .select('*')
                .order('date', { ascending: false });
            if (fetchError) throw fetchError;

            res.status(200).json(allOrders);
        } else if (req.method === 'DELETE') {
            const { id } = req.body;
            const { error } = await supabase
                .from('portfolio_orders')
                .delete()
                .eq('id', id);
            if (error) throw error;

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
        handleError(res, error);
    }
}
