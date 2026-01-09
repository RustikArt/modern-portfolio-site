export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { serviceId, templateId, templateParams, publicKey } = req.body;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    if (!privateKey) {
        console.error("CRITICAL: EMAILJS_PRIVATE_KEY is missing in Vercel environment variables.");
        return res.status(500).json({ error: "Configuration du serveur incomplète (Clé privée manquante)." });
    }

    try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                service_id: serviceId,
                template_id: templateId,
                user_id: publicKey,
                accessToken: privateKey,
                template_params: templateParams,
            }),
        });

        const data = await response.text();

        if (!response.ok) {
            console.error("EmailJS API Error:", data);
            return res.status(response.status).json({ error: data });
        }

        return res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Serverless Email Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
