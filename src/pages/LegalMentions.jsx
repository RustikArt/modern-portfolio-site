import SEO from '../components/SEO';

const LegalMentions = () => {
    return (
        <div className="page" style={{ paddingTop: '120px', minHeight: '100vh' }}>
            <SEO
                title="Mentions Légales | Rustikop"
                description="Mentions légales du site Rustikop - Informations sur l'éditeur, l'hébergeur et les droits."
            />
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 className="page-title">Mentions Légales</h1>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>Éditeur du site</h2>
                    <p style={{ lineHeight: '1.8', color: '#aaa' }}>
                        <strong style={{ color: '#fff' }}>Rustikop</strong><br />
                        Adresse : Pas d'adresse fixe. Organisation numérique.<br />
                        Email : <a href="mailto:rustikop@outlook.fr" style={{ color: 'var(--color-accent)' }}>rustikop@outlook.fr</a><br />
                        Téléphone : A venir...<br />
                        SIRET : En cours de création...
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>Directeur de la publication</h2>
                    <p style={{ lineHeight: '1.8', color: '#aaa' }}>
                        Rustik, fondateur de l'organisation et développeur du site.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>Hébergeur</h2>
                    <p style={{ lineHeight: '1.8', color: '#aaa' }}>
                        <strong style={{ color: '#fff' }}>Vercel Inc.</strong><br />
                        340 S Lemon Ave #4133<br />
                        Walnut, CA 91789<br />
                        États-Unis
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>Propriété intellectuelle</h2>
                    <p style={{ lineHeight: '1.8', color: '#aaa' }}>
                        L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle.
                        Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
                        Cependant, lors de production d'oeuvre à but commerciale, l'oeuvre est propriété de Rustikop ET de l'acheteur.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>Protection des données</h2>
                    <p style={{ lineHeight: '1.8', color: '#aaa' }}>
                        Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification,
                        de suppression et de portabilité de vos données personnelles. Pour exercer ces droits, contactez-nous à : <a href="mailto:rustikop@outlook.fr" style={{ color: 'var(--color-accent)' }}>rustikop@outlook.fr</a>.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>Cookies et Analytics</h2>
                    <p style={{ lineHeight: '1.8', color: '#aaa' }}>
                        Ce site utilise des cookies d'analyse (Vercel Analytics) pour comprendre comment les visiteurs utilisent le site.
                        Ces données sont anonymisées et ne permettent pas de vous identifier personnellement.<br /><br />
                        <strong style={{ color: '#fff' }}>Consentement :</strong> Lors de votre première visite, une bannière vous permet d'accepter ou de refuser ces cookies.
                        Votre choix est respecté et peut être modifié à tout moment via les paramètres de votre navigateur.<br /><br />
                        <strong style={{ color: '#fff' }}>Note pour les administrateurs :</strong> Les utilisateurs ayant un rôle d'administration acceptent automatiquement
                        les cookies d'analytics, nécessaires au bon fonctionnement du tableau de bord.<br /><br />
                        Pour plus de détails, consultez notre <a href="/privacy" style={{ color: 'var(--color-accent)' }}>Politique de Confidentialité</a>.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default LegalMentions;
