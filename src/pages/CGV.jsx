import SEO from '../components/SEO';

const CGV = () => {
    return (
        <div className="page" style={{ paddingTop: '120px', minHeight: '100vh' }}>
            <SEO
                title="Conditions Générales de Vente | Rustikop"
                description="Conditions générales de vente du site Rustikop - Informations sur les commandes, paiements et livraisons."
            />
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 className="page-title">Conditions Générales de Vente</h1>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>Article 1 - Objet</h2>
                    <p style={{ lineHeight: '1.8', color: '#aaa' }}>
                        Les présentes conditions générales de vente régissent les relations contractuelles entre Rustikop et ses clients,
                        dans le cadre de la vente de services créatifs et de produits artisanaux numériques.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>Article 2 - Prix</h2>
                    <p style={{ lineHeight: '1.8', color: '#aaa' }}>
                        Les prix indiqués sur le site sont exprimés en euros (€) et s'entendent toutes taxes comprises (TTC).
                        Rustikop se réserve le droit de modifier ses prix à tout moment, étant entendu que les produits seront facturés
                        sur la base des tarifs en vigueur au moment de la validation de la commande.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>Article 3 - Commande</h2>
                    <p style={{ lineHeight: '1.8', color: '#aaa' }}>
                        La commande n'est définitive qu'après confirmation par email et réception du paiement.
                        Le client recevra un récapitulatif de sa commande par email dans les 24 heures suivant la validation.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>Article 4 - Paiement</h2>
                    <p style={{ lineHeight: '1.8', color: '#aaa' }}>
                        Le paiement s'effectue par carte bancaire via la plateforme sécurisée Stripe.
                        Les données bancaires sont cryptées et ne transitent pas par nos serveurs.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>Article 5 - Livraison</h2>
                    <p style={{ lineHeight: '1.8', color: '#aaa' }}>
                        Pour les produits numériques, la livraison s'effectue par email ou téléchargement direct après validation du paiement.<br /><br />
                        Pour les produits physiques, les délais de livraison sont indiqués lors de la commande et peuvent varier selon la destination.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>Article 6 - Droit de rétractation</h2>
                    <p style={{ lineHeight: '1.8', color: '#aaa' }}>
                        Conformément à l'article L121-21 du Code de la consommation, vous disposez d'un délai de 14 jours à compter de la réception
                        de votre commande pour exercer votre droit de rétractation.<br /><br />
                        <strong style={{ color: '#fff' }}>Exception :</strong> Ce droit ne s'applique pas aux services personnalisés ou aux
                        contenus numériques fournis sur support immatériel dont l'exécution a commencé avec l'accord du consommateur.
                    </p>
                </section>

                <section style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>Article 7 - Contact</h2>
                    <p style={{ lineHeight: '1.8', color: '#aaa' }}>
                        Pour toute question relative aux CGV ou à vos commandes :<br />
                        Email : contact@rustikop.com
                    </p>
                </section>
            </div>
        </div>
    );
};

export default CGV;
