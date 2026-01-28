import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image, url, type = 'website', schema }) => {
    const siteTitle = "Rustikop | Agence de Design Numérique";
    const defaultDescription = "Agence de design numérique spécialisée dans les expériences immersives, le développement web créatif et les solutions digitales innovantes.";
    const defaultImage = "/Logos/PurpleLogo.png";
    const siteUrl = "https://rustikop.vercel.app";

    const fullTitle = title ? `${title} | Rustikop` : siteTitle;
    const fullDescription = description || defaultDescription;
    const fullImage = image ? `${siteUrl}${image}` : `${siteUrl}${defaultImage}`;
    const fullUrl = url ? `${siteUrl}${url}` : siteUrl;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={fullDescription} />
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={fullDescription} />
            <meta property="og:image" content={fullImage} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={fullDescription} />
            <meta name="twitter:image" content={fullImage} />

            {/* Schema.org Structured Data */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
