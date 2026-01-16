import { Shield, Lock, Eye, Database } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="page" style={{ paddingTop: '100px', paddingBottom: '4rem', background: '#080808', minHeight: '100vh', color: '#ccc' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <h1 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '2rem' }}>Politique de Confidentialité</h1>
                <p style={{ fontStyle: 'italic', marginBottom: '3rem' }}>Dernière mise à jour : {new Date().toLocaleDateString()}</p>

                <section style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <Shield size={24} color="var(--color-accent)" />
                        <h2 style={{ color: 'white' }}>1. Introduction</h2>
                    </div>
                    <p>
                        Chez Rustikop, nous prenons la confidentialité de vos données très au sérieux.
                        Cette politique décrit comment nous collectons, utilisons et protégeons vos informations personnelles lorsque vous utilisez notre site web.
                    </p>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <Database size={24} color="var(--color-accent)" />
                        <h2 style={{ color: 'white' }}>2. Données Collectées</h2>
                    </div>
                    <ul style={{ lineHeight: '1.8', listStyleType: 'disc', paddingLeft: '1.5rem' }}>
                        <li><strong>Informations de Compte :</strong> Nom, adresse email et mot de passe chiffré.</li>
                        <li><strong>Données de Commandes :</strong> Historique d'achats, adresses de livraison (traitées via Stripe).</li>
                        <li><strong>Données Techniques :</strong> Adresse IP (anonymisée), type de navigateur et appareil pour la sécurité.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <Lock size={24} color="var(--color-accent)" />
                        <h2 style={{ color: 'white' }}>3. Sécurité des Données</h2>
                    </div>
                    <p>
                        Vos mots de passe sont hachés cryptographiquement avant d'être stockés. Nous mettons en œuvre des protocoles de sécurité
                        pour protéger vos données contre les accès non autorisés (Session timeout, alertes de connexion).
                    </p>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <Eye size={24} color="var(--color-accent)" />
                        <h2 style={{ color: 'white' }}>4. Cookies</h2>
                    </div>
                    <p>
                        Nous utilisons des cookies essentiels pour maintenir votre session de connexion active.
                        Vous pouvez gérer vos préférences en matière de cookies via la bannière dédiée ou les paramètres de votre navigateur.
                    </p>
                </section>

                <section>
                    <h2 style={{ color: 'white', marginBottom: '1rem' }}>5. Vos Droits</h2>
                    <p>
                        Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
                        Pour exercer ces droits, contactez-nous à <a href="mailto:privacy@rustikop.com" style={{ color: 'var(--color-accent)' }}>privacy@rustikop.com</a>.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
