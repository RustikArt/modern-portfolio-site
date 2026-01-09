import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { cart, promo, success_url, cancel_url } = req.body;

            // 1. Calculate the total discount amount to apply
            let totalDiscountCents = 0;
            const subtotalCents = cart.reduce((acc, item) => acc + (Math.round(item.price * 100) * item.quantity), 0);

            if (promo) {
                if (promo.type === 'percent') {
                    totalDiscountCents = Math.round(subtotalCents * (promo.value / 100));
                } else if (promo.type === 'fixed') {
                    totalDiscountCents = Math.round(promo.value * 100);
                }
            }

            // Ensure discount doesn't exceed total (keep at least 0.50€ or similar if needed, or 0)
            totalDiscountCents = Math.min(totalDiscountCents, subtotalCents);

            // 2. Prepare line items with adjusted prices
            let remainingDiscount = totalDiscountCents;
            const line_items = cart.map((item, index) => {
                const product_data = {
                    name: item.name + (promo ? ' (Promo appliquée)' : ''),
                };

                if (item.image && (item.image.startsWith('http') || item.image.startsWith('https'))) {
                    product_data.images = [item.image];
                }

                let itemTotalCents = Math.round(item.price * 100) * item.quantity;

                // Deduct from this item's total
                const deduction = Math.min(remainingDiscount, itemTotalCents);
                itemTotalCents -= deduction;
                remainingDiscount -= deduction;

                // Calculate the new unit_amount (must be an integer)
                // If quantity > 1, we might have a remainder problem, let's simplify:
                // We treat each quantity as a separate unit if needed, 
                // but the easiest is to just adjust the unit price.
                const newUnitAmount = Math.max(0, Math.floor(itemTotalCents / item.quantity));

                return {
                    price_data: {
                        currency: 'eur',
                        product_data: product_data,
                        unit_amount: newUnitAmount,
                    },
                    quantity: item.quantity,
                };
            });

            // Prepare session configuration
            const sessionConfig = {
                payment_method_types: ['card'],
                line_items,
                mode: 'payment',
                success_url: success_url,
                cancel_url: cancel_url,
            };

            const session = await stripe.checkout.sessions.create(sessionConfig);
            res.status(200).json({ id: session.id, url: session.url });
        } catch (err) {
            console.error("Stripe Session Error:", err);
            res.status(500).json({ error: err.message });
        }
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}
