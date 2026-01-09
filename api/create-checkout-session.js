import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { cart, promo, success_url, cancel_url } = req.body;

            const line_items = cart.map(item => {
                const product_data = {
                    name: item.name,
                };

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

            // Add discount line item if promo exists
            if (promo) {
                let discount_amount = 0;
                const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

                if (promo.type === 'percent') {
                    discount_amount = subtotal * (promo.value / 100);
                } else if (promo.type === 'fixed') {
                    discount_amount = promo.value;
                }

                // Ensure discount doesn't exceed subtotal
                discount_amount = Math.min(discount_amount, subtotal);

                if (discount_amount > 0) {
                    line_items.push({
                        price_data: {
                            currency: 'eur',
                            product_data: {
                                name: `Remise Coupon: ${promo.code}`,
                            },
                            unit_amount: -Math.round(discount_amount * 100),
                        },
                        quantity: 1,
                    });
                }
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items,
                mode: 'payment',
                success_url: success_url,
                cancel_url: cancel_url,
            });

            res.status(200).json({ id: session.id, url: session.url });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}
