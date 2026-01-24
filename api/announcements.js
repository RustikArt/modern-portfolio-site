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
            // Public: fetch active announcements
            const { data: announcements, error } = await supabase
                .from('portfolio_announcements')
                .select('*')
                .eq('is_active', true)
                .order('updated_at', { ascending: false })
                .limit(1);

            if (error) throw error;
            res.status(200).json(announcements && announcements.length > 0 ? announcements[0] : null);
        } else if (req.method === 'POST') {
            // Admin only: create announcement
            if (!requireAdminAuth(req, res)) return;

            const {
                text,
                subtext,
                bgColor,
                textColor,
                isActive,
                link,
                showTimer,
                timerEnd,
                fontWeight,
                fontStyle,
                height
            } = req.body;

            if (!text) {
                return res.status(400).json({ error: 'Text is required' });
            }

            const announcementData = {
                text,
                subtext: subtext || '',
                bg_color: bgColor || '#d4af37',
                text_color: textColor || '#000000',
                is_active: isActive !== undefined ? isActive : true,
                link: link || '',
                show_timer: showTimer || false,
                timer_end: timerEnd || null,
                font_weight: fontWeight || '700',
                font_style: fontStyle || 'normal',
                height: height || '56px',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('portfolio_announcements')
                .insert([announcementData])
                .select();

            if (error) throw error;

            res.status(201).json(data && data.length > 0 ? data[0] : announcementData);
        } else if (req.method === 'PUT') {
            // Admin only: update announcement
            if (!requireAdminAuth(req, res)) return;

            const { id, ...updatedData } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'ID is required' });
            }

            const cleanedUpdate = {
                text: updatedData.text || undefined,
                subtext: updatedData.subtext !== undefined ? updatedData.subtext : undefined,
                bg_color: updatedData.bgColor || undefined,
                text_color: updatedData.textColor || undefined,
                is_active: updatedData.isActive !== undefined ? updatedData.isActive : undefined,
                link: updatedData.link !== undefined ? updatedData.link : undefined,
                show_timer: updatedData.showTimer !== undefined ? updatedData.showTimer : undefined,
                timer_end: updatedData.timerEnd || undefined,
                font_weight: updatedData.fontWeight || undefined,
                font_style: updatedData.fontStyle || undefined,
                height: updatedData.height || undefined,
                updated_at: new Date().toISOString()
            };

            // Remove undefined keys
            Object.keys(cleanedUpdate).forEach(
                k => cleanedUpdate[k] === undefined && delete cleanedUpdate[k]
            );

            const { error } = await supabase
                .from('portfolio_announcements')
                .update(cleanedUpdate)
                .eq('id', id);

            if (error) throw error;

            const { data: updated, error: getError } = await supabase
                .from('portfolio_announcements')
                .select('*')
                .eq('id', id)
                .limit(1);

            if (getError) throw getError;

            res.status(200).json(
                updated && updated.length > 0 ? updated[0] : cleanedUpdate
            );

        } else if (req.method === 'DELETE') {
            // Admin only: deactivate announcement
            if (!requireAdminAuth(req, res)) return;

            const { id } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'ID is required' });
            }

            const { error } = await supabase
                .from('portfolio_announcements')
                .update({
                    is_active: false,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            res.status(200).json({
                message: 'Announcement deactivated successfully'
            });

        } else {
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('Announcements API error:', error);
        handleError(res, error, 500);
    }
}
