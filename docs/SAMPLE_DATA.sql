-- =====================================================
-- SAMPLE DATA - PROJETS ET ARTICLES COMPLETS
-- Avec options, tags, descriptions riches
-- =====================================================
-- 
-- ATTENTION: Exécutez ce script sur une base de données vide ou après DELETE
-- Les IDs seront auto-générés par la base de données
-- =====================================================

-- =====================================================
-- SUPPRESSION DES DONNÉES EXISTANTES (optionnel)
-- Décommentez si vous voulez repartir de zéro
-- =====================================================
-- DELETE FROM portfolio_reviews;
-- DELETE FROM portfolio_orders;
-- DELETE FROM portfolio_products;
-- DELETE FROM portfolio_projects;

-- =====================================================
-- PROJETS DE DÉMONSTRATION ENRICHIS
-- Avec blocks, description, client, testimonial, etc.
-- =====================================================

-- NOTE: Si certaines colonnes n'existent pas, exécutez d'abord SUPABASE_INIT.sql
-- ou utilisez la version simplifiée ci-dessous

INSERT INTO portfolio_projects (
    title, category, content, image, blocks, created_at
) VALUES

-- Projet 1: Site E-commerce Fashion
(
    'Boutique E-commerce Fashion',
    'Web Design',
    'Conception et développement d''une boutique en ligne moderne pour une marque de vêtements haut de gamme. Interface responsive avec système de panier intelligent, filtres avancés, wishlist et paiement sécurisé via Stripe.',
    'lucide:ShoppingBag',
    '[
        {"type":"title","content":"Le Challenge"},
        {"type":"text","content":"La marque ÉLÉGANCE souhaitait moderniser sa présence en ligne avec une boutique qui reflète son positionnement premium tout en offrant une expérience d''achat fluide et intuitive."},
        {"type":"title","content":"La Solution"},
        {"type":"text","content":"Nous avons créé un design épuré mettant en valeur les produits avec de grandes images, des animations subtiles et un parcours d''achat optimisé pour la conversion."},
        {"type":"title","content":"Résultats"},
        {"type":"text","content":"• +150% de taux de conversion\n• -40% de taux d''abandon de panier\n• Score Lighthouse 98/100"}
    ]'::jsonb,
    NOW() - INTERVAL '30 days'
),

-- Projet 2: Application Mobile Fitness
(
    'FitTrack - Application Fitness',
    'Mobile App',
    'Application mobile complète de suivi fitness avec tableau de bord personnalisé, programmes d''entraînement, suivi nutritionnel et intégration avec Apple Health et Google Fit.',
    'lucide:Dumbbell',
    '[
        {"type":"title","content":"Contexte"},
        {"type":"text","content":"FitTrack avait besoin d''une application mobile native pour iOS et Android permettant à ses utilisateurs de suivre leurs progrès fitness de manière intuitive."},
        {"type":"title","content":"Fonctionnalités clés"},
        {"type":"text","content":"• Programmes d''entraînement personnalisés\n• Suivi des calories et macros\n• Intégration wearables (Apple Watch, Fitbit)\n• Système de gamification avec badges\n• Mode hors-ligne"},
        {"type":"title","content":"Technologies"},
        {"type":"text","content":"React Native, Firebase, Node.js, PostgreSQL"}
    ]'::jsonb,
    NOW() - INTERVAL '25 days'
),

-- Projet 3: Dashboard Analytics SaaS
(
    'DataViz - Dashboard Analytics',
    'UI/UX Design',
    'Interface de tableau de bord pour une plateforme SaaS d''analytics B2B avec visualisations de données complexes, rapports automatisés et système d''alertes intelligent.',
    'lucide:BarChart3',
    '[
        {"type":"title","content":"Le Projet"},
        {"type":"text","content":"DataViz nécessitait une refonte complète de son dashboard pour améliorer l''expérience utilisateur et réduire le temps nécessaire pour extraire des insights."},
        {"type":"title","content":"Design System"},
        {"type":"text","content":"Création d''un design system complet avec 200+ composants réutilisables, mode sombre/clair et accessibilité WCAG 2.1 AA."},
        {"type":"title","content":"Impact"},
        {"type":"text","content":"• Temps moyen par session -35%\n• NPS score +40 points\n• Adoption des nouvelles features +200%"}
    ]'::jsonb,
    NOW() - INTERVAL '20 days'
),

-- Projet 4: Landing Page Startup
(
    'NeoBank - Landing Page',
    'Web Design',
    'Page d''atterrissage haute conversion pour une néobanque avec animations Framer Motion, formulaire d''inscription optimisé et intégration analytics avancée.',
    'lucide:Rocket',
    '[
        {"type":"title","content":"Objectif"},
        {"type":"text","content":"Créer une landing page qui convertit les visiteurs en utilisateurs de la liste d''attente avant le lancement officiel de NeoBank."},
        {"type":"title","content":"Approche"},
        {"type":"text","content":"Design moderne avec micro-interactions, social proof dynamique et A/B testing sur 5 variantes du CTA principal."},
        {"type":"title","content":"Performances"},
        {"type":"text","content":"• Taux de conversion 12.5%\n• 50,000+ inscrits en 2 semaines\n• Temps de chargement < 1.5s"}
    ]'::jsonb,
    NOW() - INTERVAL '15 days'
),

-- Projet 5: Branding Restaurant
(
    'La Table d''Or - Identité Visuelle',
    'Branding',
    'Création complète d''identité de marque pour un restaurant gastronomique étoilé : logo, palette couleurs, typographie, papeterie et guidelines.',
    'lucide:Palette',
    '[
        {"type":"title","content":"Brief"},
        {"type":"text","content":"La Table d''Or, restaurant étoilé Michelin, souhaitait une identité visuelle à la hauteur de son excellence culinaire, alliant tradition et modernité."},
        {"type":"title","content":"Livrables"},
        {"type":"text","content":"• Logo principal + déclinaisons\n• Palette de 5 couleurs\n• 2 typographies (titrage + corps)\n• Papeterie complète (cartes, menus, factures)\n• Guidelines de 40 pages"},
        {"type":"title","content":"Inspiration"},
        {"type":"text","content":"L''or, symbole d''excellence, combiné à des formes organiques évoquant la nature et les produits du terroir."}
    ]'::jsonb,
    NOW() - INTERVAL '10 days'
),

-- Projet 6: Portfolio Photographe
(
    'Lens & Light - Portfolio Photo',
    'Web Design',
    'Site portfolio minimaliste pour un photographe professionnel avec galerie plein écran, lazy loading optimisé et mode présentation client.',
    'lucide:Camera',
    '[
        {"type":"title","content":"Vision"},
        {"type":"text","content":"Créer un portfolio qui laisse toute la place aux photographies, avec une navigation invisible et une immersion totale dans le travail de l''artiste."},
        {"type":"title","content":"Features"},
        {"type":"text","content":"• Galerie plein écran avec zoom\n• Mode slideshow automatique\n• Espace client protégé par mot de passe\n• Formulaire de contact contextuel\n• Optimisation images WebP/AVIF"},
        {"type":"title","content":"Performance"},
        {"type":"text","content":"Score Lighthouse 100/100, temps de chargement moyen 0.8s, 0 CLS."}
    ]'::jsonb,
    NOW() - INTERVAL '5 days'
),

-- Projet 7: Application Web RH
(
    'TeamHub - Plateforme RH',
    'Web App',
    'Application web de gestion RH complète avec gestion des congés, onboarding, évaluations et tableau de bord manager.',
    'lucide:Users',
    '[
        {"type":"title","content":"Problématique"},
        {"type":"text","content":"TeamHub voulait remplacer leurs multiples outils RH par une plateforme unifiée et moderne."},
        {"type":"title","content":"Solution"},
        {"type":"text","content":"• Gestion des congés avec workflow d''approbation\n• Onboarding digital avec checklist\n• Évaluations 360° automatisées\n• Reporting RH en temps réel"},
        {"type":"title","content":"Stack Technique"},
        {"type":"text","content":"Next.js, Prisma, PostgreSQL, Tailwind CSS, Vercel"}
    ]'::jsonb,
    NOW() - INTERVAL '45 days'
),

-- Projet 8: Refonte UI App Banking
(
    'SecureBank - Refonte Mobile',
    'Mobile App',
    'Refonte complète de l''application mobile d''une banque traditionnelle avec focus sur l''accessibilité et la sécurité.',
    'lucide:Shield',
    '[
        {"type":"title","content":"Challenge"},
        {"type":"text","content":"Moderniser une app bancaire vieillissante tout en conservant la confiance des utilisateurs existants."},
        {"type":"title","content":"Approche UX"},
        {"type":"text","content":"• Audit UX complet avec 50 utilisateurs\n• Design inclusif (accessibilité AA)\n• Tests utilisateurs itératifs\n• Migration progressive"},
        {"type":"title","content":"Résultats"},
        {"type":"text","content":"Note App Store passée de 2.8 à 4.7 étoiles en 3 mois."}
    ]'::jsonb,
    NOW() - INTERVAL '60 days'
);

-- =====================================================
-- PRODUITS / ARTICLES ENRICHIS
-- Avec options, tags, alert_message, descriptions complètes
-- =====================================================

INSERT INTO portfolio_products (
    name, price, promo_price, category, image, stock, description, 
    is_featured, is_digital, tags, options, alert_message, created_at
) VALUES

-- 1. Création de Logo - AVEC OPTIONS
(
    'Création de Logo',
    149.00,
    NULL,
    'Logo',
    'lucide:Sparkles',
    99,
    'Conception de logo professionnel et mémorable. Inclut recherche créative, 3 propositions initiales, révisions jusqu''à satisfaction et livraison des fichiers sources haute qualité.',
    true,
    true,
    ARRAY['logo', 'identité', 'branding', 'design'],
    '[
        {"id": 1, "name": "Formule", "type": "select", "required": true, "values": [
            {"label": "Essentiel (3 propositions)", "priceModifier": 0},
            {"label": "Premium (5 propositions + favicon)", "priceModifier": 50},
            {"label": "Ultimate (8 propositions + déclinaisons)", "priceModifier": 100}
        ]},
        {"id": 2, "name": "Délai", "type": "select", "required": true, "values": [
            {"label": "Standard (7 jours)", "priceModifier": 0},
            {"label": "Express (3 jours)", "priceModifier": 30},
            {"label": "Urgent (24h)", "priceModifier": 80}
        ]},
        {"id": 3, "name": "Brief détaillé", "type": "text", "required": false}
    ]'::jsonb,
    NULL,
    NOW()
),

-- 2. Logo + Charte graphique - PROMO
(
    'Logo + Charte Graphique',
    299.00,
    249.00,
    'Logo',
    'lucide:BookOpen',
    99,
    'Pack complet d''identité visuelle : logo professionnel + charte graphique détaillée avec palette de couleurs, typographies, règles d''utilisation et déclinaisons pour tous supports.',
    true,
    true,
    ARRAY['logo', 'charte graphique', 'branding', 'identité visuelle'],
    '[
        {"id": 1, "name": "Pages de charte", "type": "select", "required": true, "values": [
            {"label": "Essentiel (10 pages)", "priceModifier": 0},
            {"label": "Standard (20 pages)", "priceModifier": 50},
            {"label": "Complet (40+ pages)", "priceModifier": 150}
        ]},
        {"id": 2, "name": "Mockups inclus", "type": "select", "required": false, "values": [
            {"label": "Non", "priceModifier": 0},
            {"label": "5 mockups", "priceModifier": 30},
            {"label": "15 mockups", "priceModifier": 60}
        ]}
    ]'::jsonb,
    '🎉 -50€ pour une durée limitée !',
    NOW()
),

-- 3. Bannière Simple
(
    'Bannière / Header',
    39.00,
    NULL,
    'Bannière',
    'lucide:Image',
    99,
    'Création de bannière professionnelle pour réseaux sociaux, site web, streaming ou e-commerce. Design sur-mesure adapté à vos besoins et votre charte graphique.',
    false,
    true,
    ARRAY['bannière', 'header', 'réseaux sociaux', 'twitch', 'youtube'],
    '[
        {"id": 1, "name": "Plateforme", "type": "select", "required": true, "values": [
            {"label": "Twitter/X", "priceModifier": 0},
            {"label": "YouTube", "priceModifier": 0},
            {"label": "Twitch", "priceModifier": 0},
            {"label": "LinkedIn", "priceModifier": 0},
            {"label": "Discord", "priceModifier": 0},
            {"label": "Site Web (personnalisé)", "priceModifier": 10}
        ]},
        {"id": 2, "name": "Style", "type": "select", "required": false, "values": [
            {"label": "Minimaliste", "priceModifier": 0},
            {"label": "Gaming/Esport", "priceModifier": 5},
            {"label": "Corporate", "priceModifier": 0},
            {"label": "Artistique", "priceModifier": 10}
        ]}
    ]'::jsonb,
    NULL,
    NOW()
),

-- 4. Pack Bannières - FEATURED + OPTIONS
(
    'Pack Bannières Réseaux Sociaux',
    89.00,
    79.00,
    'Bannière',
    'lucide:Images',
    99,
    'Pack complet de bannières cohérentes pour tous vos réseaux sociaux. Design unifié qui renforce votre identité sur Twitter, YouTube, Twitch, LinkedIn et Facebook.',
    true,
    true,
    ARRAY['pack', 'bannières', 'réseaux sociaux', 'branding'],
    '[
        {"id": 1, "name": "Réseaux inclus", "type": "select", "required": true, "values": [
            {"label": "3 réseaux au choix", "priceModifier": 0},
            {"label": "5 réseaux", "priceModifier": 20},
            {"label": "Tous les réseaux (8+)", "priceModifier": 40}
        ]},
        {"id": 2, "name": "Animations (GIF)", "type": "select", "required": false, "values": [
            {"label": "Non", "priceModifier": 0},
            {"label": "Oui (+1 bannière animée)", "priceModifier": 25}
        ]}
    ]'::jsonb,
    '⭐ Best-seller !',
    NOW()
),

-- 5. Site Web One Page
(
    'Site Web One Page',
    399.00,
    NULL,
    'Site Web',
    'lucide:Layout',
    50,
    'Site vitrine professionnel une page avec design responsive, formulaire de contact fonctionnel, optimisation SEO de base et hébergement inclus pendant 1 an.',
    false,
    true,
    ARRAY['site web', 'one page', 'vitrine', 'responsive', 'seo'],
    '[
        {"id": 1, "name": "Sections", "type": "select", "required": true, "values": [
            {"label": "5 sections", "priceModifier": 0},
            {"label": "8 sections", "priceModifier": 50},
            {"label": "12 sections", "priceModifier": 100}
        ]},
        {"id": 2, "name": "Animations", "type": "select", "required": false, "values": [
            {"label": "Basiques (fade-in)", "priceModifier": 0},
            {"label": "Avancées (parallax, scroll)", "priceModifier": 80}
        ]},
        {"id": 3, "name": "Hébergement supplémentaire", "type": "select", "required": false, "values": [
            {"label": "Non", "priceModifier": 0},
            {"label": "+1 an", "priceModifier": 50},
            {"label": "+2 ans", "priceModifier": 90}
        ]}
    ]'::jsonb,
    NULL,
    NOW()
),

-- 6. Site Web Multi-Pages - PROMO
(
    'Site Web Multi-Pages',
    799.00,
    699.00,
    'Site Web',
    'lucide:LayoutGrid',
    30,
    'Site web professionnel complet avec plusieurs pages, blog intégré, portfolio, pages de services et tableau de bord admin pour gérer votre contenu en autonomie.',
    true,
    true,
    ARRAY['site web', 'multi-pages', 'blog', 'cms', 'admin'],
    '[
        {"id": 1, "name": "Nombre de pages", "type": "select", "required": true, "values": [
            {"label": "5 pages", "priceModifier": 0},
            {"label": "10 pages", "priceModifier": 150},
            {"label": "20 pages", "priceModifier": 300}
        ]},
        {"id": 2, "name": "Blog", "type": "select", "required": false, "values": [
            {"label": "Non", "priceModifier": 0},
            {"label": "Blog simple", "priceModifier": 100},
            {"label": "Blog + catégories + recherche", "priceModifier": 200}
        ]},
        {"id": 3, "name": "Multilingue", "type": "select", "required": false, "values": [
            {"label": "Non", "priceModifier": 0},
            {"label": "2 langues", "priceModifier": 150},
            {"label": "3+ langues", "priceModifier": 250}
        ]}
    ]'::jsonb,
    '🔥 -100€ ce mois-ci !',
    NOW()
),

-- 7. Site E-commerce
(
    'Site E-commerce Complet',
    1499.00,
    NULL,
    'Site Web',
    'lucide:ShoppingCart',
    20,
    'Boutique en ligne professionnelle avec gestion des produits, panier intelligent, paiement sécurisé Stripe, espace client, gestion des commandes et backoffice admin complet.',
    false,
    true,
    ARRAY['e-commerce', 'boutique', 'stripe', 'panier', 'shop'],
    '[
        {"id": 1, "name": "Nombre de produits", "type": "select", "required": true, "values": [
            {"label": "Jusqu''à 50 produits", "priceModifier": 0},
            {"label": "Jusqu''à 200 produits", "priceModifier": 200},
            {"label": "Illimité", "priceModifier": 400}
        ]},
        {"id": 2, "name": "Options produits", "type": "select", "required": false, "values": [
            {"label": "Basique (taille/couleur)", "priceModifier": 0},
            {"label": "Avancé (variantes multiples)", "priceModifier": 150}
        ]},
        {"id": 3, "name": "Fonctionnalités", "type": "select", "multiSelect": true, "required": false, "values": [
            {"label": "Wishlist", "priceModifier": 50},
            {"label": "Avis clients", "priceModifier": 80},
            {"label": "Codes promo", "priceModifier": 60},
            {"label": "Newsletter", "priceModifier": 40}
        ]}
    ]'::jsonb,
    'Délai: 4-6 semaines',
    NOW()
),

-- 8. Illustration Personnalisée
(
    'Illustration Personnalisée',
    79.00,
    NULL,
    'Illustration',
    'lucide:PenTool',
    99,
    'Illustration digitale sur mesure selon votre brief : personnage, scène, mascotte, concept art ou illustration éditoriale. Style adapté à vos besoins.',
    false,
    true,
    ARRAY['illustration', 'digital art', 'dessin', 'personnage'],
    '[
        {"id": 1, "name": "Complexité", "type": "select", "required": true, "values": [
            {"label": "Simple (1 personnage/objet)", "priceModifier": 0},
            {"label": "Moyen (2-3 éléments)", "priceModifier": 40},
            {"label": "Complexe (scène complète)", "priceModifier": 100}
        ]},
        {"id": 2, "name": "Style", "type": "select", "required": true, "values": [
            {"label": "Flat design", "priceModifier": 0},
            {"label": "Semi-réaliste", "priceModifier": 30},
            {"label": "Cartoon", "priceModifier": 0},
            {"label": "Manga/Anime", "priceModifier": 20}
        ]},
        {"id": 3, "name": "Fond", "type": "select", "required": false, "values": [
            {"label": "Transparent", "priceModifier": 0},
            {"label": "Couleur unie", "priceModifier": 0},
            {"label": "Fond détaillé", "priceModifier": 50}
        ]}
    ]'::jsonb,
    NULL,
    NOW()
),

-- 9. Pack Illustrations
(
    'Pack 5 Illustrations',
    299.00,
    259.00,
    'Illustration',
    'lucide:Brush',
    50,
    'Pack de 5 illustrations cohérentes dans un style unifié. Idéal pour site web, application mobile, supports marketing ou communication de marque.',
    false,
    true,
    ARRAY['pack', 'illustrations', 'cohérent', 'branding'],
    '[
        {"id": 1, "name": "Utilisation", "type": "select", "required": true, "values": [
            {"label": "Site web / App", "priceModifier": 0},
            {"label": "Print / Marketing", "priceModifier": 20},
            {"label": "Réseaux sociaux", "priceModifier": 0}
        ]},
        {"id": 2, "name": "Nombre d''illustrations", "type": "select", "required": false, "values": [
            {"label": "5 illustrations", "priceModifier": 0},
            {"label": "8 illustrations", "priceModifier": 100},
            {"label": "12 illustrations", "priceModifier": 200}
        ]}
    ]'::jsonb,
    '💰 Économisez 40€ vs achat individuel',
    NOW()
),

-- 10. Modélisation 3D Objet
(
    'Modélisation 3D Objet',
    199.00,
    NULL,
    'Modélisation 3D',
    'lucide:Box',
    40,
    'Modélisation 3D d''un objet simple avec textures PBR et éclairage studio. Export dans tous les formats standards (FBX, OBJ, GLTF, Blender).',
    false,
    true,
    ARRAY['3D', 'modélisation', 'objet', 'blender', 'textures'],
    '[
        {"id": 1, "name": "Type d''objet", "type": "select", "required": true, "values": [
            {"label": "Objet simple (boîte, bouteille...)", "priceModifier": 0},
            {"label": "Objet moyen (meuble, véhicule...)", "priceModifier": 100},
            {"label": "Objet complexe (machine, détails fins)", "priceModifier": 200}
        ]},
        {"id": 2, "name": "Textures", "type": "select", "required": false, "values": [
            {"label": "Couleurs simples", "priceModifier": 0},
            {"label": "Textures PBR basiques", "priceModifier": 30},
            {"label": "Textures PBR haute qualité", "priceModifier": 80}
        ]},
        {"id": 3, "name": "Animation", "type": "select", "required": false, "values": [
            {"label": "Non", "priceModifier": 0},
            {"label": "Rotation 360°", "priceModifier": 40},
            {"label": "Animation personnalisée", "priceModifier": 100}
        ]}
    ]'::jsonb,
    NULL,
    NOW()
),

-- 11. Modélisation 3D Avancée
(
    'Modélisation 3D Avancée',
    499.00,
    NULL,
    'Modélisation 3D',
    'lucide:Boxes',
    25,
    'Modélisation 3D avancée pour personnage, scène complète ou environnement. Inclut rigging de base, textures détaillées et rendus haute qualité.',
    false,
    true,
    ARRAY['3D', 'personnage', 'scène', 'rigging', 'avancé'],
    '[
        {"id": 1, "name": "Type", "type": "select", "required": true, "values": [
            {"label": "Personnage stylisé", "priceModifier": 0},
            {"label": "Personnage réaliste", "priceModifier": 200},
            {"label": "Environnement / Scène", "priceModifier": 100}
        ]},
        {"id": 2, "name": "Rigging", "type": "select", "required": false, "values": [
            {"label": "Non", "priceModifier": 0},
            {"label": "Rigging basique", "priceModifier": 100},
            {"label": "Rigging avancé (facial)", "priceModifier": 250}
        ]}
    ]'::jsonb,
    'Délai: 2-4 semaines selon complexité',
    NOW()
),

-- 12. Animation Logo
(
    'Animation Logo / Motion',
    149.00,
    NULL,
    'Animation',
    'lucide:Play',
    60,
    'Animation fluide de votre logo avec motion design moderne. Parfait pour intro YouTube, site web, présentations ou réseaux sociaux.',
    false,
    true,
    ARRAY['animation', 'logo', 'motion design', 'intro', 'reveal'],
    '[
        {"id": 1, "name": "Durée", "type": "select", "required": true, "values": [
            {"label": "3-5 secondes", "priceModifier": 0},
            {"label": "5-10 secondes", "priceModifier": 40},
            {"label": "10-15 secondes", "priceModifier": 80}
        ]},
        {"id": 2, "name": "Style", "type": "select", "required": true, "values": [
            {"label": "Minimaliste", "priceModifier": 0},
            {"label": "Dynamique", "priceModifier": 20},
            {"label": "Cinématique", "priceModifier": 50}
        ]},
        {"id": 3, "name": "Son", "type": "select", "required": false, "values": [
            {"label": "Sans son", "priceModifier": 0},
            {"label": "Avec sound design", "priceModifier": 30}
        ]}
    ]'::jsonb,
    NULL,
    NOW()
),

-- 13. Animation Vidéo Explicative - PREMIUM
(
    'Animation Vidéo Explicative',
    599.00,
    NULL,
    'Animation',
    'lucide:Film',
    20,
    'Vidéo explicative animée professionnelle de 30-60 secondes avec storyboard complet, animation fluide, voix off optionnelle et musique libre de droits.',
    true,
    true,
    ARRAY['animation', 'vidéo explicative', 'motion', 'storyboard'],
    '[
        {"id": 1, "name": "Durée", "type": "select", "required": true, "values": [
            {"label": "30 secondes", "priceModifier": 0},
            {"label": "60 secondes", "priceModifier": 200},
            {"label": "90 secondes", "priceModifier": 400}
        ]},
        {"id": 2, "name": "Style d''animation", "type": "select", "required": true, "values": [
            {"label": "2D Flat design", "priceModifier": 0},
            {"label": "2D Isométrique", "priceModifier": 100},
            {"label": "Motion graphics", "priceModifier": 50}
        ]},
        {"id": 3, "name": "Voix off", "type": "select", "required": false, "values": [
            {"label": "Non", "priceModifier": 0},
            {"label": "Voix off FR", "priceModifier": 80},
            {"label": "Voix off FR + EN", "priceModifier": 150}
        ]},
        {"id": 4, "name": "Musique", "type": "select", "required": false, "values": [
            {"label": "Musique libre incluse", "priceModifier": 0},
            {"label": "Musique premium", "priceModifier": 30}
        ]}
    ]'::jsonb,
    '📹 Idéal pour présenter votre produit/service',
    NOW()
),

-- 14. Tableau Digital Art
(
    'Tableau Digital Art',
    149.00,
    129.00,
    'Tableau',
    'lucide:Frame',
    99,
    'Œuvre digitale originale sur commande. Portrait, paysage, abstrait, fan art ou illustration décorative. Fichier haute résolution prêt à imprimer.',
    false,
    true,
    ARRAY['digital art', 'tableau', 'poster', 'décoration', 'art'],
    '[
        {"id": 1, "name": "Type d''œuvre", "type": "select", "required": true, "values": [
            {"label": "Portrait (1 personne)", "priceModifier": 0},
            {"label": "Portrait (couple/duo)", "priceModifier": 50},
            {"label": "Paysage/Scène", "priceModifier": 30},
            {"label": "Abstrait", "priceModifier": 0},
            {"label": "Fan art", "priceModifier": 20}
        ]},
        {"id": 2, "name": "Taille", "type": "select", "required": true, "values": [
            {"label": "A4 (2480x3508px)", "priceModifier": 0},
            {"label": "A3 (3508x4961px)", "priceModifier": 20},
            {"label": "A2 / Poster (4961x7016px)", "priceModifier": 40}
        ]},
        {"id": 3, "name": "Style", "type": "select", "required": false, "values": [
            {"label": "Réaliste", "priceModifier": 50},
            {"label": "Semi-réaliste", "priceModifier": 20},
            {"label": "Cartoon / Stylisé", "priceModifier": 0}
        ]}
    ]'::jsonb,
    '🎨 -20€ en ce moment !',
    NOW()
),

-- 15. Montage Short - BEST SELLER
(
    'Montage Short / Reels',
    49.00,
    39.00,
    'Montage Vidéo',
    'lucide:Smartphone',
    99,
    'Montage vidéo dynamique format court optimisé pour TikTok, Instagram Reels ou YouTube Shorts. Effets tendance, transitions fluides et sous-titres automatiques.',
    true,
    true,
    ARRAY['montage', 'short', 'tiktok', 'reels', 'vertical'],
    '[
        {"id": 1, "name": "Plateforme cible", "type": "select", "required": true, "values": [
            {"label": "TikTok", "priceModifier": 0},
            {"label": "Instagram Reels", "priceModifier": 0},
            {"label": "YouTube Shorts", "priceModifier": 0},
            {"label": "Multi-plateforme (3 formats)", "priceModifier": 15}
        ]},
        {"id": 2, "name": "Sous-titres", "type": "select", "required": false, "values": [
            {"label": "Non", "priceModifier": 0},
            {"label": "Sous-titres animés", "priceModifier": 10},
            {"label": "Sous-titres + traduction EN", "priceModifier": 25}
        ]},
        {"id": 3, "name": "Effets", "type": "select", "required": false, "values": [
            {"label": "Basiques", "priceModifier": 0},
            {"label": "Effets tendance (zoom, shake...)", "priceModifier": 10}
        ]}
    ]'::jsonb,
    '🔥 Best-seller - Livré en 24-48h !',
    NOW()
),

-- 16. Montage Vidéo Long
(
    'Montage Vidéo Long',
    199.00,
    NULL,
    'Montage Vidéo',
    'lucide:Video',
    50,
    'Montage vidéo professionnel jusqu''à 10 minutes avec color grading cinématique, titrage animé, transitions fluides et sound design de qualité.',
    false,
    true,
    ARRAY['montage', 'vidéo', 'youtube', 'color grading', 'professionnel'],
    '[
        {"id": 1, "name": "Durée finale", "type": "select", "required": true, "values": [
            {"label": "Jusqu''à 5 min", "priceModifier": 0},
            {"label": "5-10 min", "priceModifier": 80},
            {"label": "10-20 min", "priceModifier": 180}
        ]},
        {"id": 2, "name": "Color grading", "type": "select", "required": false, "values": [
            {"label": "Correction de base", "priceModifier": 0},
            {"label": "Look cinématique", "priceModifier": 40}
        ]},
        {"id": 3, "name": "Motion graphics", "type": "select", "required": false, "values": [
            {"label": "Non", "priceModifier": 0},
            {"label": "Titres animés", "priceModifier": 30},
            {"label": "Infographies animées", "priceModifier": 80}
        ]},
        {"id": 4, "name": "Musique", "type": "select", "required": false, "values": [
            {"label": "Sans musique", "priceModifier": 0},
            {"label": "Musique libre de droits", "priceModifier": 0},
            {"label": "Sound design complet", "priceModifier": 50}
        ]}
    ]'::jsonb,
    NULL,
    NOW()
),

-- 17. Thumbnail YouTube
(
    'Thumbnail YouTube',
    29.00,
    NULL,
    'Bannière',
    'lucide:Youtube',
    99,
    'Miniature YouTube professionnelle conçue pour maximiser le CTR. Design accrocheur avec texte impactant, composition optimisée et couleurs qui attirent l''œil.',
    false,
    true,
    ARRAY['thumbnail', 'youtube', 'miniature', 'ctr'],
    '[
        {"id": 1, "name": "Style", "type": "select", "required": true, "values": [
            {"label": "Clean / Minimaliste", "priceModifier": 0},
            {"label": "Gaming / Dynamique", "priceModifier": 5},
            {"label": "Vlog / Lifestyle", "priceModifier": 0},
            {"label": "Tuto / Éducatif", "priceModifier": 0}
        ]},
        {"id": 2, "name": "Visage détouré", "type": "select", "required": false, "values": [
            {"label": "Non", "priceModifier": 0},
            {"label": "Oui (détourage inclus)", "priceModifier": 5}
        ]}
    ]'::jsonb,
    NULL,
    NOW()
),

-- 18. Pack Thumbnails - PROMO
(
    'Pack 5 Thumbnails YouTube',
    99.00,
    79.00,
    'Bannière',
    'lucide:Grid3x3',
    60,
    'Pack de 5 thumbnails YouTube cohérentes avec votre branding. Style unifié pour renforcer votre identité visuelle et optimiser la reconnaissance de votre chaîne.',
    false,
    true,
    ARRAY['pack', 'thumbnails', 'youtube', 'branding', 'série'],
    '[
        {"id": 1, "name": "Nombre de thumbnails", "type": "select", "required": true, "values": [
            {"label": "5 thumbnails", "priceModifier": 0},
            {"label": "10 thumbnails", "priceModifier": 60},
            {"label": "20 thumbnails", "priceModifier": 100}
        ]},
        {"id": 2, "name": "Template éditable", "type": "select", "required": false, "values": [
            {"label": "Non", "priceModifier": 0},
            {"label": "Template Photoshop", "priceModifier": 20},
            {"label": "Template Canva", "priceModifier": 15}
        ]}
    ]'::jsonb,
    '💰 -20€ ce mois-ci !',
    NOW()
),

-- 19. Emotes Twitch/Discord - NOUVEAU
(
    'Pack Emotes Twitch/Discord',
    59.00,
    NULL,
    'Illustration',
    'lucide:Smile',
    99,
    'Pack de 5 emotes personnalisées pour votre chaîne Twitch ou serveur Discord. Design cohérent avec votre identité et expressions variées.',
    true,
    true,
    ARRAY['emotes', 'twitch', 'discord', 'streaming', 'communauté'],
    '[
        {"id": 1, "name": "Nombre d''emotes", "type": "select", "required": true, "values": [
            {"label": "5 emotes", "priceModifier": 0},
            {"label": "10 emotes", "priceModifier": 40},
            {"label": "15 emotes", "priceModifier": 70}
        ]},
        {"id": 2, "name": "Style", "type": "select", "required": true, "values": [
            {"label": "Chibi / Cute", "priceModifier": 0},
            {"label": "Cartoon", "priceModifier": 0},
            {"label": "Pixel art", "priceModifier": 10},
            {"label": "Réaliste simplifié", "priceModifier": 20}
        ]},
        {"id": 3, "name": "Badges sub inclus", "type": "select", "required": false, "values": [
            {"label": "Non", "priceModifier": 0},
            {"label": "3 badges", "priceModifier": 20},
            {"label": "6 badges", "priceModifier": 35}
        ]}
    ]'::jsonb,
    '🎮 Parfait pour streamers !',
    NOW()
),

-- 20. Overlay Stream - NOUVEAU
(
    'Overlay Stream Complet',
    129.00,
    99.00,
    'Bannière',
    'lucide:Monitor',
    80,
    'Pack overlay streaming complet avec webcam frame, alertes, panneaux et écrans (starting, BRB, ending). Design professionnel et personnalisé.',
    true,
    true,
    ARRAY['overlay', 'stream', 'twitch', 'obs', 'gaming'],
    '[
        {"id": 1, "name": "Éléments inclus", "type": "select", "required": true, "values": [
            {"label": "Essentiel (webcam + panneaux)", "priceModifier": 0},
            {"label": "Standard (+ alertes + écrans)", "priceModifier": 40},
            {"label": "Premium (tout + animations)", "priceModifier": 100}
        ]},
        {"id": 2, "name": "Style", "type": "select", "required": true, "values": [
            {"label": "Minimaliste", "priceModifier": 0},
            {"label": "Gaming / Néon", "priceModifier": 10},
            {"label": "Anime / Kawaii", "priceModifier": 10},
            {"label": "Luxe / Premium", "priceModifier": 20}
        ]},
        {"id": 3, "name": "Animations", "type": "select", "required": false, "values": [
            {"label": "Non (statique)", "priceModifier": 0},
            {"label": "Animations légères", "priceModifier": 30},
            {"label": "Animations complètes", "priceModifier": 60}
        ]}
    ]'::jsonb,
    '🔥 -30€ pour le lancement !',
    NOW()
);

-- =====================================================
-- VÉRIFICATION DES INSERTIONS
-- =====================================================

SELECT 'Projets insérés:' as info, COUNT(*) as count FROM portfolio_projects WHERE created_at >= NOW() - INTERVAL '61 days';
SELECT 'Produits insérés:' as info, COUNT(*) as count FROM portfolio_products WHERE created_at >= NOW() - INTERVAL '1 day';

-- =====================================================
-- RÉSUMÉ DES DONNÉES
-- =====================================================
-- 
-- 8 PROJETS avec :
--   • Descriptions détaillées (dans content)
--   • Blocks riches (headings + textes)
--   • Catégories variées
--
-- 20 PRODUITS avec :
--   • Options configurables (formules, délais, styles...)
--   • Tags pour le filtrage
--   • Alertes et promos (-20€, -30€, -50€, etc.)
--   • Descriptions marketing complètes
--   • Stock et prix variés
--
-- CATÉGORIES PRODUITS:
--   • Logo (2)
--   • Bannière (5)
--   • Site Web (3)
--   • Illustration (3)
--   • Modélisation 3D (2)
--   • Animation (2)
--   • Tableau (1)
--   • Montage Vidéo (2)
--
-- =====================================================
