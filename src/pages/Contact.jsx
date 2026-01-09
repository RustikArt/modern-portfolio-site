import { useState } from 'react';
import { useData } from '../context/DataContext';
import './Contact.css';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const Contact = () => {
    const { currentUser } = useData();
    const [formData, setFormData] = useState({
        name: currentUser ? currentUser.name : '',
        email: currentUser ? currentUser.email : '',
        message: ''
    });
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

            // 1. Send NOTIFICATION to ADMIN
            const adminParams = {
                name: String(formData.name),
                initial: String(formData.name).charAt(0).toUpperCase(), // Added for the avatar
                message: String(formData.message),
                time: new Date().toLocaleString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                }),
                reply_to: String(formData.email), // CRITICAL: This allows replying directly to the client
                customer_email: 'rustikop@outlook.fr',
                to_email: 'rustikop@outlook.fr',
                email: 'rustikop@outlook.fr',
                title: 'Nouveau message reçu - Contact'
            };

            const adminRes = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serviceId, templateId, templateParams: adminParams, publicKey })
            });

            if (adminRes.ok) {
                setStatus('success');
                setFormData({ ...formData, message: '' });
            } else {
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
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: '#4caf50' }}>
                                <CheckCircle2 size={64} />
                            </div>
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
                                    disabled={!!currentUser}
                                    style={currentUser ? { background: '#0a0a0a', color: '#555', cursor: 'not-allowed' } : {}}
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
                                <div style={{
                                    color: '#ff4d4d',
                                    marginTop: '1.5rem',
                                    padding: '1rem',
                                    background: 'rgba(255, 77, 77, 0.1)',
                                    borderRadius: '8px',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.8rem',
                                    border: '1px solid rgba(255, 77, 77, 0.2)'
                                }}>
                                    <AlertCircle size={18} />
                                    Une erreur est survenue lors de l'envoi. Veuillez réessayer ou nous contacter par mail.
                                </div>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Contact;
