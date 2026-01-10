import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
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
            res.status(500).json({ error: 'Failed to fetch projects' });
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
            res.status(500).json({ error: 'Failed to add project' });
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
            res.status(500).json({ error: 'Failed to update project' });
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
            res.status(500).json({ error: 'Failed to delete project' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}