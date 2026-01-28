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
console.log('[api/projects] Creating Supabase client...');
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;
console.log('[api/projects] Supabase client created:', supabase ? '✓' : '✗ NULL');

export default async function handler(req, res) {
    // Configurer les headers CORS
    setCorsHeaders(res);

    // Gérer les requêtes OPTIONS
    if (handleCorsPreFlight(req, res)) {
        return;
    }

    if (req.method === 'GET') {
        try {
            const { data: projects, error } = await supabase
                .from('portfolio_projects')
                .select('*')
                .order('id', { ascending: true });
            if (error) throw error;
            res.status(200).json(projects || []);
        } catch (error) {
            console.error('Fetch projects error:', error);
            handleError(res, error, 500);
        }
    } else if (req.method === 'POST') {
        if (!requireAdminAuth(req, res)) return;
        try {
            const newProject = req.body;
            const { data, error } = await supabase
                .from('portfolio_projects')
                .insert([newProject])
                .select();
            if (error) throw error;
            // Return all projects
            const { data: allProjects, error: fetchError } = await supabase
                .from('portfolio_projects')
                .select('*')
                .order('id', { ascending: true });
            if (fetchError) throw fetchError;
            res.status(201).json(allProjects);
        } catch (error) {
            console.error('Add project error:', error);
            handleError(res, error, 500);
        }
    } else if (req.method === 'PUT') {
        if (!requireAdminAuth(req, res)) return;
        try {
            const { id, ...updatedProject } = req.body;
            const numId = Number(id);
            const { data, error } = await supabase
                .from('portfolio_projects')
                .update(updatedProject)
                .eq('id', numId)
                .select();
            if (error) throw error;
            // Return all projects
            const { data: allProjects, error: fetchError } = await supabase
                .from('portfolio_projects')
                .select('*')
                .order('id', { ascending: true });
            if (fetchError) throw fetchError;
            res.status(200).json(allProjects);
        } catch (error) {
            console.error('Update project error:', error);
            handleError(res, error, 500);
        }
    } else if (req.method === 'DELETE') {
        if (!requireAdminAuth(req, res)) return;
        try {
            const { id } = req.body;
            const numId = Number(id);
            const { data, error } = await supabase
                .from('portfolio_projects')
                .delete()
                .eq('id', numId);
            if (error) throw error;
            // Return all projects
            const { data: allProjects, error: fetchError } = await supabase
                .from('portfolio_projects')
                .select('*')
                .order('id', { ascending: true });
            if (fetchError) throw fetchError;
            res.status(200).json(allProjects);
        } catch (error) {
            console.error('Delete project error:', error);
            handleError(res, error, 500);
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}