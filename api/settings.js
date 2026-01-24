import { createClient } from '@supabase/supabase-js';
import { setCorsHeaders, handleCorsPreFlight, handleError, requireAdminAuth } from './middleware.js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

export default async function handler(req, res) {
    setCorsHeaders(res, req.headers.origin);
    if (handleCorsPreFlight(req, res)) return;

    if (!supabase) {
        return res.status(500).json({
            error: 'Database connection not initialized',
            details: 'Supabase client is null. Check environment variables.'
        });
    }

    try {
        if (req.method === 'GET') {
            // Public: fetch settings
            const { data: settings, error } = await supabase
                .from('portfolio_settings')
                .select('*')
                .order('id', { ascending: false })
                .limit(1);

            if (error) throw error;
            res.status(200).json(settings && settings.length > 0 ? settings[0] : {});
        } else if (req.method === 'PUT') {
            // Admin only: update settings
            if (!requireAdminAuth(req, res)) return;

            const { 
                maintenanceMode, 
                grainEffect, 
                siteTitle, 
                contactEmail, 
                supportPhone, 
                socials 
            } = req.body;

            const { data: existing, error: fetchError } = await supabase
                .from('portfolio_settings')
                .select('id')
                .limit(1);

            if (fetchError) throw fetchError;

            const settingsData = {
                maintenance_mode: maintenanceMode !== undefined ? maintenanceMode : false,
                grain_effect: grainEffect !== undefined ? grainEffect : true,
                site_title: siteTitle || 'RUSTIKOP',
                contact_email: contactEmail || '',
                support_phone: supportPhone || '',
                socials: socials || {},
                updated_at: new Date().toISOString()
            };

            let error;
            let result;

            if (existing && existing.length > 0) {
                result = await supabase
                    .from('portfolio_settings')
                    .update(settingsData)
                    .eq('id', existing[0].id);
                error = result.error;
            } else {
                result = await supabase
                    .from('portfolio_settings')
                    .insert([settingsData]);
                error = result.error;
            }

            if (error) throw error;

            const { data: updated, error: getError } = await supabase
                .from('portfolio_settings')
                .select('*')
                .order('id', { ascending: false })
                .limit(1);

            if (getError) throw getError;

            res.status(200).json(updated && updated.length > 0 ? updated[0] : settingsData);
        } else {
            res.setHeader('Allow', ['GET', 'PUT']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('Settings API error:', error);
        handleError(res, error, 500);
    }
}
