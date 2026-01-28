/**
 * Configuration SEO et Meta Tags
 */

export const SEO_CONFIG = {
    title: 'Rustikop - Design Numérique & Expériences Immersives',
    description: 'Agence de design numérique spécialisée dans les expériences immersives et les projets créatifs. Découvrez nos projets et services.',
    keywords: 'design numérique, expériences immersives, portfolio, agence créative, design graphique, illustration, web design, branding, identité visuelle, France',
    author: 'Rustikop',
    url: 'https://rustikop.vercel.app',
    image: 'https://rustikop.vercel.app/Logos/PurpleLogo.png',
    twitterHandle: '@rustikop',
};

export const updateMetaTags = (pageTitle, pageDescription, pageImage = null) => {
    // Mettre à jour le titre
    document.title = pageTitle || SEO_CONFIG.title;

    // Mettre à jour ou créer les meta tags
    updateMetaTag('description', pageDescription || SEO_CONFIG.description);
    updateMetaTag('og:title', pageTitle || SEO_CONFIG.title);
    updateMetaTag('og:description', pageDescription || SEO_CONFIG.description);
    updateMetaTag('og:image', pageImage || SEO_CONFIG.image);
    updateMetaTag('twitter:title', pageTitle || SEO_CONFIG.title);
    updateMetaTag('twitter:description', pageDescription || SEO_CONFIG.description);
    updateMetaTag('twitter:image', pageImage || SEO_CONFIG.image);
};

const updateMetaTag = (name, content) => {
    let element = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    
    if (!element) {
        element = document.createElement('meta');
        const isProperty = name.startsWith('og:') || name.startsWith('twitter:');
        if (isProperty) {
            element.setAttribute('property', name);
        } else {
            element.setAttribute('name', name);
        }
        document.head.appendChild(element);
    }
    
    element.setAttribute('content', content);
};

export const generateStructuredData = (type, data) => {
    const baseStructure = {
        '@context': 'https://schema.org',
        '@type': type,
    };

    switch (type) {
        case 'Organization':
            return {
                ...baseStructure,
                name: 'Rustikop',
                url: SEO_CONFIG.url,
                logo: SEO_CONFIG.image,
                description: SEO_CONFIG.description,
                sameAs: [
                    'https://twitter.com/rustikop',
                    'https://instagram.com/rustikop',
                ],
            };

        case 'LocalBusiness':
            return {
                ...baseStructure,
                name: 'Rustikop',
                image: SEO_CONFIG.image,
                description: SEO_CONFIG.description,
                url: SEO_CONFIG.url,
                telephone: '+33...',
                email: 'rustikop@outlook.fr',
                address: {
                    '@type': 'PostalAddress',
                    streetAddress: '',
                    addressLocality: '',
                    postalCode: '',
                    addressCountry: 'FR',
                },
            };

        case 'Product':
            return {
                ...baseStructure,
                name: data?.name || 'Produit',
                description: data?.description || '',
                image: data?.image || SEO_CONFIG.image,
                price: data?.price || '0',
                priceCurrency: 'EUR',
                availability: 'https://schema.org/InStock',
            };

        default:
            return baseStructure;
    }
};

export const injectStructuredData = (type, data) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(generateStructuredData(type, data));
    document.head.appendChild(script);
};
