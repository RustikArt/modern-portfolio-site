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
            const { data: users, error } = await supabase
                .from('portfolio_users')
                .select('*')
                .order('id', { ascending: true });
            if (error) throw error;
            res.status(200).json(users || []);
        } catch (error) {
            handleError(res, error);
        }
    } else if (req.method === 'POST') {
        try {
            const newUser = req.body;
            const { data, error } = await supabase
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
        } catch (error) {
            handleError(res, error);
        }
    } else if (req.method === 'PUT') {
        try {
            const { id, ...updatedUser } = req.body;
            const { data, error } = await supabase
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
        } catch (error) {
            handleError(res, error);
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
