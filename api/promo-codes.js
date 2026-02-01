import { createClient } from '@supabase/supabase-js';
import { setCorsHeaders, handleCorsPreFlight, handleError, requireAdminAuth } from '../lib/middleware.js';

// Configuration Supabase - NEVER hardcode keys
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('CRITICAL ERROR: Supabase credentials missing!');
    console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
}

// Create Supabase client
console.log('[api/promo-codes] Creating Supabase client...');
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;
console.log('[api/promo-codes] Supabase client created:', supabase ? '✓' : '✗ NULL');

export default async function handler(req, res) {
    // Configurer les headers CORS
    setCorsHeaders(res);

    // Gérer les requêtes OPTIONS
    if (handleCorsPreFlight(req, res)) {
        return;
    }

    if (req.method === 'GET') {
        try {
            const { data: promoCodes, error } = await supabase
                .from('portfolio_promo_codes')
                .select('*')
                .order('id', { ascending: true });
            if (error) throw error;
            res.status(200).json(promoCodes || []);
        } catch (error) {
            console.error('Fetch promo codes error:', error);
            handleError(res, error, 500);
        }
    } else if (req.method === 'POST') {
        if (!requireAdminAuth(req, res)) return;
        try {
            const newPromoCode = req.body;
            const { data, error } = await supabase
                .from('portfolio_promo_codes')
                .insert([newPromoCode])
                .select();
            if (error) throw error;
            // Return all promo codes
            const { data: allPromoCodes, error: fetchError } = await supabase
                .from('portfolio_promo_codes')
                .select('*')
                .order('id', { ascending: true });
            if (fetchError) throw fetchError;
            res.status(201).json(allPromoCodes);
        } catch (error) {
            console.error('Add promo code error:', error);
            handleError(res, error, 500);
        }
    } else if (req.method === 'PUT') {
        try {
            const { id, code, incrementUse, ...updatedPromoCode } = req.body;
            
            // Cas spécial: incrémenter l'utilisation du code promo (pas besoin d'auth admin)
            if (incrementUse && code) {
                console.log('[api/promo-codes] Incrementing use for code:', code);
                
                // Récupérer le code promo actuel
                const { data: promoData, error: fetchError } = await supabase
                    .from('portfolio_promo_codes')
                    .select('id, uses, current_uses')
                    .eq('code', code.toUpperCase())
                    .single();
                
                if (fetchError || !promoData) {
                    console.error('[api/promo-codes] Code not found:', code);
                    return res.status(404).json({ error: 'Code promo non trouvé' });
                }
                
                // Incrémenter le compteur
                const currentUses = promoData.current_uses || promoData.uses || 0;
                const { error: updateError } = await supabase
                    .from('portfolio_promo_codes')
                    .update({ 
                        uses: currentUses + 1,
                        current_uses: currentUses + 1 
                    })
                    .eq('id', promoData.id);
                
                if (updateError) {
                    console.error('[api/promo-codes] Failed to increment:', updateError);
                    throw updateError;
                }
                
                console.log('[api/promo-codes] Successfully incremented use for:', code);
                return res.status(200).json({ success: true, newUses: currentUses + 1 });
            }
            
            // Cas normal: mise à jour admin
            if (!requireAdminAuth(req, res)) return;
            
            const numId = Number(id);
            const { data, error } = await supabase
                .from('portfolio_promo_codes')
                .update(updatedPromoCode)
                .eq('id', numId)
                .select();
            if (error) throw error;
            // Return all promo codes
            const { data: allPromoCodes, error: fetchError } = await supabase
                .from('portfolio_promo_codes')
                .select('*')
                .order('id', { ascending: true });
            if (fetchError) throw fetchError;
            res.status(200).json(allPromoCodes);
        } catch (error) {
            console.error('Update promo code error:', error);
            handleError(res, error, 500);
        }
    } else if (req.method === 'DELETE') {
        if (!requireAdminAuth(req, res)) return;
        try {
            const { id } = req.body;
            const numId = Number(id);
            const { data, error } = await supabase
                .from('portfolio_promo_codes')
                .delete()
                .eq('id', numId);
            if (error) throw error;
            // Return all promo codes
            const { data: allPromoCodes, error: fetchError } = await supabase
                .from('portfolio_promo_codes')
                .select('*')
                .order('id', { ascending: true });
            if (fetchError) throw fetchError;
            res.status(200).json(allPromoCodes);
        } catch (error) {
            console.error('Delete promo code error:', error);
            handleError(res, error, 500);
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}