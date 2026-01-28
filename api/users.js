import { createClient } from '@supabase/supabase-js';
import { setCorsHeaders, handleCorsPreFlight, handleError } from '../lib/middleware.js';
import bcrypt from 'bcryptjs';

// Configuration Supabase - NEVER hardcode keys
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client
let supabase = null;
console.log('[api/users] Initializing Supabase client...');
console.log('[api/users] SUPABASE_URL present?', !!SUPABASE_URL);
console.log('[api/users] SUPABASE_KEY present?', !!SUPABASE_KEY);

if (SUPABASE_URL && SUPABASE_KEY) {
    try {
        supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('[api/users] ✓ Supabase client initialized successfully');
    } catch (e) {
        console.error('[api/users] ✗ Supabase Init Error:', e.message);
        console.error('[api/users] Full error:', e);
    }
} else {
    console.error('[api/users] CRITICAL: Supabase credentials missing');
    console.error('[api/users] NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓ present' : '✗ MISSING');
    console.error('[api/users] SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_KEY ? '✓ present' : '✗ MISSING');
    console.error('[api/users] env.NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ present' : '✗ MISSING');
    console.error('[api/users] env.SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ present' : '✗ MISSING');
    console.error('[api/users] env.NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ present' : '✗ MISSING');
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

            // Prevent public creation of admin/super_admin accounts without secret
            const ADMIN_API_SECRET = process.env.ADMIN_API_SECRET || '';
            const providedSecret = (req.headers['x-admin-secret'] || '').toString();
            const requestedRole = (newUser.role || 'client').toString();

            if (requestedRole !== 'client' && ADMIN_API_SECRET && providedSecret !== ADMIN_API_SECRET) {
                console.warn('Attempt to create elevated account without valid admin secret');
                return res.status(403).json({ error: 'Forbidden: cannot create admin accounts from public endpoints.' });
            }

            // HASH PASSWORD
            if (newUser.password.length < 50) {
                const salt = bcrypt.genSaltSync(10);
                newUser.password = bcrypt.hashSync(newUser.password, salt);
            }

            // Strictly filter fields to match Supabase schema exactly
            // Write DB columns in snake_case, but keep roleTitle for frontend compatibility
            const userToInsert = {
                email: newUser.email.trim().toLowerCase(),
                password: newUser.password,
                name: newUser.name || newUser.email.split('@')[0],
                role: newUser.role || 'client',
                permissions: Array.isArray(newUser.permissions) ? JSON.stringify(newUser.permissions) : (newUser.permissions || '[]'),
                role_title: newUser.roleTitle || (newUser.role === 'admin' ? 'Administrateur' : 'Client')
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

            // Normalize DB snake_case -> frontend camelCase
            const normalized = (allUsers || []).map(u => ({
                ...u,
                roleTitle: u.role_title ?? u.roleTitle,
                permissions: typeof u.permissions === 'string' ? JSON.parse(u.permissions) : u.permissions
            }));

            res.status(201).json(normalized);
        } else if (req.method === 'PUT') {
            const { id, ...updatedUser } = req.body;

            if (!id) return res.status(400).json({ error: 'ID requis pour la mise à jour.' });

            // If trying to elevate role or modify sensitive fields, require admin secret
            const ADMIN_API_SECRET = process.env.ADMIN_API_SECRET || '';
            const providedSecret = (req.headers['x-admin-secret'] || '').toString();
            const isElevating = updatedUser.role && updatedUser.role !== 'client';
            if (isElevating && ADMIN_API_SECRET && providedSecret !== ADMIN_API_SECRET) {
                console.warn('Attempt to elevate account without valid admin secret');
                return res.status(403).json({ error: 'Forbidden: cannot elevate accounts from public endpoints.' });
            }

            if (updatedUser.password && updatedUser.password.length < 50) {
                const salt = bcrypt.genSaltSync(10);
                updatedUser.password = bcrypt.hashSync(updatedUser.password, salt);
            }

            // Filter fields for update (map frontend names to DB columns)
            const cleanedUpdate = {};
            if (updatedUser.email) cleanedUpdate.email = updatedUser.email;
            if (updatedUser.password) cleanedUpdate.password = updatedUser.password;
            if (updatedUser.name) cleanedUpdate.name = updatedUser.name;
            if (updatedUser.role) cleanedUpdate.role = updatedUser.role;
            if (updatedUser.permissions) cleanedUpdate.permissions = Array.isArray(updatedUser.permissions) ? JSON.stringify(updatedUser.permissions) : updatedUser.permissions;
            if (updatedUser.roleTitle) cleanedUpdate.role_title = updatedUser.roleTitle;

            const { error: updateError } = await supabase
                .from('portfolio_users')
                .update(cleanedUpdate)
                .eq('id', id);

            if (updateError) throw updateError;

            const { data: allUsers, error: fetchError } = await supabase
                .from('portfolio_users')
                .select('*');
            if (fetchError) throw fetchError;

            const normalized = (allUsers || []).map(u => ({
                ...u,
                roleTitle: u.role_title ?? u.roleTitle,
                permissions: typeof u.permissions === 'string' ? JSON.parse(u.permissions) : u.permissions
            }));

            res.status(200).json(normalized);
        } else if (req.method === 'DELETE') {
            const { id } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'ID requis pour la suppression.' });
            }

            // Require admin secret for deletes to avoid public deletion
            const ADMIN_API_SECRET = process.env.ADMIN_API_SECRET || '';
            const providedSecret = (req.headers['x-admin-secret'] || '').toString();
            if (ADMIN_API_SECRET && providedSecret !== ADMIN_API_SECRET) {
                console.warn('Attempt to delete user without valid admin secret');
                return res.status(403).json({ error: 'Forbidden: cannot delete users from public endpoints.' });
            }

            const { error: deleteError } = await supabase
                .from('portfolio_users')
                .delete()
                .eq('id', id);

            if (deleteError) {
                console.error('Supabase Delete User Error:', deleteError);
                return res.status(500).json({
                    error: 'Échec de la suppression de l\'utilisateur.',
                    message: deleteError.message,
                    details: deleteError
                });
            }

            const { data: allUsers, error: fetchError } = await supabase
                .from('portfolio_users')
                .select('*');
            if (fetchError) throw fetchError;

            const normalized = (allUsers || []).map(u => ({
                ...u,
                roleTitle: u.role_title ?? u.roleTitle,
                permissions: typeof u.permissions === 'string' ? JSON.parse(u.permissions) : u.permissions
            }));

            res.status(200).json(normalized);
        } else {
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('API Users internal error:', error);
        handleError(res, error);
    }
}
