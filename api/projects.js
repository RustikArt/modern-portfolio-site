import { createClient } from '@supabase/supabase-js';
import { setCorsHeaders, handleCorsPreFlight, handleError } from './middleware.js';

// Utiliser la clé de service pour contourner les politiques RLS
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('CRITICAL: NEXT_PUBLIC_SUPABASE_URL missing in environment variables');
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('CRITICAL: Supabase credentials missing in environment variables');
}

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