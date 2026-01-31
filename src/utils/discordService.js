/**
 * Discord notification service for frontend
 * Sends notifications via the API endpoint
 */

/**
 * Send a Discord notification
 * @param {string} type - Notification type: 'order', 'user', 'review', 'contact'
 * @param {Object} data - Data for the notification
 * @returns {Promise<boolean>} - Success status
 */
export async function sendDiscordNotification(type, data) {
    try {
        const response = await fetch('/api/discord-notify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type, data }),
        });

        if (!response.ok) {
            console.warn('[Discord] Notification failed:', response.status);
            return false;
        }

        return true;
    } catch (error) {
        console.warn('[Discord] Failed to send notification:', error.message);
        return false;
    }
}

/**
 * Notify Discord of a new contact message
 */
export async function notifyNewContactMessage(name, email, message) {
    return sendDiscordNotification('contact', { name, email, message });
}

/**
 * Notify Discord of a new review
 */
export async function notifyNewReview(review, productName) {
    return sendDiscordNotification('review', { review, productName });
}

/**
 * Notify Discord of a new order (usually called from backend)
 */
export async function notifyNewOrder(order) {
    return sendDiscordNotification('order', order);
}

/**
 * Notify Discord of a new user (usually called from backend)
 */
export async function notifyNewUser(user) {
    return sendDiscordNotification('user', user);
}

export default {
    sendDiscordNotification,
    notifyNewContactMessage,
    notifyNewReview,
    notifyNewOrder,
    notifyNewUser,
};
