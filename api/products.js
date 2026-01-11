import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const { data: products, error } = await supabase
                .from('portfolio_products')
                .select('*')
                .order('id', { ascending: true });
            if (error) throw error;
            res.status(200).json(products || []);
        } catch (error) {
            console.error('Fetch products error:', error);
            res.status(500).json({ error: 'Failed to fetch products' });
        }
    } else if (req.method === 'POST') {
        try {
            const newProduct = req.body;
            const { data, error } = await supabase
                .from('portfolio_products')
                .insert([newProduct])
                .select();
            if (error) throw error;
            // Return all products
            const { data: allProducts, error: fetchError } = await supabase
                .from('portfolio_products')
                .select('*')
                .order('id', { ascending: true });
            if (fetchError) throw fetchError;
            res.status(201).json(allProducts);
        } catch (error) {
            console.error('Add product error:', error);
            res.status(500).json({ error: 'Failed to add product' });
        }
    } else if (req.method === 'PUT') {
        try {
            const { id, ...updatedProduct } = req.body;
            const numId = Number(id);
            const { data, error } = await supabase
                .from('portfolio_products')
                .update(updatedProduct)
                .eq('id', numId)
                .select();
            if (error) throw error;
            // Return all products
            const { data: allProducts, error: fetchError } = await supabase
                .from('portfolio_products')
                .select('*')
                .order('id', { ascending: true });
            if (fetchError) throw fetchError;
            res.status(200).json(allProducts);
        } catch (error) {
            console.error('Update product error:', error);
            res.status(500).json({ error: 'Failed to update product' });
        }
    } else if (req.method === 'DELETE') {
        try {
            const { id } = req.body;
            const numId = Number(id);
            const { data, error } = await supabase
                .from('portfolio_products')
                .delete()
                .eq('id', numId);
            if (error) throw error;
            // Return all products
            const { data: allProducts, error: fetchError } = await supabase
                .from('portfolio_products')
                .select('*')
                .order('id', { ascending: true });
            if (fetchError) throw fetchError;
            res.status(200).json(allProducts);
        } catch (error) {
            console.error('Delete product error:', error);
            res.status(500).json({ error: 'Failed to delete product' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}