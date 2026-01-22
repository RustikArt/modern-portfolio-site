import { createClient } from '@supabase/supabase-js';
import { setCorsHeaders, handleCorsPreFlight, handleError } from './middleware.js';
import bcrypt from 'bcryptjs';

// Configuration Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://whkahjdzptwbaalvnvle.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase;
try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.error('CRITICAL: Supabase credentials missing (URL or KEY)');
    } else {
        supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    }
} catch (e) {
    console.error('Supabase Init Error:', e);
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
            const { data: users, error } = await supabase
                .from('portfolio_users')
                .select('*')
                .order('id', { ascending: true });

            if (error) {
                console.error('DATABASE ERROR (Select Users):', JSON.stringify(error, null, 2));
                return res.status(500).json({
                    error: 'Impossible de lire les utilisateurs',
                    message: error.message,
                    code: error.code,
                    hint: 'Vérifiez que la table "portfolio_users" existe et contient les colonnes nécessaires.'
                });
            }
            res.status(200).json(users || []);
        } else if (req.method === 'POST') {
            const newUser = req.body;

            if (!newUser.email || !newUser.password) {
                return res.status(400).json({ error: 'Email et mot de passe requis.' });
            }

            // HASH PASSWORD
            if (newUser.password.length < 50) {
                const salt = bcrypt.genSaltSync(10);
                newUser.password = bcrypt.hashSync(newUser.password, salt);
            }

            // Strictly filter fields to match Supabase schema exactly
            const userToInsert = {
                email: newUser.email.trim().toLowerCase(),
                password: newUser.password,
                name: newUser.name || newUser.email.split('@')[0],
                role: newUser.role || 'client',
                permissions: Array.isArray(newUser.permissions) ? JSON.stringify(newUser.permissions) : (newUser.permissions || '[]'),
                roleTitle: newUser.roleTitle || (newUser.role === 'admin' ? 'Administrateur' : 'Client')
            };

            const { error: insertError } = await supabase
                .from('portfolio_users')
                .insert([userToInsert]);

            if (insertError) {
                console.error('Supabase Insert Error:', insertError);
                if (insertError.code === '23505') {
                    return res.status(409).json({ error: 'Cet email est déjà utilisé.', code: 'DUPLICATE_EMAIL' });
                }
                return res.status(500).json({
                    error: 'Échec de la création du compte.',
                    message: insertError.message,
                    details: insertError
                });
            }

            const { data: allUsers, error: fetchError } = await supabase
                .from('portfolio_users')
                .select('*');
            if (fetchError) throw fetchError;

            res.status(201).json(allUsers);
        } else if (req.method === 'PUT') {
            const { id, ...updatedUser } = req.body;

            if (!id) return res.status(400).json({ error: 'ID requis pour la mise à jour.' });

            if (updatedUser.password && updatedUser.password.length < 50) {
                const salt = bcrypt.genSaltSync(10);
                updatedUser.password = bcrypt.hashSync(updatedUser.password, salt);
            }

            // Filter fields for update
            const cleanedUpdate = {};
            if (updatedUser.email) cleanedUpdate.email = updatedUser.email;
            if (updatedUser.password) cleanedUpdate.password = updatedUser.password;
            if (updatedUser.name) cleanedUpdate.name = updatedUser.name;
            if (updatedUser.role) cleanedUpdate.role = updatedUser.role;
            if (updatedUser.permissions) cleanedUpdate.permissions = Array.isArray(updatedUser.permissions) ? JSON.stringify(updatedUser.permissions) : updatedUser.permissions;
            if (updatedUser.roleTitle) cleanedUpdate.roleTitle = updatedUser.roleTitle;

            const { error: updateError } = await supabase
                .from('portfolio_users')
                .update(cleanedUpdate)
                .eq('id', id);

            if (updateError) throw updateError;

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
        console.error('API Users internal error:', error);
        handleError(res, error);
    }
}
