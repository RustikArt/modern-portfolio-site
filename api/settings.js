import { createClient } from '@supabase/supabase-js';
import { setCorsHeaders, handleCorsPreFlight, handleError, requireAdminAuth } from '../lib/middleware.js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

export default async function handler(req, res) {
    setCorsHeaders(res, req.headers.origin);
    if (handleCorsPreFlight(req, res)) return;

    if (!supabase) {
        console.error('Supabase not initialized. URL:', SUPABASE_URL ? 'SET' : 'NOT SET', 'KEY:', SUPABASE_KEY ? 'SET' : 'NOT SET');
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
                .order('id', { ascending: true })
                .limit(1);

            if (error) {
                throw error;
            }
            
            res.status(200).json(settings && settings.length > 0 ? settings[0] : {});
        } else if (req.method === 'PUT') {
            // Admin only: update settings
            if (!requireAdminAuth(req, res)) return;

            const { 
                maintenanceMode, 
                grainEffect,
                showLoadingScreen,
                showAdminLoading,
                siteTitle, 
                contactEmail, 
                supportPhone,
                navbarPadding,
                socials,
                transparentLogo,
                blackLogo,
                favicon
            } = req.body;

            const { data: existing, error: fetchError } = await supabase
                .from('portfolio_settings')
                .select('*')
                .limit(1);

            if (fetchError) {
                throw fetchError;
            }

            // Merge with existing data to preserve fields not being updated
            const existingSettings = existing && existing.length > 0 ? existing[0] : {};
            
            const settingsData = {
                maintenance_mode: maintenanceMode !== undefined ? Boolean(maintenanceMode) : Boolean(existingSettings.maintenance_mode),
                grain_effect: grainEffect !== undefined ? Boolean(grainEffect) : Boolean(existingSettings.grain_effect),
                show_loading_screen: showLoadingScreen !== undefined ? Boolean(showLoadingScreen) : (existingSettings.show_loading_screen !== false),
                show_admin_loading: showAdminLoading !== undefined ? Boolean(showAdminLoading) : (existingSettings.show_admin_loading !== false),
                site_title: siteTitle !== undefined ? siteTitle : (existingSettings.site_title || 'RUSTIKOP'),
                contact_email: contactEmail !== undefined ? contactEmail : (existingSettings.contact_email || ''),
                support_phone: supportPhone !== undefined ? supportPhone : (existingSettings.support_phone || ''),
                navbar_padding: navbarPadding !== undefined ? navbarPadding : (existingSettings.navbar_padding || 'normal'),
                socials: socials || existingSettings.socials || {},
                transparent_logo: transparentLogo !== undefined ? transparentLogo : (existingSettings.transparent_logo || 'PurpleLogoTransparent.png'),
                black_logo: blackLogo !== undefined ? blackLogo : (existingSettings.black_logo || 'PurpleLogo.png'),
                favicon: favicon !== undefined ? favicon : (existingSettings.favicon || 'PurpleLogov2.png'),
                updated_at: new Date().toISOString()
            };

            let error;
            let result;

            if (existing && existing.length > 0) {
                result = await supabase
                    .from('portfolio_settings')
                    .update(settingsData)
                    .eq('id', existing[0].id)
                    .select();
                error = result.error;
            } else {
                result = await supabase
                    .from('portfolio_settings')
                    .insert([settingsData])
                    .select();
                error = result.error;
            }

            if (error) {
                throw error;
            }

            const { data: updated, error: getError } = await supabase
                .from('portfolio_settings')
                .select('*')
                .order('id', { ascending: true })
                .limit(1);

            if (getError) {
                throw getError;
            }

            res.status(200).json(updated && updated.length > 0 ? updated[0] : settingsData);
        } else {
            res.setHeader('Allow', ['GET', 'PUT']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        handleError(res, error, 500);
    }
}
