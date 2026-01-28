import { createClient } from '@supabase/supabase-js';
import { setCorsHeaders, handleCorsPreFlight, handleError } from '../lib/middleware.js';
import bcrypt from 'bcryptjs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
    try {
        supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('[api/change-password] Supabase client initialized');
    } catch (e) {
        console.error('[api/change-password] Supabase init error', e.message);
    }
} else {
    console.error('[api/change-password] Missing supabase env vars');
}

export default async function handler(req, res) {
    setCorsHeaders(res, req.headers.origin);
    if (handleCorsPreFlight(req, res)) return;

    if (!supabase) {
        return res.status(500).json({ error: 'Database connection not initialized' });
    }

    try {
        if (req.method === 'POST') {
            const { email, oldPassword, newPassword } = req.body || {};
            if (!email || !oldPassword || !newPassword) return res.status(400).json({ error: 'Email, ancien mot de passe et nouveau mot de passe requis' });

            const { data: user, error } = await supabase
                .from('portfolio_users')
                .select('*')
                .ilike('email', email)
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error('[api/change-password] Supabase select error', error);
                return res.status(500).json({ error: 'Database error', details: error });
            }

            if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });

            let valid = false;
            try {
                if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
                    valid = bcrypt.compareSync(oldPassword, user.password);
                } else {
                    valid = user.password === oldPassword;
                }
            } catch (e) {
                console.error('[api/change-password] bcrypt compare error', e.message);
            }

            if (!valid) return res.status(401).json({ error: 'Mot de passe actuel incorrect' });

            // Hash new password
            const salt = bcrypt.genSaltSync(10);
            const hashed = bcrypt.hashSync(newPassword, salt);

            const { error: updateError } = await supabase
                .from('portfolio_users')
                .update({ password: hashed })
                .ilike('email', email);

            if (updateError) {
                console.error('[api/change-password] Supabase update error', updateError);
                return res.status(500).json({ error: 'Impossible de mettre à jour le mot de passe', details: updateError });
            }

            return res.status(200).json({ success: true });
        } else {
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('[api/change-password] internal error', error);
        handleError(res, error);
    }
}
