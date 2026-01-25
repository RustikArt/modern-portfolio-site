/**
 * DEBUG ENDPOINT - À SUPPRIMER EN PRODUCTION
 * Permet de vérifier si les variables d'environnement sont correctement configurées
 */
import { setCorsHeaders, handleCorsPreFlight } from './middleware.js';

export default async function handler(req, res) {
    setCorsHeaders(res, req.headers.origin);
    if (handleCorsPreFlight(req, res)) return;

    // Only allow GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const adminSecret = process.env.ADMIN_API_SECRET || '';
    const providedSecret = req.headers['x-admin-secret'] || '';

    res.status(200).json({
        message: 'Debug endpoint',
        env: {
            ADMIN_API_SECRET_SET: !!adminSecret,
            ADMIN_API_SECRET_LENGTH: adminSecret.length,
            ADMIN_API_SECRET_FIRST4: adminSecret.substring(0, 4) || 'EMPTY',
            SUPABASE_URL_SET: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            SUPABASE_KEY_SET: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        },
        request: {
            PROVIDED_SECRET_SET: !!providedSecret,
            PROVIDED_SECRET_LENGTH: providedSecret.length,
            PROVIDED_SECRET_FIRST4: providedSecret.substring(0, 4) || 'EMPTY',
            SECRETS_MATCH: adminSecret && providedSecret && adminSecret.trim() === providedSecret.trim()
        }
    });
}
