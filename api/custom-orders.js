import { applyRateLimit, createErrorResponse, createSuccessResponse, getAdminSecret } from '../lib/middleware.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-secret');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Rate limiting
    const rateLimitResult = applyRateLimit(req, 'custom-orders', 30, 60000);
    if (!rateLimitResult.allowed) {
        return res.status(429).json(createErrorResponse('Trop de requêtes. Réessayez plus tard.'));
    }

    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json(createErrorResponse('Configuration Supabase manquante'));
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // GET - List custom orders (admin only)
        if (req.method === 'GET') {
            const adminSecret = getAdminSecret();
            const requestSecret = req.headers['x-admin-secret'];

            if (!adminSecret || requestSecret !== adminSecret) {
                return res.status(403).json(createErrorResponse('Accès non autorisé'));
            }

            const { status, userId } = req.query;

            let query = supabase
                .from('custom_orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (status) {
                query = query.eq('status', status);
            }

            if (userId) {
                query = query.eq('user_id', userId);
            }

            const { data, error } = await query;

            if (error) throw error;

            return res.status(200).json(createSuccessResponse(data, 'Commandes personnalisées récupérées'));
        }

        // POST - Create new custom order
        if (req.method === 'POST') {
            const {
                userId,
                userEmail,
                userName,
                serviceType,
                title,
                description,
                budget,
                timeline,
                references,
                attachments,
                contactPreference,
                additionalNotes
            } = req.body;

            if (!userId || !userEmail || !serviceType || !title || !description || !budget || !timeline) {
                return res.status(400).json(createErrorResponse('Champs requis manquants'));
            }

            const orderData = {
                user_id: userId,
                user_email: userEmail,
                user_name: userName,
                service_type: serviceType,
                title: title.trim(),
                description: description.trim(),
                budget_range: budget,
                timeline: timeline,
                references: references || null,
                attachments: attachments || [],
                contact_preference: contactPreference || 'email',
                additional_notes: additionalNotes || null,
                status: 'pending',
                admin_response: null,
                quoted_price: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('custom_orders')
                .insert([orderData])
                .select()
                .single();

            if (error) throw error;

            // TODO: Send notification email to admin
            // TODO: Send Discord webhook notification

            return res.status(201).json(createSuccessResponse(data, 'Demande envoyée avec succès'));
        }

        // PUT - Update custom order (admin response)
        if (req.method === 'PUT') {
            const adminSecret = getAdminSecret();
            const requestSecret = req.headers['x-admin-secret'];

            if (!adminSecret || requestSecret !== adminSecret) {
                return res.status(403).json(createErrorResponse('Accès non autorisé'));
            }

            const { id, status, adminResponse, quotedPrice } = req.body;

            if (!id) {
                return res.status(400).json(createErrorResponse('ID de commande requis'));
            }

            const updateData = {
                updated_at: new Date().toISOString()
            };

            if (status) updateData.status = status;
            if (adminResponse !== undefined) updateData.admin_response = adminResponse;
            if (quotedPrice !== undefined) updateData.quoted_price = quotedPrice;

            const { data, error } = await supabase
                .from('custom_orders')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // TODO: Send notification email to user about update

            return res.status(200).json(createSuccessResponse(data, 'Commande mise à jour'));
        }

        // DELETE - Delete custom order (admin only)
        if (req.method === 'DELETE') {
            const adminSecret = getAdminSecret();
            const requestSecret = req.headers['x-admin-secret'];

            if (!adminSecret || requestSecret !== adminSecret) {
                return res.status(403).json(createErrorResponse('Accès non autorisé'));
            }

            const { id } = req.query;

            if (!id) {
                return res.status(400).json(createErrorResponse('ID de commande requis'));
            }

            const { error } = await supabase
                .from('custom_orders')
                .delete()
                .eq('id', id);

            if (error) throw error;

            return res.status(200).json(createSuccessResponse(null, 'Commande supprimée'));
        }

        return res.status(405).json(createErrorResponse('Méthode non autorisée'));

    } catch (error) {
        console.error('Custom Orders API Error:', error);
        return res.status(500).json(createErrorResponse(error.message || 'Erreur serveur'));
    }
}
