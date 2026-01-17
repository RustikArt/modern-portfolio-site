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
                        Adresse : [À compléter]<br />
                        Email : contact@rustikop.com<br />
                        Téléphone : [À compléter]<br />
                        SIRET : [À compléter]
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>Directeur de la publication</h2>
                    <p style={{ lineHeight: '1.8', color: '#aaa' }}>
                        [Nom du directeur de publication à compléter]
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
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>Protection des données</h2>
                    <p style={{ lineHeight: '1.8', color: '#aaa' }}>
                        Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification,
                        de suppression et de portabilité de vos données personnelles. Pour exercer ces droits, contactez-nous à : contact@rustikop.com
                    </p>
                </section>
            </div>
        </div>
    );
};

export default LegalMentions;
