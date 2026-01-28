import { createClient } from '@supabase/supabase-js';
import { setCorsHeaders, handleCorsPreFlight, handleError } from '../lib/middleware.js';
import bcrypt from 'bcryptjs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
    try {
        supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('[api/login] ✓ Supabase client initialized');
    } catch (e) {
        console.error('[api/login] Supabase init error', e.message);
    }
} else {
    console.error('[api/login] Missing supabase env vars');
}

export default async function handler(req, res) {
    setCorsHeaders(res, req.headers.origin);
    if (handleCorsPreFlight(req, res)) return;

    if (!supabase) {
        return res.status(500).json({ error: 'Database connection not initialized' });
    }

    try {
        if (req.method === 'POST') {
            const { email, password } = req.body || {};
            if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

            const { data: user, error } = await supabase
                .from('portfolio_users')
                .select('*')
                .ilike('email', email)
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error('[api/login] Supabase select error', error);
                return res.status(500).json({ error: 'Database error', details: error });
            }

            if (!user) return res.status(401).json({ error: 'Invalid credentials' });

            let valid = false;
            try {
                if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
                    valid = bcrypt.compareSync(password, user.password);
                } else {
                    valid = user.password === password;
                }
            } catch (e) {
                console.error('[api/login] bcrypt compare error', e.message);
            }

            if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

            // sanitize and normalize
            const safeUser = { ...user };
            delete safeUser.password;
            safeUser.roleTitle = user.role_title ?? user.roleTitle;
            try {
                safeUser.permissions = typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions;
            } catch (e) {
                safeUser.permissions = user.permissions;
            }

            return res.status(200).json({ user: safeUser });
        } else {
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('[api/login] internal error', error);
        handleError(res, error);
    }
}
