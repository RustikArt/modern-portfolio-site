import { Shield, Lock, Eye, Database, BarChart3, UserCog } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="page" style={{ paddingTop: '100px', paddingBottom: '4rem', background: '#080808', minHeight: '100vh', color: '#ccc' }}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <h1 style={{ fontSize: '2.5rem', color: 'white', marginBottom: '2rem' }}>Politique de Confidentialité</h1>
                <p style={{ fontStyle: 'italic', marginBottom: '3rem' }}>Dernière mise à jour : 31 janvier 2026</p>

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
                        <li><strong>Données d'Analytics :</strong> Pages visitées, temps de navigation (anonymisées, uniquement si vous acceptez les cookies).</li>
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
                        <h2 style={{ color: 'white' }}>4. Cookies et Consentement</h2>
                    </div>
                    <p style={{ marginBottom: '1rem' }}>
                        Nous utilisons deux types de stockage :
                    </p>
                    <ul style={{ lineHeight: '1.8', listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                        <li><strong>LocalStorage (essentiel) :</strong> Sauvegarde de votre panier, préférences et session de connexion. Nécessaire au fonctionnement du site.</li>
                        <li><strong>Cookies d'Analytics (optionnel) :</strong> Vercel Analytics pour comprendre l'utilisation du site. Données anonymisées, jamais vendues.</li>
                    </ul>
                    <p>
                        Vous pouvez accepter ou refuser les cookies d'analytics via la bannière qui s'affiche lors de votre première visite.
                        Votre choix est sauvegardé et respecté. Vous pouvez modifier votre choix à tout moment en supprimant les données du site dans les paramètres de votre navigateur.
                    </p>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <BarChart3 size={24} color="var(--color-accent)" />
                        <h2 style={{ color: 'white' }}>5. Vercel Analytics</h2>
                    </div>
                    <p style={{ marginBottom: '1rem' }}>
                        Si vous acceptez les cookies, nous utilisons <strong>Vercel Analytics</strong> pour :
                    </p>
                    <ul style={{ lineHeight: '1.8', listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                        <li>Comprendre quelles pages sont les plus visitées</li>
                        <li>Améliorer l'expérience utilisateur</li>
                        <li>Détecter les problèmes techniques</li>
                    </ul>
                    <p>
                        Ces données sont <strong>anonymisées</strong> : nous ne pouvons pas identifier individuellement les visiteurs.
                        Vercel Analytics est conforme au RGPD et ne partage pas les données avec des tiers publicitaires.
                    </p>
                </section>

                <section style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <UserCog size={24} color="var(--color-accent)" />
                        <h2 style={{ color: 'white' }}>6. Cas particulier : Administrateurs</h2>
                    </div>
                    <p>
                        Les utilisateurs ayant un rôle d'administrateur, éditeur ou super-administrateur acceptent automatiquement les cookies d'analytics
                        lors de leur connexion. Ceci est nécessaire pour le bon fonctionnement du tableau de bord et le suivi des performances du site.
                        Cette acceptation est une condition d'utilisation des fonctionnalités d'administration.
                    </p>
                </section>

                <section>
                    <h2 style={{ color: 'white', marginBottom: '1rem' }}>7. Vos Droits (RGPD)</h2>
                    <p style={{ marginBottom: '1rem' }}>
                        Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
                    </p>
                    <ul style={{ lineHeight: '1.8', listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                        <li><strong>Droit d'accès :</strong> Obtenir une copie de vos données personnelles</li>
                        <li><strong>Droit de rectification :</strong> Corriger des données inexactes</li>
                        <li><strong>Droit à l'effacement :</strong> Demander la suppression de vos données</li>
                        <li><strong>Droit d'opposition :</strong> Refuser le traitement de vos données à des fins spécifiques</li>
                        <li><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré</li>
                    </ul>
                    <p>
                        Pour exercer ces droits, contactez-nous à <a href="mailto:rustikop@outlook.fr" style={{ color: 'var(--color-accent)' }}>rustikop@outlook.fr</a>.
                        Nous répondrons dans un délai de 30 jours.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
