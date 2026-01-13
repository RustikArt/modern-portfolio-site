import { createClient } from '@supabase/supabase-js';
import { setCorsHeaders, handleCorsPreFlight, handleError } from './middleware.js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    setCorsHeaders(res);
    if (handleCorsPreFlight(req, res)) return;

    if (req.method === 'GET') {
        try {
            const { data: orders, error } = await supabase
                .from('portfolio_orders')
                .select('*')
                .order('date', { ascending: false });
            if (error) throw error;
            res.status(200).json(orders || []);
        } catch (error) {
            handleError(res, error);
        }
    } else if (req.method === 'POST') {
        try {
            const newOrder = req.body;
            const { data, error } = await supabase
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
        } catch (error) {
            handleError(res, error);
        }
    } else if (req.method === 'PUT') {
        try {
            const { id, ...updatedOrder } = req.body;
            const { data, error } = await supabase
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
        } catch (error) {
            handleError(res, error);
        }
    } else if (req.method === 'DELETE') {
        try {
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
        } catch (error) {
            handleError(res, error);
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
