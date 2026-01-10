import { kv } from '@vercel/kv';

const PROMO_KEY = 'portfolio_promoCodes';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const promoCodes = await kv.get(PROMO_KEY) || [];
            res.status(200).json(promoCodes);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch promo codes' });
        }
    } else if (req.method === 'POST') {
        try {
            const newPromo = req.body;
            const promoCodes = await kv.get(PROMO_KEY) || [];
            const updatedPromoCodes = [...promoCodes, { ...newPromo, id: Date.now() }];
            await kv.set(PROMO_KEY, updatedPromoCodes);
            res.status(201).json(updatedPromoCodes);
        } catch (error) {
            res.status(500).json({ error: 'Failed to add promo code' });
        }
    } else if (req.method === 'DELETE') {
        try {
            const { id } = req.body;
            const promoCodes = await kv.get(PROMO_KEY) || [];
            const updatedPromoCodes = promoCodes.filter(c => c.id !== id);
            await kv.set(PROMO_KEY, updatedPromoCodes);
            res.status(200).json(updatedPromoCodes);
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete promo code' });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}