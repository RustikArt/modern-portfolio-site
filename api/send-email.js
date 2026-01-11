import { setCorsHeaders, handleCorsPreFlight, checkRateLimit, handleError } from './middleware.js';

export default async function handler(req, res) {
    // Configurer les headers CORS
    setCorsHeaders(res);
    
    // Gérer les requêtes OPTIONS
    if (handleCorsPreFlight(req, res)) {
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Rate limiting par IP
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        if (!checkRateLimit(clientIp, 5, 60000)) {
            return res.status(429).json({ error: 'Trop de requêtes. Veuillez réessayer plus tard.' });
        }

        const { serviceId, templateId, templateParams, publicKey } = req.body;
        const privateKey = process.env.EMAILJS_PRIVATE_KEY;

        if (!privateKey) {
            console.error("CRITICAL: EMAILJS_PRIVATE_KEY is missing in Vercel environment variables.");
            return res.status(500).json({ error: "Configuration du serveur incomplète (Clé privée manquante)." });
        }

        // Valider les paramètres d'entrée
        if (!serviceId || !templateId || !templateParams || !publicKey) {
            return res.status(400).json({ error: 'Paramètres manquants' });
        }

        // Vérifier que templateParams est un objet
        if (typeof templateParams !== 'object' || templateParams === null) {
            return res.status(400).json({ error: 'Paramètres de template invalides' });
        }
        // Utiliser le format officiel de l'API REST EmailJS
        const payload = {
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            accessToken: privateKey,
            template_params: templateParams,
        };

        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.text();

        if (!response.ok) {
            console.error("EmailJS REST API Error:", data);
            return res.status(response.status).json({ error: 'Erreur lors de l\'envoi de l\'email' });
        }

        return res.status(200).json({ message: "Email envoyé avec succès" });
    } catch (error) {
        handleError(res, error, 500);
    }
}
