-- =====================================================
-- SAMPLE DATA - PROJETS ET ARTICLES DE BASE
-- Tous avec icônes Lucide
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
-- PROJETS DE DÉMONSTRATION
-- L'image contient le nom de l'icône Lucide (préfixé lucide:)
-- =====================================================

INSERT INTO portfolio_projects (title, category, content, image, blocks, created_at) VALUES

-- Projet 1: Site E-commerce
(
    'Boutique E-commerce Fashion',
    'Web Design',
    'Conception et développement d''une boutique en ligne moderne pour une marque de vêtements. Interface responsive avec système de panier et paiement sécurisé.',
    'lucide:ShoppingBag',
    '[{"type":"text","content":"Un projet complet incluant UX research, design system et développement full-stack."}]'::jsonb,
    NOW() - INTERVAL '30 days'
),

-- Projet 2: Application Mobile
(
    'Application Fitness Tracker',
    'Mobile App',
    'Application mobile de suivi fitness avec tableau de bord personnalisé, statistiques et intégration de wearables.',
    'lucide:Dumbbell',
    '[{"type":"text","content":"Développé avec React Native pour iOS et Android."}]'::jsonb,
    NOW() - INTERVAL '25 days'
),

-- Projet 3: Dashboard Analytics
(
    'Dashboard Analytics SaaS',
    'UI/UX Design',
    'Interface de tableau de bord pour une plateforme SaaS d''analytics avec visualisations de données complexes.',
    'lucide:BarChart3',
    '[{"type":"text","content":"Design moderne avec charts interactifs et dark mode."}]'::jsonb,
    NOW() - INTERVAL '20 days'
),

-- Projet 4: Landing Page Startup
(
    'Landing Page Tech Startup',
    'Web Design',
    'Page d''atterrissage haute conversion pour une startup technologique avec animations et micro-interactions.',
    'lucide:Rocket',
    '[{"type":"text","content":"Optimisé pour la conversion avec A/B testing intégré."}]'::jsonb,
    NOW() - INTERVAL '15 days'
),

-- Projet 5: Branding & Identité
(
    'Identité Visuelle Restaurant',
    'Branding',
    'Création complète d''identité de marque pour un restaurant gastronomique : logo, palette couleurs, typographie.',
    'lucide:Palette',
    '[{"type":"text","content":"Branding premium avec charte graphique complète."}]'::jsonb,
    NOW() - INTERVAL '10 days'
),

-- Projet 6: Portfolio Photographe
(
    'Portfolio Photographe Pro',
    'Web Design',
    'Site portfolio minimaliste pour un photographe professionnel avec galerie plein écran et lazy loading.',
    'lucide:Camera',
    '[{"type":"text","content":"Focus sur la performance et l''expérience visuelle immersive."}]'::jsonb,
    NOW() - INTERVAL '5 days'
);

-- =====================================================
-- PRODUITS / ARTICLES DE DÉMONSTRATION
-- Services de base typiques d'un créatif freelance
-- L'image contient le nom de l'icône Lucide (préfixé lucide:)
-- =====================================================

INSERT INTO portfolio_products (name, price, promo_price, category, image, stock, description, is_featured, is_digital, created_at) VALUES

-- 1. Création de Logo
(
    'Création de Logo',
    149.00,
    NULL,
    'Logo',
    'lucide:Sparkles',
    99,
    'Conception de logo professionnel avec 3 propositions initiales, révisions illimitées et fichiers sources (AI, SVG, PNG).',
    true,
    true,
    NOW()
),

-- 2. Logo + Charte graphique
(
    'Logo + Charte Graphique',
    299.00,
    249.00,
    'Logo',
    'lucide:BookOpen',
    99,
    'Logo complet + charte graphique avec palette de couleurs, typographie, règles d''utilisation et déclinaisons.',
    false,
    true,
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
    'Création de bannière pour réseaux sociaux, site web ou streaming. Format adapté à vos besoins.',
    false,
    true,
    NOW()
),

-- 4. Pack Bannières (Réseaux sociaux)
(
    'Pack Bannières Réseaux Sociaux',
    89.00,
    NULL,
    'Bannière',
    'lucide:Images',
    99,
    'Pack complet de bannières pour tous vos réseaux : Twitter/X, YouTube, Twitch, LinkedIn, Facebook.',
    true,
    true,
    NOW()
),

-- 5. Site Web Simple (One Page)
(
    'Site Web One Page',
    399.00,
    NULL,
    'Site Web',
    'lucide:Layout',
    50,
    'Site vitrine une page responsive avec formulaire de contact, optimisé SEO et hébergement inclus 1 an.',
    false,
    true,
    NOW()
),

-- 6. Site Web Complet (Multi-pages)
(
    'Site Web Multi-Pages',
    799.00,
    699.00,
    'Site Web',
    'lucide:LayoutGrid',
    30,
    'Site web professionnel multi-pages avec blog, portfolio, pages de services et tableau de bord admin.',
    true,
    true,
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
    'Boutique en ligne complète avec gestion des produits, panier, paiement Stripe, espace client et backoffice.',
    false,
    true,
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
    'Illustration digitale sur mesure selon votre brief : personnage, scène, concept art, etc.',
    false,
    true,
    NOW()
),

-- 9. Pack Illustrations (5 pièces)
(
    'Pack 5 Illustrations',
    299.00,
    259.00,
    'Illustration',
    'lucide:Brush',
    50,
    'Pack de 5 illustrations cohérentes pour site web, application ou communication.',
    false,
    true,
    NOW()
),

-- 10. Modélisation 3D Simple
(
    'Modélisation 3D Objet',
    199.00,
    NULL,
    'Modélisation 3D',
    'lucide:Box',
    40,
    'Modélisation 3D d''un objet simple avec textures et éclairage. Export formats standards.',
    false,
    true,
    NOW()
),

-- 11. Modélisation 3D Complexe (Personnage/Scène)
(
    'Modélisation 3D Avancée',
    499.00,
    NULL,
    'Modélisation 3D',
    'lucide:Boxes',
    25,
    'Modélisation 3D avancée : personnage riggé, scène complète ou environnement détaillé.',
    false,
    true,
    NOW()
),

-- 12. Animation Simple
(
    'Animation Logo / Motion',
    149.00,
    NULL,
    'Animation',
    'lucide:Play',
    60,
    'Animation de votre logo ou motion design simple pour intro vidéo, site web ou réseaux sociaux.',
    false,
    true,
    NOW()
),

-- 13. Animation Complexe
(
    'Animation Vidéo Explicative',
    599.00,
    NULL,
    'Animation',
    'lucide:Film',
    20,
    'Vidéo explicative animée de 30-60 secondes avec storyboard, voix off optionnelle et musique.',
    false,
    true,
    NOW()
),

-- 14. Tableau Digital Art
(
    'Tableau Digital Art',
    149.00,
    NULL,
    'Tableau',
    'lucide:Frame',
    99,
    'Œuvre digitale originale sur commande. Portrait, paysage, abstrait ou fan art.',
    false,
    true,
    NOW()
),

-- 15. Montage Vidéo Short (TikTok/Reels)
(
    'Montage Short / Reels',
    49.00,
    39.00,
    'Montage Vidéo',
    'lucide:Smartphone',
    99,
    'Montage vidéo format court optimisé TikTok, Instagram Reels ou YouTube Shorts avec effets et transitions.',
    true,
    true,
    NOW()
),

-- 16. Montage Vidéo Complet
(
    'Montage Vidéo Long',
    199.00,
    NULL,
    'Montage Vidéo',
    'lucide:Video',
    50,
    'Montage vidéo professionnel jusqu''à 10 minutes avec color grading, titrage et sound design.',
    false,
    true,
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
    'Miniature YouTube accrocheuse et optimisée pour le clic. Style moderne avec texte impactant.',
    false,
    true,
    NOW()
),

-- 18. Pack Thumbnails
(
    'Pack 5 Thumbnails YouTube',
    99.00,
    79.00,
    'Bannière',
    'lucide:Grid3x3',
    60,
    'Pack de 5 thumbnails YouTube cohérentes avec votre branding pour vos prochaines vidéos.',
    false,
    true,
    NOW()
);

-- =====================================================
-- VÉRIFICATION DES INSERTIONS
-- =====================================================

SELECT 'Projets insérés:' as info, COUNT(*) as count FROM portfolio_projects WHERE created_at >= NOW() - INTERVAL '31 days';
SELECT 'Produits insérés:' as info, COUNT(*) as count FROM portfolio_products WHERE created_at >= NOW() - INTERVAL '1 day';

-- =====================================================
-- NOTES
-- =====================================================
-- 
-- Catégories de produits disponibles:
-- - Logo
-- - Bannière  
-- - Site Web
-- - Illustration
-- - Modélisation 3D
-- - Animation
-- - Tableau
-- - Montage Vidéo
--
-- Toutes les icônes utilisées sont des icônes Lucide valides:
-- Sparkles, BookOpen, Image, Images, Layout, LayoutGrid,
-- ShoppingCart, PenTool, Brush, Box, Boxes, Play, Film,
-- Frame, Smartphone, Video, Youtube, Grid3x3, etc.
-- =====================================================
