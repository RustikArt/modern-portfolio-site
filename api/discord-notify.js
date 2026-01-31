/**
 * Discord Notification API Endpoint
 * Handles Discord webhook notifications from the frontend
 */

import { setCorsHeaders, handleCorsPreFlight, handleError } from '../lib/middleware.js';
import { sendDiscordNotification, DiscordNotifications } from '../lib/discord.js';

export default async function handler(req, res) {
    setCorsHeaders(res, req.headers.origin);
    if (handleCorsPreFlight(req, res)) return;

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { type, data } = req.body;

        if (!type || !data) {
            return res.status(400).json({ error: 'Type et data sont requis' });
        }

        let embed;

        switch (type) {
            case 'order':
                embed = DiscordNotifications.newOrder(data);
                break;
            case 'user':
                embed = DiscordNotifications.newUser(data);
                break;
            case 'review':
                embed = DiscordNotifications.newReview(data.review, data.productName);
                break;
            case 'contact':
                embed = DiscordNotifications.newContactMessage(data);
                break;
            default:
                return res.status(400).json({ error: `Type de notification inconnu: ${type}` });
        }

        const success = await sendDiscordNotification(embed);

        if (success) {
            return res.status(200).json({ message: 'Notification Discord envoyée' });
        } else {
            return res.status(500).json({ error: 'Échec de l\'envoi de la notification Discord' });
        }
    } catch (error) {
        console.error('[api/discord-notify] Error:', error);
        handleError(res, error);
    }
}
