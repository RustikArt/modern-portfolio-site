import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { cart, success_url, cancel_url } = req.body;

            const line_items = cart.map(item => {
                const product_data = {
                    name: item.name,
                };

                // Only add image if it looks like an absolute URL
                if (item.image && (item.image.startsWith('http') || item.image.startsWith('https'))) {
                    product_data.images = [item.image];
                }

                return {
                    price_data: {
                        currency: 'eur',
                        product_data: product_data,
                        unit_amount: Math.round(Number(item.price) * 100),
                    },
                    quantity: item.quantity,
                };
            });

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items,
                mode: 'payment',
                success_url: success_url,
                cancel_url: cancel_url,
            });

            res.status(200).json({ id: session.id });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}
