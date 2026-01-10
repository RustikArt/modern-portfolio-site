import { kv } from '@vercel/kv';

const PROJECTS_KEY = 'portfolio_projects';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const projects = await kv.get(PROJECTS_KEY) || [];
            res.status(200).json(projects);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch projects' });
        }
    } else if (req.method === 'POST') {
        try {
            const newProject = req.body;
            const projects = await kv.get(PROJECTS_KEY) || [];
            const updatedProjects = [...projects, { ...newProject, id: Date.now() }];
            await kv.set(PROJECTS_KEY, updatedProjects);
            res.status(201).json(updatedProjects);
        } catch (error) {
            res.status(500).json({ error: 'Failed to add project' });
        }
    } else if (req.method === 'PUT') {
        try {
            const { id, ...updatedProject } = req.body;
            const projects = await kv.get(PROJECTS_KEY) || [];
            const updatedProjects = projects.map(p => p.id === id ? { ...p, ...updatedProject } : p);
            await kv.set(PROJECTS_KEY, updatedProjects);
            res.status(200).json(updatedProjects);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update project' });
        }
    } else if (req.method === 'DELETE') {
        try {
            const { id } = req.body;
            const projects = await kv.get(PROJECTS_KEY) || [];
            const updatedProjects = projects.filter(p => p.id !== id);
            await kv.set(PROJECTS_KEY, updatedProjects);
            res.status(200).json(updatedProjects);
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete project' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}