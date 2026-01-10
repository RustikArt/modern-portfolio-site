import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const { data: promoCodes, error } = await supabase
                .from('portfolio_promo_codes')
                .select('*')
                .order('id', { ascending: true });
            if (error) throw error;
            res.status(200).json(promoCodes || []);
        } catch (error) {
            console.error('Fetch promo codes error:', error);
            res.status(500).json({ error: 'Failed to fetch promo codes' });
        }
    } else if (req.method === 'POST') {
        try {
            const newPromoCode = req.body;
            const { data, error } = await supabase
                .from('portfolio_promo_codes')
                .insert([newPromoCode])
                .select();
            if (error) throw error;
            // Return all promo codes
            const { data: allPromoCodes, error: fetchError } = await supabase
                .from('portfolio_promo_codes')
                .select('*')
                .order('id', { ascending: true });
            if (fetchError) throw fetchError;
            res.status(201).json(allPromoCodes);
        } catch (error) {
            console.error('Add promo code error:', error);
            res.status(500).json({ error: 'Failed to add promo code' });
        }
    } else if (req.method === 'PUT') {
        try {
            const { id, ...updatedPromoCode } = req.body;
            const numId = Number(id);
            const { data, error } = await supabase
                .from('portfolio_promo_codes')
                .update(updatedPromoCode)
                .eq('id', numId)
                .select();
            if (error) throw error;
            // Return all promo codes
            const { data: allPromoCodes, error: fetchError } = await supabase
                .from('portfolio_promo_codes')
                .select('*')
                .order('id', { ascending: true });
            if (fetchError) throw fetchError;
            res.status(200).json(allPromoCodes);
        } catch (error) {
            console.error('Update promo code error:', error);
            res.status(500).json({ error: 'Failed to update promo code' });
        }
    } else if (req.method === 'DELETE') {
        try {
            const { id } = req.body;
            const numId = Number(id);
            const { data, error } = await supabase
                .from('portfolio_promo_codes')
                .delete()
                .eq('id', numId);
            if (error) throw error;
            // Return all promo codes
            const { data: allPromoCodes, error: fetchError } = await supabase
                .from('portfolio_promo_codes')
                .select('*')
                .order('id', { ascending: true });
            if (fetchError) throw fetchError;
            res.status(200).json(allPromoCodes);
        } catch (error) {
            console.error('Delete promo code error:', error);
            res.status(500).json({ error: 'Failed to delete promo code' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}