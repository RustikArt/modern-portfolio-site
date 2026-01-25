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

            if (error) {
                console.error('Settings GET error:', error);
                throw error;
            }
            
            console.log('Settings fetched:', settings);
            res.status(200).json(settings && settings.length > 0 ? settings[0] : {});
        } else if (req.method === 'PUT') {
            // Admin only: update settings
            if (!requireAdminAuth(req, res)) return;

            console.log('Settings PUT received body:', req.body);

            const { 
                maintenanceMode, 
                grainEffect,
                showLoadingScreen,
                siteTitle, 
                contactEmail, 
                supportPhone,
                navbarPadding,
                socials 
            } = req.body;

            const { data: existing, error: fetchError } = await supabase
                .from('portfolio_settings')
                .select('*')
                .limit(1);

            if (fetchError) {
                console.error('Settings fetch existing error:', fetchError);
                throw fetchError;
            }

            // Merge with existing data to preserve fields not being updated
            const existingSettings = existing && existing.length > 0 ? existing[0] : {};
            console.log('Existing settings:', existingSettings);
            
            const settingsData = {
                maintenance_mode: maintenanceMode !== undefined ? Boolean(maintenanceMode) : Boolean(existingSettings.maintenance_mode),
                grain_effect: grainEffect !== undefined ? Boolean(grainEffect) : Boolean(existingSettings.grain_effect),
                show_loading_screen: showLoadingScreen !== undefined ? Boolean(showLoadingScreen) : (existingSettings.show_loading_screen !== false),
                site_title: siteTitle !== undefined ? siteTitle : (existingSettings.site_title || 'RUSTIKOP'),
                contact_email: contactEmail !== undefined ? contactEmail : (existingSettings.contact_email || ''),
                support_phone: supportPhone !== undefined ? supportPhone : (existingSettings.support_phone || ''),
                navbar_padding: navbarPadding !== undefined ? navbarPadding : (existingSettings.navbar_padding || 'normal'),
                socials: socials || existingSettings.socials || {},
                updated_at: new Date().toISOString()
            };

            console.log('Settings data to save:', settingsData);

            let error;
            let result;

            if (existing && existing.length > 0) {
                console.log('Updating existing settings with id:', existing[0].id);
                result = await supabase
                    .from('portfolio_settings')
                    .update(settingsData)
                    .eq('id', existing[0].id)
                    .select();
                error = result.error;
                console.log('Update result:', result);
            } else {
                console.log('Inserting new settings');
                result = await supabase
                    .from('portfolio_settings')
                    .insert([settingsData])
                    .select();
                error = result.error;
                console.log('Insert result:', result);
            }

            if (error) {
                console.error('Settings save error:', error);
                throw error;
            }

            const { data: updated, error: getError } = await supabase
                .from('portfolio_settings')
                .select('*')
                .order('id', { ascending: false })
                .limit(1);

            if (getError) {
                console.error('Settings refetch error:', getError);
                throw getError;
            }

            console.log('Final updated settings:', updated);
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
