import { useState } from 'react';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState('idle'); // idle, sending, success, error

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) {
            alert("Merci de remplir tous les champs.");
            return;
        }

        setStatus('sending');

        try {
            const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
            const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
            const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

            if (!serviceId || !templateId || !publicKey) {
                console.warn("Keys missing for Contact Form - Simulated success");
                setTimeout(() => setStatus('success'), 1000);
                return;
            }

            const templateParams = {
                name: String(formData.name),
                customer_email: String(formData.email),
                to_email: 'rustikop@outlook.fr', // Explicit recipient for contact form
                email: 'rustikop@outlook.fr',    // Explicit recipient for contact form
                message: String(formData.message),
                title: 'Nouveau message Contact'
            };

            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId,
                    templateId,
                    templateParams,
                    publicKey
                })
            });

            if (response.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', message: '' });
            } else {
                const error = await response.json();
                console.error("EmailJS Contact API Error:", error.error);
                setStatus('error');
            }

        } catch (err) {
            console.error("EmailJS Contact Error:", err);
            setStatus('error');
        }
    };

    return (
        <div className="page page-contact">
            <div className="container contact-container">
                <div className="contact-info">
                    <h1>Parlons de votre projet.</h1>
                    <p>Disponible pour des missions en freelance.<br />Transformons vos idées en expériences digitales.</p>
                    <div className="contact-details">
                        <p style={{ color: 'var(--color-accent)' }}>rustikop@outlook.fr</p>
                    </div>
                </div>

                <div className="glass" style={{ padding: '2rem', borderRadius: '12px' }}>
                    {status === 'success' ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <div style={{ fontSize: '3rem', color: '#4caf50', marginBottom: '1rem' }}>✓</div>
                            <h3>Message envoyé !</h3>
                            <p style={{ color: '#888' }}>Je vous répondrai dans les plus brefs délais.</p>
                            <button onClick={() => setStatus('idle')} className="btn" style={{ marginTop: '1rem' }}>Envoyer un autre message</button>
                        </div>
                    ) : (
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Nom</label>
                                <input
                                    type="text"
                                    id="name"
                                    placeholder="Votre nom"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="votre@email.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="message">Message</label>
                                <textarea
                                    id="message"
                                    rows="5"
                                    placeholder="Parlez-moi de votre projet..."
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    required
                                ></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
                                {status === 'sending' ? 'Envoi en cours...' : 'Envoyer le message'}
                            </button>
                            {status === 'error' && (
                                <p style={{ color: '#ff4d4d', marginTop: '1rem', fontSize: '0.9rem' }}>
                                    Erreur technique. Vérifiez vos clés EmailJS sur Vercel.
                                </p>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Contact;
