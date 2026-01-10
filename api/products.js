import { kv } from '@vercel/kv';

const PRODUCTS_KEY = 'portfolio_products';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const products = await kv.get(PRODUCTS_KEY) || [];
            res.status(200).json(products);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch products' });
        }
    } else if (req.method === 'POST') {
        try {
            const newProduct = req.body;
            const products = await kv.get(PRODUCTS_KEY) || [];
            const updatedProducts = [...products, { ...newProduct, id: Date.now() }];
            await kv.set(PRODUCTS_KEY, updatedProducts);
            res.status(201).json(updatedProducts);
        } catch (error) {
            res.status(500).json({ error: 'Failed to add product' });
        }
    } else if (req.method === 'PUT') {
        try {
            const { id, ...updatedProduct } = req.body;
            const products = await kv.get(PRODUCTS_KEY) || [];
            const updatedProducts = products.map(p => p.id === id ? { ...p, ...updatedProduct } : p);
            await kv.set(PRODUCTS_KEY, updatedProducts);
            res.status(200).json(updatedProducts);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update product' });
        }
    } else if (req.method === 'DELETE') {
        try {
            const { id } = req.body;
            const products = await kv.get(PRODUCTS_KEY) || [];
            const updatedProducts = products.filter(p => p.id !== id);
            await kv.set(PRODUCTS_KEY, updatedProducts);
            res.status(200).json(updatedProducts);
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete product' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}