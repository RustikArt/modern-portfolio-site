/**
 * Discord Webhook Integration
 * Sends notifications to Discord channels
 */

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

/**
 * Send a message to Discord via webhook
 * @param {Object} embed - Discord embed object
 * @returns {Promise<boolean>} - Success status
 */
export async function sendDiscordNotification(embed) {
    if (!DISCORD_WEBHOOK_URL) {
        console.warn('[Discord] Webhook URL not configured - skipping notification');
        return false;
    }

    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                embeds: [embed],
            }),
        });

        if (!response.ok) {
            console.error('[Discord] Webhook error:', response.status, await response.text());
            return false;
        }

        console.log('[Discord] Notification sent successfully');
        return true;
    } catch (error) {
        console.error('[Discord] Failed to send notification:', error.message);
        return false;
    }
}

/**
 * Notification templates for different events
 */
export const DiscordNotifications = {
    /**
     * New order notification
     */
    newOrder: (order) => ({
        title: '🛒 Nouvelle Commande !',
        color: 0x4CAF50, // Green
        fields: [
            {
                name: '👤 Client',
                value: order.customerName || order.customer_name || 'Non spécifié',
                inline: true,
            },
            {
                name: '📧 Email',
                value: order.email || 'Non spécifié',
                inline: true,
            },
            {
                name: '💰 Total',
                value: `${order.total?.toFixed(2) || '0.00'} €`,
                inline: true,
            },
            {
                name: '📦 Articles',
                value: formatOrderItems(order.items),
                inline: false,
            },
            {
                name: '🏠 Livraison',
                value: formatShippingAddress(order.shipping),
                inline: false,
            },
            {
                name: '📋 Statut',
                value: order.status || 'Payé',
                inline: true,
            },
            {
                name: '🎟️ Code Promo',
                value: order.promoCodeUsed || order.promo_code_used || 'Aucun',
                inline: true,
            },
        ],
        timestamp: new Date().toISOString(),
        footer: {
            text: 'Rustikop Dashboard',
        },
    }),

    /**
     * New user registration notification
     */
    newUser: (user) => ({
        title: '👤 Nouveau Compte Créé !',
        color: 0x2196F3, // Blue
        fields: [
            {
                name: '📛 Nom',
                value: user.name || 'Non spécifié',
                inline: true,
            },
            {
                name: '📧 Email',
                value: user.email || 'Non spécifié',
                inline: true,
            },
            {
                name: '🔐 Rôle',
                value: user.role || 'client',
                inline: true,
            },
            {
                name: '🏷️ Titre',
                value: user.roleTitle || user.role_title || 'Client',
                inline: true,
            },
        ],
        timestamp: new Date().toISOString(),
        footer: {
            text: 'Rustikop Dashboard',
        },
    }),

    /**
     * New review notification
     */
    newReview: (review, productName) => ({
        title: '⭐ Nouvel Avis Client !',
        color: 0xFFC107, // Yellow/Gold
        fields: [
            {
                name: '📦 Produit',
                value: productName || 'Produit inconnu',
                inline: true,
            },
            {
                name: '👤 Auteur',
                value: review.user || 'Anonyme',
                inline: true,
            },
            {
                name: '⭐ Note',
                value: '⭐'.repeat(review.rating || 0) + '☆'.repeat(5 - (review.rating || 0)) + ` (${review.rating}/5)`,
                inline: true,
            },
            {
                name: '💬 Commentaire',
                value: review.comment || 'Pas de commentaire',
                inline: false,
            },
            {
                name: '✅ Vérifié',
                value: review.isVerified ? 'Oui' : 'Non',
                inline: true,
            },
        ],
        timestamp: new Date().toISOString(),
        footer: {
            text: 'Rustikop Dashboard',
        },
    }),

    /**
     * New contact message notification
     */
    newContactMessage: (message) => ({
        title: '📬 Nouveau Message de Contact !',
        color: 0x9C27B0, // Purple
        fields: [
            {
                name: '👤 Nom',
                value: message.name || 'Non spécifié',
                inline: true,
            },
            {
                name: '📧 Email',
                value: message.email || 'Non spécifié',
                inline: true,
            },
            {
                name: '💬 Message',
                value: truncateText(message.message, 1000) || 'Pas de message',
                inline: false,
            },
        ],
        timestamp: new Date().toISOString(),
        footer: {
            text: 'Rustikop Dashboard',
        },
    }),
};

/**
 * Helper: Format order items for Discord
 */
function formatOrderItems(items) {
    if (!items) return 'Aucun article';
    
    try {
        const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
        if (!Array.isArray(parsedItems) || parsedItems.length === 0) return 'Aucun article';
        
        return parsedItems
            .map(item => `• ${item.name || item.title || 'Article'} x${item.quantity || 1} - ${(item.price || 0).toFixed(2)}€`)
            .join('\n')
            .substring(0, 1000); // Discord field limit
    } catch {
        return String(items).substring(0, 1000);
    }
}

/**
 * Helper: Format shipping address for Discord
 */
function formatShippingAddress(shipping) {
    if (!shipping) return 'Non spécifiée';
    
    try {
        const addr = typeof shipping === 'string' ? JSON.parse(shipping) : shipping;
        const parts = [
            addr.firstName && addr.lastName ? `${addr.firstName} ${addr.lastName}` : null,
            addr.address || addr.street,
            addr.city && addr.postalCode ? `${addr.postalCode} ${addr.city}` : (addr.city || addr.postalCode),
            addr.country,
            addr.phone ? `📞 ${addr.phone}` : null,
        ].filter(Boolean);
        
        return parts.length > 0 ? parts.join('\n') : 'Non spécifiée';
    } catch {
        return String(shipping).substring(0, 500);
    }
}

/**
 * Helper: Truncate text for Discord limits
 */
function truncateText(text, maxLength = 1000) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

export default {
    sendDiscordNotification,
    DiscordNotifications,
};
