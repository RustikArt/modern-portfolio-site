import { createClient } from '@supabase/supabase-js';
import { setCorsHeaders, handleCorsPreFlight, handleError } from './middleware.js';
import bcrypt from 'bcryptjs';

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
            // HASH PASSWORD
            if (newUser.password) {
                const salt = bcrypt.genSaltSync(10);
                newUser.password = bcrypt.hashSync(newUser.password, salt);
            }
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
            // HASH PASSWORD IF CHANGED
            if (updatedUser.password) {
                // Simple check: if it looks like a hash (starts with $2a$), maybe skip?
                // But safer to assume if sent, it's a new password.
                // However, we must ensure we don't re-hash an existing hash if frontend sends it back.
                // Typically frontend sends updated fields only.
                // If password length < 20, it's plaintext. bcrypt hashes are 60 chars.
                if (updatedUser.password.length < 50) {
                    const salt = bcrypt.genSaltSync(10);
                    updatedUser.password = bcrypt.hashSync(updatedUser.password, salt);
                }
            }
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
