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
                // Clearer error for the user to understand if it's a schema issue
                const isTableMissing = error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist');
                return res.status(500).json({
                    error: isTableMissing ? 'Table "portfolio_users" manquante' : 'Erreur base de données',
                    message: error.message,
                    code: error.code,
                    hint: isTableMissing ? 'Créez la table "portfolio_users" dans Supabase avec les colonnes: id, email, password, name, role, permissions (jsonb/text), roleTitle.' : error.hint
                });
            }
            res.status(200).json(users || []);
        } else if (req.method === 'POST') {
            const newUser = req.body;

            // HASH PASSWORD
            if (newUser.password && newUser.password.length < 50) {
                const salt = bcrypt.genSaltSync(10);
                newUser.password = bcrypt.hashSync(newUser.password, salt);
            }

            // Filter fields to avoid Supabase errors if columns don't exist
            // We only keep the core fields that are definitely expected in a user table
            const filteredUser = {
                email: newUser.email,
                password: newUser.password,
                name: newUser.name,
                role: newUser.role || 'client'
            };

            // Optional fields (only add if they have values to avoid null constraint issues)
            if (newUser.permissions) filteredUser.permissions = typeof newUser.permissions === 'string' ? newUser.permissions : JSON.stringify(newUser.permissions);
            if (newUser.roleTitle) filteredUser.roleTitle = newUser.roleTitle;

            const { error: insertError } = await supabase
                .from('portfolio_users')
                .insert([filteredUser]);

            if (insertError) {
                console.error('Supabase Insert Error:', insertError);
                return res.status(500).json({ error: 'Échec de l\'insertion de l\'utilisateur.', details: insertError });
            }

            const { data: allUsers, error: fetchError } = await supabase
                .from('portfolio_users')
                .select('*');
            if (fetchError) throw fetchError;

            res.status(201).json(allUsers);
        } else if (req.method === 'PUT') {
            const { id, ...updatedUser } = req.body;

            if (updatedUser.password && updatedUser.password.length < 50) {
                const salt = bcrypt.genSaltSync(10);
                updatedUser.password = bcrypt.hashSync(updatedUser.password, salt);
            }

            const { error: updateError } = await supabase
                .from('portfolio_users')
                .update(updatedUser)
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
        console.error('API Users catch block:', error);
        handleError(res, error);
    }
}
