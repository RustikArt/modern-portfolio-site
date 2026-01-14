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
            const { data: users, error } = await supabase
                .from('portfolio_users')
                .select('*')
                .order('id', { ascending: true });
            if (error) throw error;
            res.status(200).json(users || []);
        } else if (req.method === 'POST') {
            const newUser = req.body;
            const { error } = await supabase
                .from('portfolio_users')
                .insert([newUser])
                .select();
            if (error) throw error;

            // Get all users to return-sync
            const { data: allUsers, error: fetchError } = await supabase
                .from('portfolio_users')
                .select('*');
            if (fetchError) throw fetchError;

            res.status(201).json(allUsers);
        } else if (req.method === 'PUT') {
            const { id, ...updatedUser } = req.body;
            const { error } = await supabase
                .from('portfolio_users')
                .update(updatedUser)
                .eq('id', id)
                .select();
            if (error) throw error;

            const { data: allUsers, error: fetchError } = await supabase
                .from('portfolio_users')
                .select('*');
            if (fetchError) throw fetchError;

            res.status(200).json(allUsers);
        } else {
            res.setHeader('Allow', ['GET', 'POST', 'PUT']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        handleError(res, error);
    }
}
