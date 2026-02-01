-- ============================================
-- RUSTIKOP - SEED DATA
-- Données initiales pour produits et projets
-- ============================================
-- 
-- SCHÉMA VÉRIFIÉ:
-- 
-- portfolio_products:
--   name, price, promo_price, image, category, tags (text[]), is_featured,
--   alert_message, options (jsonb), description, stock, is_digital,
--   gallery (jsonb), is_visible
--
-- portfolio_projects:
--   title, category, image, content, blocks (jsonb), is_featured,
--   description, client, date_completed, duration, technologies (jsonb),
--   is_visible, external_link, github_link, thumbnail, gallery (jsonb),
--   testimonial, testimonial_author, order_position
--
-- ============================================

-- ============================================
-- SERVICES & PRODUITS DIGITAUX
-- ============================================

-- Supprimer les anciens produits
DELETE FROM portfolio_products;

INSERT INTO portfolio_products (
    name, price, promo_price, category, description, image, tags, 
    is_featured, is_visible, stock, options, gallery, is_digital, alert_message
) VALUES

-- ============================================
-- CATÉGORIE: CRÉATION DE SITES WEB
-- ============================================
(
    'Site Web One Page',
    149.99,
    99.99,
    'Sites Web',
    'Un site web élégant sur une seule page pour présenter votre activité. Parfait pour artisans, thérapeutes ou indépendants qui débutent. Formulaire de contact inclus.',
    'lucide:Globe',
    ARRAY['site','web','one-page','landing','débutant','simple'],
    true,
    true,
    999,
    '[
        {"id": "sections", "name": "Sections", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "3-4 sections", "price": 0},
            {"label": "5-6 sections", "price": 30},
            {"label": "7+ sections", "price": 60}
        ]},
        {"id": "features", "name": "Ajouter", "type": "select", "multiSelect": true, "required": false, "values": [
            {"label": "Galerie photos", "price": 20},
            {"label": "Carte Google Maps", "price": 10},
            {"label": "Lien réservation (Calendly)", "price": 15},
            {"label": "Bouton WhatsApp", "price": 5}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    '🎉 -50€ cette semaine !'
),

(
    'Site Vitrine 5 Pages',
    249.99,
    199.99,
    'Sites Web',
    'Site professionnel multi-pages pour présenter votre entreprise : Accueil, À propos, Services, Galerie et Contact. Optimisé pour Google.',
    'lucide:Layout',
    ARRAY['site','vitrine','professionnel','entreprise','pme'],
    true,
    true,
    999,
    '[
        {"id": "pages", "name": "Pages supplémentaires", "type": "select", "multiSelect": false, "required": false, "values": [
            {"label": "5 pages (inclus)", "price": 0},
            {"label": "+2 pages", "price": 40},
            {"label": "+5 pages", "price": 80}
        ]},
        {"id": "features", "name": "Options", "type": "select", "multiSelect": true, "required": false, "values": [
            {"label": "Blog intégré", "price": 50},
            {"label": "Galerie illimitée", "price": 30},
            {"label": "Formulaire devis", "price": 25},
            {"label": "Pop-up newsletter", "price": 15},
            {"label": "Chat WhatsApp", "price": 10}
        ]},
        {"id": "seo", "name": "Référencement", "type": "select", "multiSelect": false, "required": false, "values": [
            {"label": "SEO basique (inclus)", "price": 0},
            {"label": "SEO optimisé", "price": 50},
            {"label": "SEO + Google Business", "price": 80}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    NULL
),

(
    'Mini Boutique en Ligne',
    299.99,
    249.99,
    'Sites Web',
    'Boutique en ligne simple pour vendre vos produits. Jusqu''à 20 produits, paiement sécurisé par carte et gestion facile depuis votre téléphone.',
    'lucide:ShoppingBag',
    ARRAY['boutique','ecommerce','vente','produits','shopify'],
    true,
    true,
    999,
    '[
        {"id": "products", "name": "Produits", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "Jusqu''à 10 produits", "price": 0},
            {"label": "Jusqu''à 25 produits", "price": 50},
            {"label": "Jusqu''à 50 produits", "price": 100},
            {"label": "Illimité", "price": 150}
        ]},
        {"id": "features", "name": "Options", "type": "select", "multiSelect": true, "required": false, "values": [
            {"label": "Codes promo", "price": 20},
            {"label": "Avis clients", "price": 25},
            {"label": "Variations produits", "price": 30},
            {"label": "Livraison automatisée", "price": 40}
        ]},
        {"id": "training", "name": "Formation", "type": "select", "multiSelect": false, "required": false, "values": [
            {"label": "Tutoriel vidéo", "price": 0},
            {"label": "Appel 30min explication", "price": 25},
            {"label": "Formation complète 1h", "price": 50}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    '🛒 Commencez à vendre en ligne !'
),

(
    'Refonte Site Existant',
    179.99,
    NULL,
    'Sites Web',
    'Votre site est vieux ou moche ? Je le modernise avec un design actuel, responsive et rapide. Gardez votre contenu, changez l''apparence !',
    'lucide:RefreshCw',
    ARRAY['refonte','redesign','modernisation','site','existant'],
    false,
    true,
    999,
    '[
        {"id": "size", "name": "Taille du site", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "1-3 pages", "price": 0},
            {"label": "4-7 pages", "price": 60},
            {"label": "8-15 pages", "price": 120},
            {"label": "Plus de 15 pages", "price": 200}
        ]},
        {"id": "includes", "name": "Inclus", "type": "select", "multiSelect": true, "required": false, "values": [
            {"label": "Migration contenu", "price": 0},
            {"label": "Nouvelles photos", "price": 30},
            {"label": "Réécriture textes", "price": 50},
            {"label": "Optimisation vitesse", "price": 40}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    NULL
),

-- ============================================
-- CATÉGORIE: RÉSEAUX SOCIAUX
-- ============================================
(
    'Pack Démarrage Instagram',
    49.99,
    39.99,
    'Réseaux Sociaux',
    'Tout pour bien démarrer sur Instagram : bio optimisée, 9 premiers posts + stories à la une. Idéal si vous ne savez pas par où commencer.',
    'lucide:Instagram',
    ARRAY['instagram','démarrage','posts','bio','débutant'],
    true,
    true,
    999,
    '[
        {"id": "content", "name": "Contenu", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "9 posts + 5 stories", "price": 0},
            {"label": "15 posts + 10 stories", "price": 25},
            {"label": "30 posts + 20 stories", "price": 50}
        ]},
        {"id": "extras", "name": "Bonus", "type": "select", "multiSelect": true, "required": false, "values": [
            {"label": "Bio + présentation", "price": 0},
            {"label": "Calendrier éditorial", "price": 15},
            {"label": "Hashtags recherchés", "price": 10},
            {"label": "Covers stories à la une", "price": 15}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    '📱 Lancez-vous sur Insta !'
),

(
    'Gestion Réseaux Sociaux (1 mois)',
    129.99,
    99.99,
    'Réseaux Sociaux',
    'Je gère vos réseaux pendant 1 mois : création de posts, stories, réponse aux commentaires. Vous n''avez rien à faire !',
    'lucide:Users',
    ARRAY['gestion','community','manager','social','media','mensuel'],
    true,
    true,
    999,
    '[
        {"id": "platforms", "name": "Réseaux", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "1 réseau", "price": 0},
            {"label": "2 réseaux", "price": 50},
            {"label": "3 réseaux", "price": 90}
        ]},
        {"id": "frequency", "name": "Fréquence", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "3 posts/semaine", "price": 0},
            {"label": "5 posts/semaine", "price": 40},
            {"label": "1 post/jour", "price": 80}
        ]},
        {"id": "extras", "name": "Options", "type": "select", "multiSelect": true, "required": false, "values": [
            {"label": "Stories quotidiennes", "price": 30},
            {"label": "Réponse commentaires", "price": 25},
            {"label": "Rapport mensuel", "price": 15}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    NULL
),

(
    'Création de Visuels (Pack 10)',
    39.99,
    29.99,
    'Réseaux Sociaux',
    '10 visuels professionnels pour vos réseaux. Posts carrés, stories ou bannières. Design cohérent avec votre image de marque.',
    'lucide:Image',
    ARRAY['visuels','posts','design','canva','graphisme'],
    false,
    true,
    999,
    '[
        {"id": "type", "name": "Type", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "Posts Instagram/Facebook", "price": 0},
            {"label": "Stories", "price": 0},
            {"label": "LinkedIn", "price": 0},
            {"label": "Mix (vous choisissez)", "price": 5}
        ]},
        {"id": "quantity", "name": "Quantité", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "10 visuels", "price": 0},
            {"label": "20 visuels", "price": 25},
            {"label": "30 visuels", "price": 45}
        ]},
        {"id": "extras", "name": "Extras", "type": "select", "multiSelect": true, "required": false, "values": [
            {"label": "Fichiers sources Canva", "price": 10},
            {"label": "Animation simple", "price": 20},
            {"label": "Déclinaison 2 formats", "price": 15}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    NULL
),

(
    'Rédaction Légendes + Hashtags',
    24.99,
    19.99,
    'Réseaux Sociaux',
    'Pas d''inspiration pour vos textes ? Je rédige 15 légendes engageantes + hashtags optimisés pour votre secteur.',
    'lucide:PenLine',
    ARRAY['légendes','captions','hashtags','rédaction','instagram'],
    false,
    true,
    999,
    '[
        {"id": "quantity", "name": "Quantité", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "15 légendes", "price": 0},
            {"label": "30 légendes", "price": 20},
            {"label": "50 légendes", "price": 35}
        ]},
        {"id": "style", "name": "Ton", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "Professionnel", "price": 0},
            {"label": "Décontracté/Fun", "price": 0},
            {"label": "Inspirant/Motivant", "price": 0},
            {"label": "Éducatif", "price": 0}
        ]},
        {"id": "extras", "name": "Extras", "type": "select", "multiSelect": true, "required": false, "values": [
            {"label": "Call-to-action inclus", "price": 0},
            {"label": "Emojis pertinents", "price": 0},
            {"label": "Traduction anglais", "price": 15}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    NULL
),

-- ============================================
-- CATÉGORIE: LOGO & IDENTITÉ
-- ============================================
(
    'Logo Simple & Efficace',
    49.99,
    39.99,
    'Logo & Design',
    'Un logo professionnel pour votre activité. 3 propositions, 2 révisions et fichiers HD. Parfait pour démarrer sans se ruiner.',
    'lucide:Hexagon',
    ARRAY['logo','design','marque','identité','startup'],
    true,
    true,
    999,
    '[
        {"id": "proposals", "name": "Propositions", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "3 propositions", "price": 0},
            {"label": "5 propositions", "price": 15},
            {"label": "8 propositions", "price": 30}
        ]},
        {"id": "revisions", "name": "Révisions", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "2 révisions", "price": 0},
            {"label": "5 révisions", "price": 10},
            {"label": "Illimitées", "price": 25}
        ]},
        {"id": "files", "name": "Fichiers", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "PNG + JPG", "price": 0},
            {"label": "+ Version transparente", "price": 5},
            {"label": "+ Fichier vectoriel (SVG)", "price": 15}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    NULL
),

(
    'Pack Identité Débutant',
    89.99,
    69.99,
    'Logo & Design',
    'Tout ce qu''il faut pour démarrer : logo + carte de visite + bannière réseaux sociaux. Un look pro à petit prix.',
    'lucide:Package',
    ARRAY['identité','pack','logo','carte','visite','bannière'],
    true,
    true,
    999,
    '[
        {"id": "logo", "name": "Logo", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "3 propositions", "price": 0},
            {"label": "5 propositions", "price": 15}
        ]},
        {"id": "extras", "name": "Ajouter", "type": "select", "multiSelect": true, "required": false, "values": [
            {"label": "Signature email", "price": 10},
            {"label": "Papier en-tête", "price": 15},
            {"label": "Tampon/Cachet", "price": 10},
            {"label": "Favicon site web", "price": 5}
        ]},
        {"id": "print", "name": "Impression cartes", "type": "select", "multiSelect": false, "required": false, "values": [
            {"label": "Fichier seul", "price": 0},
            {"label": "+ 100 cartes imprimées", "price": 25},
            {"label": "+ 250 cartes imprimées", "price": 40}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    '⭐ Notre best-seller !'
),

(
    'Carte de Visite Design',
    19.99,
    14.99,
    'Logo & Design',
    'Design professionnel recto-verso pour votre carte de visite. Fichier prêt à imprimer chez l''imprimeur de votre choix.',
    'lucide:CreditCard',
    ARRAY['carte','visite','business','card','print'],
    false,
    true,
    999,
    '[
        {"id": "style", "name": "Style", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "Minimaliste", "price": 0},
            {"label": "Classique élégant", "price": 0},
            {"label": "Moderne coloré", "price": 0},
            {"label": "Sur-mesure", "price": 10}
        ]},
        {"id": "revisions", "name": "Révisions", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "2 révisions", "price": 0},
            {"label": "5 révisions", "price": 8}
        ]},
        {"id": "print", "name": "Impression", "type": "select", "multiSelect": false, "required": false, "values": [
            {"label": "Fichier seul", "price": 0},
            {"label": "+ 100 cartes", "price": 20},
            {"label": "+ 250 cartes", "price": 35},
            {"label": "+ 500 cartes", "price": 55}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    NULL
),

(
    'Flyer / Affiche Promotionnel',
    29.99,
    NULL,
    'Logo & Design',
    'Flyer ou affiche accrocheur pour promouvoir un événement, une offre spéciale ou votre activité. Format A5, A4 ou A3.',
    'lucide:FileImage',
    ARRAY['flyer','affiche','promo','événement','print'],
    false,
    true,
    999,
    '[
        {"id": "format", "name": "Format", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "A5 (flyer)", "price": 0},
            {"label": "A4", "price": 5},
            {"label": "A3 (affiche)", "price": 15}
        ]},
        {"id": "sides", "name": "Faces", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "Recto seul", "price": 0},
            {"label": "Recto-verso", "price": 15}
        ]},
        {"id": "print", "name": "Impression", "type": "select", "multiSelect": false, "required": false, "values": [
            {"label": "Fichier seul", "price": 0},
            {"label": "+ 50 exemplaires", "price": 20},
            {"label": "+ 100 exemplaires", "price": 35},
            {"label": "+ 250 exemplaires", "price": 60}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    NULL
),

-- ============================================
-- CATÉGORIE: RÉDACTION & CONTENU
-- ============================================
(
    'Textes pour Site Web',
    59.99,
    49.99,
    'Rédaction',
    'Rédaction professionnelle de tous les textes de votre site. Accrocheur, clair et optimisé pour Google. Jusqu''à 5 pages.',
    'lucide:FileText',
    ARRAY['rédaction','textes','site','web','copywriting','seo'],
    true,
    true,
    999,
    '[
        {"id": "pages", "name": "Nombre de pages", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "1-3 pages", "price": 0},
            {"label": "4-5 pages", "price": 25},
            {"label": "6-8 pages", "price": 50},
            {"label": "9+ pages", "price": 80}
        ]},
        {"id": "style", "name": "Ton", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "Professionnel", "price": 0},
            {"label": "Chaleureux/Humain", "price": 0},
            {"label": "Dynamique/Jeune", "price": 0},
            {"label": "Luxe/Premium", "price": 10}
        ]},
        {"id": "extras", "name": "Extras", "type": "select", "multiSelect": true, "required": false, "values": [
            {"label": "Méta-descriptions SEO", "price": 15},
            {"label": "Traduction anglais", "price": 40},
            {"label": "Relecture express", "price": 10}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    NULL
),

(
    'Article de Blog SEO',
    29.99,
    24.99,
    'Rédaction',
    'Article optimisé pour Google qui attire des visiteurs sur votre site. Sujet de votre choix, 800-1200 mots.',
    'lucide:Newspaper',
    ARRAY['article','blog','seo','contenu','référencement'],
    false,
    true,
    999,
    '[
        {"id": "length", "name": "Longueur", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "800-1000 mots", "price": 0},
            {"label": "1000-1500 mots", "price": 15},
            {"label": "1500-2000 mots", "price": 30},
            {"label": "2000+ mots", "price": 50}
        ]},
        {"id": "research", "name": "Recherche", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "Sujet fourni", "price": 0},
            {"label": "Recherche de sujet", "price": 10},
            {"label": "Recherche approfondie", "price": 25}
        ]},
        {"id": "extras", "name": "Extras", "type": "select", "multiSelect": true, "required": false, "values": [
            {"label": "Image illustrative", "price": 5},
            {"label": "Publication WordPress", "price": 10},
            {"label": "Partage réseaux sociaux", "price": 8}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    NULL
),

(
    'Fiche Produit E-commerce',
    9.99,
    7.99,
    'Rédaction',
    'Description de produit qui vend ! Titre accrocheur, description détaillée et bullet points. Parfait pour Amazon, Etsy ou votre boutique.',
    'lucide:Tag',
    ARRAY['fiche','produit','description','ecommerce','vente'],
    false,
    true,
    999,
    '[
        {"id": "quantity", "name": "Quantité", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "1 fiche", "price": 0},
            {"label": "5 fiches", "price": 35},
            {"label": "10 fiches", "price": 60},
            {"label": "20 fiches", "price": 100}
        ]},
        {"id": "platform", "name": "Plateforme", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "Site personnel", "price": 0},
            {"label": "Amazon", "price": 5},
            {"label": "Etsy", "price": 5},
            {"label": "Autre marketplace", "price": 5}
        ]},
        {"id": "extras", "name": "Extras", "type": "select", "multiSelect": true, "required": false, "values": [
            {"label": "Mots-clés recherchés", "price": 5},
            {"label": "Titre optimisé SEO", "price": 3}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    '📝 À partir de 7,99€ !'
),

(
    'Bio & Présentation Pro',
    19.99,
    NULL,
    'Rédaction',
    'Texte de présentation professionnel pour votre profil LinkedIn, Instagram, site web ou CV. Mettez-vous en valeur !',
    'lucide:User',
    ARRAY['bio','présentation','profil','linkedin','about'],
    false,
    true,
    999,
    '[
        {"id": "type", "name": "Pour", "type": "select", "multiSelect": true, "required": true, "values": [
            {"label": "LinkedIn", "price": 0},
            {"label": "Instagram", "price": 0},
            {"label": "Site web (page À propos)", "price": 10},
            {"label": "CV/Portfolio", "price": 5}
        ]},
        {"id": "length", "name": "Version", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "Courte (150 mots)", "price": 0},
            {"label": "Moyenne (300 mots)", "price": 10},
            {"label": "Longue (500+ mots)", "price": 20}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    NULL
),

-- ============================================
-- CATÉGORIE: VIDÉO & MONTAGE
-- ============================================
(
    'Montage Vidéo Simple',
    39.99,
    29.99,
    'Vidéo',
    'Montage propre de vos vidéos : assemblage, coupes, musique et textes. Parfait pour YouTube, TikTok ou souvenirs personnels.',
    'lucide:Film',
    ARRAY['montage','vidéo','youtube','tiktok','editing'],
    true,
    true,
    999,
    '[
        {"id": "duration", "name": "Durée finale", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "Jusqu''à 2 min", "price": 0},
            {"label": "2-5 min", "price": 20},
            {"label": "5-10 min", "price": 40},
            {"label": "10-20 min", "price": 70}
        ]},
        {"id": "style", "name": "Style", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "Simple et propre", "price": 0},
            {"label": "Dynamique (transitions)", "price": 15},
            {"label": "TikTok/Reels", "price": 10},
            {"label": "Cinématique", "price": 30}
        ]},
        {"id": "extras", "name": "Extras", "type": "select", "multiSelect": true, "required": false, "values": [
            {"label": "Musique libre de droits", "price": 0},
            {"label": "Sous-titres", "price": 15},
            {"label": "Logo/Watermark", "price": 5},
            {"label": "Miniature YouTube", "price": 10}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    NULL
),

(
    'Vidéo Promo 30 secondes',
    59.99,
    49.99,
    'Vidéo',
    'Vidéo courte et percutante pour promouvoir votre business sur les réseaux. Montage pro, textes animés et musique.',
    'lucide:Play',
    ARRAY['promo','pub','vidéo','réseaux','publicité'],
    true,
    true,
    999,
    '[
        {"id": "duration", "name": "Durée", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "15-30 secondes", "price": 0},
            {"label": "30-60 secondes", "price": 30},
            {"label": "60-90 secondes", "price": 50}
        ]},
        {"id": "format", "name": "Format", "type": "select", "multiSelect": true, "required": true, "values": [
            {"label": "Instagram/TikTok (9:16)", "price": 0},
            {"label": "Facebook/YouTube (16:9)", "price": 0},
            {"label": "Carré (1:1)", "price": 0},
            {"label": "Tous les formats", "price": 15}
        ]},
        {"id": "assets", "name": "Contenu", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "Vous fournissez les vidéos", "price": 0},
            {"label": "Stock vidéos incluses", "price": 20},
            {"label": "Animation 100% créée", "price": 40}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    NULL
),

(
    'Sous-titrage Vidéo',
    14.99,
    NULL,
    'Vidéo',
    'Sous-titres professionnels pour vos vidéos YouTube, TikTok ou formations. Améliore l''accessibilité et l''engagement.',
    'lucide:Subtitles',
    ARRAY['sous-titres','vidéo','accessibilité','youtube','caption'],
    false,
    true,
    999,
    '[
        {"id": "duration", "name": "Durée vidéo", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "Jusqu''à 5 min", "price": 0},
            {"label": "5-15 min", "price": 15},
            {"label": "15-30 min", "price": 30},
            {"label": "30-60 min", "price": 50}
        ]},
        {"id": "style", "name": "Style", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "Classique (blanc)", "price": 0},
            {"label": "Animés (TikTok style)", "price": 10},
            {"label": "Branded (vos couleurs)", "price": 15}
        ]},
        {"id": "language", "name": "Langue", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "Français", "price": 0},
            {"label": "Anglais", "price": 0},
            {"label": "FR + EN", "price": 20}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    NULL
),

(
    'Miniatures YouTube (Pack 5)',
    24.99,
    19.99,
    'Vidéo',
    'Miniatures accrocheuses qui donnent envie de cliquer ! Pack de 5 miniatures dans votre style, prêtes à l''emploi.',
    'lucide:ImagePlus',
    ARRAY['miniature','thumbnail','youtube','ctr','design'],
    false,
    true,
    999,
    '[
        {"id": "quantity", "name": "Quantité", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "5 miniatures", "price": 0},
            {"label": "10 miniatures", "price": 20},
            {"label": "20 miniatures", "price": 35}
        ]},
        {"id": "style", "name": "Style", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "Cohérent (même style)", "price": 0},
            {"label": "Varié (adapté au contenu)", "price": 5},
            {"label": "Sur-mesure personnalisé", "price": 15}
        ]},
        {"id": "extras", "name": "Extras", "type": "select", "multiSelect": true, "required": false, "values": [
            {"label": "Template Photoshop", "price": 15},
            {"label": "A/B testing (2 versions)", "price": 10}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    NULL
),

-- ============================================
-- CATÉGORIE: AIDE & CONSEIL
-- ============================================
(
    'Appel Conseil 30 min',
    29.99,
    24.99,
    'Conseil',
    'Besoin d''aide pour votre projet digital ? 30 min en visio pour répondre à toutes vos questions : site, réseaux, stratégie...',
    'lucide:Phone',
    ARRAY['conseil','appel','visio','aide','stratégie'],
    true,
    true,
    999,
    '[
        {"id": "duration", "name": "Durée", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "30 minutes", "price": 0},
            {"label": "1 heure", "price": 30},
            {"label": "Pack 3x30 min", "price": 50}
        ]},
        {"id": "topic", "name": "Sujet", "type": "select", "multiSelect": true, "required": true, "values": [
            {"label": "Site web", "price": 0},
            {"label": "Réseaux sociaux", "price": 0},
            {"label": "Marketing/Stratégie", "price": 0},
            {"label": "Technique/Outils", "price": 0},
            {"label": "Autre (précisez)", "price": 0}
        ]},
        {"id": "followup", "name": "Suivi", "type": "select", "multiSelect": false, "required": false, "values": [
            {"label": "Appel seul", "price": 0},
            {"label": "+ Récap écrit", "price": 10},
            {"label": "+ Plan d''action", "price": 20}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    '💬 On en parle ensemble !'
),

(
    'Audit Site Web Express',
    49.99,
    39.99,
    'Conseil',
    'Analyse complète de votre site en 24h : design, contenu, SEO, vitesse. Rapport clair avec recommandations prioritaires.',
    'lucide:Search',
    ARRAY['audit','site','seo','analyse','amélioration'],
    false,
    true,
    999,
    '[
        {"id": "depth", "name": "Profondeur", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "Audit rapide (5 points clés)", "price": 0},
            {"label": "Audit complet (15+ critères)", "price": 30},
            {"label": "Audit + benchmark concurrence", "price": 50}
        ]},
        {"id": "format", "name": "Format rapport", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "Rapport PDF", "price": 0},
            {"label": "Rapport + vidéo explicative", "price": 20},
            {"label": "Rapport + appel présentation", "price": 30}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    NULL
),

(
    'Configuration Google Business',
    34.99,
    NULL,
    'Conseil',
    'Je crée et optimise votre fiche Google Business pour apparaître dans les recherches locales. Photos, horaires, services : tout est prêt !',
    'lucide:MapPin',
    ARRAY['google','business','local','seo','fiche'],
    false,
    true,
    999,
    '[
        {"id": "service", "name": "Service", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "Création fiche", "price": 0},
            {"label": "Optimisation existante", "price": -10},
            {"label": "Création + photos pro", "price": 30}
        ]},
        {"id": "extras", "name": "Extras", "type": "select", "multiSelect": true, "required": false, "values": [
            {"label": "Posts Google (x4)", "price": 15},
            {"label": "Réponses aux avis", "price": 20},
            {"label": "Formation gestion", "price": 25}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    NULL
),

-- ============================================
-- CATÉGORIE: TEMPLATES & OUTILS
-- ============================================
(
    'Templates Canva Réseaux',
    19.99,
    14.99,
    'Templates',
    '30 templates Canva modifiables pour vos posts Instagram, Facebook et LinkedIn. Changez les couleurs et textes en 2 clics !',
    'lucide:LayoutTemplate',
    ARRAY['templates','canva','instagram','posts','design'],
    true,
    true,
    999,
    '[
        {"id": "style", "name": "Style", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "Minimaliste épuré", "price": 0},
            {"label": "Coloré et fun", "price": 0},
            {"label": "Élégant luxe", "price": 5},
            {"label": "Corporate pro", "price": 5}
        ]},
        {"id": "quantity", "name": "Quantité", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "30 templates", "price": 0},
            {"label": "50 templates", "price": 15},
            {"label": "100 templates", "price": 30}
        ]},
        {"id": "extras", "name": "Bonus", "type": "select", "multiSelect": true, "required": false, "values": [
            {"label": "Stories (15)", "price": 10},
            {"label": "Covers stories à la une", "price": 8},
            {"label": "Bannière profil", "price": 5}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    NULL
),

(
    'Template Notion Freelance',
    14.99,
    9.99,
    'Templates',
    'Organisez votre activité de freelance avec ce template Notion : clients, projets, factures, to-do. Tout au même endroit !',
    'lucide:Table',
    ARRAY['notion','template','freelance','organisation','productivité'],
    false,
    true,
    999,
    '[
        {"id": "version", "name": "Version", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "Essentiel", "price": 0},
            {"label": "Pro (+ finances)", "price": 10},
            {"label": "Complet (tout inclus)", "price": 20}
        ]},
        {"id": "setup", "name": "Installation", "type": "select", "multiSelect": false, "required": false, "values": [
            {"label": "Je me débrouille", "price": 0},
            {"label": "Tutoriel vidéo", "price": 5},
            {"label": "Installation guidée", "price": 20}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    '🔥 Promo -5€ !'
),

(
    'Checklist Lancement Site',
    4.99,
    NULL,
    'Templates',
    'Ne rien oublier avant de lancer votre site ! 50+ points à vérifier : SEO, sécurité, mentions légales, analytics...',
    'lucide:CheckSquare',
    ARRAY['checklist','site','lancement','vérification','seo'],
    false,
    true,
    999,
    '[
        {"id": "format", "name": "Format", "type": "select", "multiSelect": true, "required": true, "values": [
            {"label": "PDF imprimable", "price": 0},
            {"label": "Notion", "price": 3},
            {"label": "Google Sheets", "price": 3}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    NULL
),

(
    'Pack Contrats Freelance',
    24.99,
    19.99,
    'Templates',
    '5 modèles de contrats essentiels pour freelance : devis, facture, contrat de prestation, CGV et NDA. Modifiables à volonté.',
    'lucide:FileSignature',
    ARRAY['contrats','freelance','devis','facture','juridique'],
    false,
    true,
    999,
    '[
        {"id": "format", "name": "Format", "type": "select", "multiSelect": true, "required": true, "values": [
            {"label": "Word (.docx)", "price": 0},
            {"label": "Google Docs", "price": 0},
            {"label": "PDF éditable", "price": 5}
        ]},
        {"id": "extras", "name": "Extras", "type": "select", "multiSelect": true, "required": false, "values": [
            {"label": "Guide utilisation", "price": 5},
            {"label": "Modèle relance impayé", "price": 5},
            {"label": "Email type devis", "price": 3}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    NULL
),

-- ============================================
-- CATÉGORIE: FORMATIONS SIMPLES
-- ============================================
(
    'Mini Formation Instagram',
    29.99,
    19.99,
    'Formations',
    'Apprenez à gérer Instagram comme un pro en 2h de vidéo. Algorithme, hashtags, stories, reels : tout est expliqué simplement.',
    'lucide:GraduationCap',
    ARRAY['formation','instagram','apprendre','réseaux','débutant'],
    true,
    true,
    999,
    '[
        {"id": "bonus", "name": "Bonus", "type": "select", "multiSelect": true, "required": false, "values": [
            {"label": "Accès à vie", "price": 0},
            {"label": "Mises à jour gratuites", "price": 0},
            {"label": "Templates Canva (20)", "price": 10},
            {"label": "Calendrier éditorial", "price": 5},
            {"label": "Groupe privé", "price": 8}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    '📚 2h de vidéo + bonus !'
),

(
    'Tuto WordPress Débutant',
    39.99,
    29.99,
    'Formations',
    'Créez votre site WordPress vous-même ! 4h de vidéo pas à pas, de l''installation à la mise en ligne. Aucune connaissance requise.',
    'lucide:BookOpen',
    ARRAY['wordpress','tuto','formation','site','débutant'],
    true,
    true,
    999,
    '[
        {"id": "level", "name": "Niveau", "type": "select", "multiSelect": false, "required": true, "values": [
            {"label": "Débutant (création)", "price": 0},
            {"label": "+ Blog avancé", "price": 15},
            {"label": "+ WooCommerce (boutique)", "price": 25}
        ]},
        {"id": "support", "name": "Support", "type": "select", "multiSelect": false, "required": false, "values": [
            {"label": "Vidéos seules", "price": 0},
            {"label": "+ Support email 30j", "price": 20},
            {"label": "+ Appel si bloqué", "price": 30}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    NULL
),

(
    'E-book Réussir en Freelance',
    12.99,
    9.99,
    'Formations',
    'Guide pratique de 80 pages pour lancer et développer votre activité freelance. Trouver des clients, fixer ses prix, gérer son temps.',
    'lucide:FileText',
    ARRAY['ebook','freelance','guide','entrepreneur','business'],
    false,
    true,
    999,
    '[
        {"id": "format", "name": "Format", "type": "select", "multiSelect": true, "required": true, "values": [
            {"label": "PDF", "price": 0},
            {"label": "ePub (liseuse)", "price": 0}
        ]},
        {"id": "bonus", "name": "Bonus", "type": "select", "multiSelect": true, "required": false, "values": [
            {"label": "Checklist démarrage", "price": 3},
            {"label": "Calculateur tarifs", "price": 5},
            {"label": "Templates emails", "price": 5}
        ]}
    ]'::jsonb,
    '[]'::jsonb,
    true,
    NULL
);

-- ============================================
-- PROJETS PORTFOLIO
-- ============================================

-- Nettoyer les projets existants (optionnel)
-- DELETE FROM portfolio_projects;

INSERT INTO portfolio_projects (
    title, category, image, content, blocks,
    description, client, date_completed, duration, technologies,
    is_visible, external_link, github_link, thumbnail, gallery,
    testimonial, testimonial_author, order_position
) VALUES

-- ============================================
-- CATÉGORIE: BRANDING & IDENTITÉ
-- ============================================
(
    'Nova Coffee - Identité de Marque',
    'Branding',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200',
    'Création complète de l''identité visuelle pour une nouvelle chaîne de cafés premium.',
    '[
        {"id": 1, "type": "statement", "content": "Transformer l''expérience café en moment d''exception."},
        {"id": 2, "type": "text", "content": "Nova Coffee souhaitait se démarquer dans un marché saturé avec une identité moderne, chaleureuse et premium. Le défi était de créer une marque mémorable qui évoque à la fois la qualité artisanale et l''expérience contemporaine."},
        {"id": 3, "type": "title", "content": "Le Challenge"},
        {"id": 4, "type": "text", "content": "Le client avait besoin d''une identité complète : logo, palette, typographies, packaging et signalétique pour 15 boutiques prévues sur 2 ans."},
        {"id": 5, "type": "gallery", "content": {"images": ["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800", "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800", "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800"]}},
        {"id": 6, "type": "stats", "content": {"stats": [{"value": "15", "label": "Boutiques", "suffix": "+"}, {"value": "98", "label": "Satisfaction client", "suffix": "%"}, {"value": "3", "label": "Mois de travail", "suffix": ""}]}},
        {"id": 7, "type": "title", "content": "La Solution"},
        {"id": 8, "type": "features", "content": {"features": [{"icon": "🎨", "title": "Logo modulaire", "description": "Un logo qui s''adapte à tous les supports, du gobelet à l''enseigne."}, {"icon": "📦", "title": "Packaging premium", "description": "Emballages éco-responsables avec finitions dorées."}, {"icon": "🏪", "title": "Signalétique complète", "description": "Système de navigation et affichage cohérent."}]}},
        {"id": 9, "type": "testimonial", "content": {"text": "L''équipe a parfaitement capturé l''essence de notre vision. Notre marque est maintenant immédiatement reconnaissable.", "author": "Marie Dupont", "company": "CEO Nova Coffee"}}
    ]'::jsonb,
    'Création d''une identité de marque complète pour une chaîne de cafés premium, incluant logo, packaging et guidelines.',
    'Nova Coffee',
    '2025-08-15',
    '3 mois',
    '["Illustrator", "Photoshop", "InDesign", "Figma"]'::jsonb,
    true,
    'https://novacoffee.example.com',
    NULL,
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    '["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800", "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800"]'::jsonb,
    'L''équipe a parfaitement capturé l''essence de notre vision. Notre marque est maintenant immédiatement reconnaissable.',
    'Marie Dupont, CEO Nova Coffee',
    1
),

(
    'TechFlow - Rebranding Startup',
    'Branding',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200',
    'Rebranding complet d''une startup SaaS en pleine croissance.',
    '[
        {"id": 1, "type": "statement", "content": "Quand la technologie rencontre le design."},
        {"id": 2, "type": "text", "content": "TechFlow avait besoin d''évoluer de son image de startup vers celle d''un acteur établi du marché SaaS B2B. Un rebranding stratégique pour accompagner leur levée de fonds Série B."},
        {"id": 3, "type": "before-after", "content": {"before": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600", "after": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600"}},
        {"id": 4, "type": "callout", "content": {"title": "Objectif principal", "text": "Positionner TechFlow comme leader de son segment avant la levée de fonds.", "color": "blue"}},
        {"id": 5, "type": "stats", "content": {"stats": [{"value": "2.5", "label": "Millions levés", "suffix": "M€"}, {"value": "340", "label": "Leads générés", "suffix": "%"}, {"value": "12", "label": "Semaines", "suffix": ""}]}}
    ]'::jsonb,
    'Rebranding stratégique d''une startup SaaS pour accompagner leur croissance et levée de fonds Série B.',
    'TechFlow SAS',
    '2025-06-20',
    '2.5 mois',
    '["Figma", "After Effects", "Webflow"]'::jsonb,
    true,
    NULL,
    NULL,
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
    '["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"]'::jsonb,
    'Le rebranding a dépassé toutes nos attentes. L''impact sur notre image a été immédiat.',
    'Thomas Martin, CTO TechFlow',
    2
),

-- ============================================
-- CATÉGORIE: ILLUSTRATION
-- ============================================
(
    'Contes du Monde - Livre Illustré',
    'Illustration',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200',
    'Illustrations pour un livre jeunesse regroupant des contes traditionnels du monde entier.',
    '[
        {"id": 1, "type": "statement", "content": "24 illustrations pour faire voyager les enfants."},
        {"id": 2, "type": "text", "content": "Ce projet d''illustration pour les éditions Lumière consistait à créer 24 illustrations pleine page pour un recueil de contes traditionnels destiné aux 6-10 ans."},
        {"id": 3, "type": "gallery", "content": {"images": ["https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600", "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600", "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600", "https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=600"]}},
        {"id": 4, "type": "timeline", "content": {"events": [{"date": "Janvier", "title": "Recherches & Style", "description": "Définition du style graphique et études de personnages."}, {"date": "Février-Mars", "title": "Création", "description": "Production des 24 illustrations principales."}, {"date": "Avril", "title": "Finalisation", "description": "Ajustements et livraison des fichiers print."}]}},
        {"id": 5, "type": "award", "content": {"title": "Prix du Livre Jeunesse", "description": "Catégorie Illustration - Salon du Livre 2025", "year": "2025"}}
    ]'::jsonb,
    '24 illustrations originales pour un livre jeunesse édité chez Lumière Éditions, mêlant techniques traditionnelles et digitales.',
    'Lumière Éditions',
    '2025-04-10',
    '4 mois',
    '["Procreate", "Photoshop", "Illustration traditionnelle"]'::jsonb,
    true,
    'https://lumiere-editions.example.com/contes',
    NULL,
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    '["https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800", "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800"]'::jsonb,
    'Un travail magnifique qui a donné vie à nos histoires. Les retours des enfants sont extraordinaires.',
    'Sophie Bernard, Directrice éditoriale',
    3
),

(
    'Héros Urbains - Character Design',
    'Illustration',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
    'Création de 8 personnages pour un jeu mobile indépendant.',
    '[
        {"id": 1, "type": "statement", "content": "Des héros du quotidien aux super-pouvoirs urbains."},
        {"id": 2, "type": "text", "content": "Pour le jeu mobile \"Urban Heroes\" développé par le studio indie GameSpark, j''ai conçu 8 personnages jouables uniques, chacun avec son histoire, ses animations et ses variantes de costumes."},
        {"id": 3, "type": "features", "content": {"features": [{"icon": "👤", "title": "8 Personnages", "description": "Designs complets avec fiche personnage"}, {"icon": "🎭", "title": "24 Expressions", "description": "3 expressions par personnage"}, {"icon": "👕", "title": "32 Skins", "description": "4 variantes de costume par héros"}]}},
        {"id": 4, "type": "gallery", "content": {"images": ["https://images.unsplash.com/photo-1636622433525-f82cea2b5ab0?w=600", "https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=600"]}},
        {"id": 5, "type": "stats", "content": {"stats": [{"value": "500K", "label": "Téléchargements", "suffix": "+"}, {"value": "4.7", "label": "Note App Store", "suffix": "★"}, {"value": "8", "label": "Héros créés", "suffix": ""}]}}
    ]'::jsonb,
    'Character design complet pour un jeu mobile : 8 personnages avec expressions, animations et variantes.',
    'GameSpark Studio',
    '2025-09-30',
    '2 mois',
    '["Procreate", "Spine", "After Effects"]'::jsonb,
    true,
    'https://gamespark.example.com/urbanheroes',
    NULL,
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400',
    '[]'::jsonb,
    NULL,
    NULL,
    4
),

-- ============================================
-- CATÉGORIE: UI/UX DESIGN
-- ============================================
(
    'HealthMate - App Santé',
    'UI/UX Design',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200',
    'Design UI/UX complet d''une application de suivi santé et bien-être.',
    '[
        {"id": 1, "type": "statement", "content": "Rendre le suivi santé accessible et agréable."},
        {"id": 2, "type": "text", "content": "HealthMate est une application mobile de suivi santé complète. Mon rôle était de concevoir une interface intuitive qui encourage les utilisateurs à maintenir leurs bonnes habitudes."},
        {"id": 3, "type": "steps", "content": {"steps": [{"title": "Recherche UX", "description": "Interviews utilisateurs, benchmark concurrentiel, personas."}, {"title": "Architecture", "description": "User flows, wireframes et prototypes basse fidélité."}, {"title": "UI Design", "description": "Design system complet et maquettes haute fidélité."}, {"title": "Prototypage", "description": "Prototype interactif et tests utilisateurs."}]}},
        {"id": 4, "type": "gallery", "content": {"images": ["https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600", "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=600"]}},
        {"id": 5, "type": "stats", "content": {"stats": [{"value": "85", "label": "Écrans designés", "suffix": ""}, {"value": "94", "label": "Satisfaction UX", "suffix": "%"}, {"value": "200", "label": "Composants UI", "suffix": "+"}]}},
        {"id": 6, "type": "tip", "content": {"title": "Apprentissage clé", "text": "L''accessibilité n''est pas une option. Chaque composant a été testé avec les standards WCAG 2.1."}}
    ]'::jsonb,
    'Application mobile de suivi santé avec dashboard personnalisé, rappels intelligents et intégration wearables.',
    'HealthMate Inc.',
    '2025-11-15',
    '4 mois',
    '["Figma", "Principle", "Maze", "Notion"]'::jsonb,
    true,
    'https://healthmate.app',
    NULL,
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400',
    '["https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800"]'::jsonb,
    'L''application a transformé notre rapport à la santé en équipe. Le design est à la fois beau et fonctionnel.',
    'Dr. Claire Moreau, Directrice Produit',
    5
),

(
    'FinTrack - Dashboard Financier',
    'UI/UX Design',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200',
    'Conception d''un tableau de bord financier pour une fintech B2B.',
    '[
        {"id": 1, "type": "statement", "content": "Simplifier la complexité financière."},
        {"id": 2, "type": "text", "content": "FinTrack avait besoin d''un dashboard capable d''afficher des données financières complexes de manière claire et actionnable pour les directeurs financiers."},
        {"id": 3, "type": "gallery", "content": {"images": ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800", "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800"]}},
        {"id": 4, "type": "code", "content": {"language": "javascript", "code": "// Design tokens utilisés\nconst colors = {\n  success: ''#22c55e'',\n  warning: ''#f59e0b'',\n  danger: ''#ef4444'',\n  neutral: ''#64748b''\n}"}},
        {"id": 5, "type": "stats", "content": {"stats": [{"value": "60", "label": "Réduction temps analyse", "suffix": "%"}, {"value": "45", "label": "Widgets créés", "suffix": ""}, {"value": "12", "label": "Mois de support", "suffix": ""}]}}
    ]'::jsonb,
    'Dashboard analytique B2B permettant de visualiser et analyser les données financières en temps réel.',
    'FinTrack Solutions',
    '2025-07-20',
    '3 mois',
    '["Figma", "D3.js", "Tailwind CSS"]'::jsonb,
    true,
    NULL,
    NULL,
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
    '[]'::jsonb,
    'Le dashboard a révolutionné notre façon de présenter les données à nos clients. Un game-changer.',
    'Antoine Leroy, CEO FinTrack',
    6
),

-- ============================================
-- CATÉGORIE: MOTION & VIDÉO
-- ============================================
(
    'EcoVert - Vidéo Explicative',
    'Motion Design',
    'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=1200',
    'Création d''une vidéo motion design expliquant le service de recyclage innovant.',
    '[
        {"id": 1, "type": "statement", "content": "Expliquer l''écologie en 90 secondes."},
        {"id": 2, "type": "video", "content": {"url": "https://www.youtube.com/embed/dQw4w9WgXcQ"}},
        {"id": 3, "type": "text", "content": "EcoVert propose un service de collecte et recyclage de déchets électroniques pour les entreprises. La vidéo devait expliquer simplement leur processus en 3 étapes."},
        {"id": 4, "type": "timeline", "content": {"events": [{"date": "Semaine 1", "title": "Script & Storyboard", "description": "Rédaction du script et validation du storyboard avec le client."}, {"date": "Semaine 2-3", "title": "Animation", "description": "Création des assets et animation des scènes."}, {"date": "Semaine 4", "title": "Post-prod", "description": "Sound design, voix-off et export final."}]}},
        {"id": 5, "type": "stats", "content": {"stats": [{"value": "2.5M", "label": "Vues LinkedIn", "suffix": ""}, {"value": "90", "label": "Secondes", "suffix": "s"}, {"value": "340", "label": "Leads générés", "suffix": ""}]}}
    ]'::jsonb,
    'Vidéo explicative en motion design 2D pour présenter un service de recyclage B2B de manière engageante.',
    'EcoVert Solutions',
    '2025-05-10',
    '1 mois',
    '["After Effects", "Illustrator", "Premiere Pro"]'::jsonb,
    true,
    'https://vimeo.com/example',
    NULL,
    'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400',
    '[]'::jsonb,
    'La vidéo a généré plus de leads en 1 mois que notre ancienne campagne en 6 mois.',
    'Julie Renard, Marketing Director',
    7
),

-- ============================================
-- CATÉGORIE: DÉVELOPPEMENT WEB
-- ============================================
(
    'ArtGallery - E-commerce d''Art',
    'Développement Web',
    'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1200',
    'Développement d''une plateforme e-commerce pour galerie d''art contemporain.',
    '[
        {"id": 1, "type": "statement", "content": "L''art accessible en un clic."},
        {"id": 2, "type": "text", "content": "ArtGallery est une plateforme e-commerce sur-mesure permettant à une galerie parisienne de vendre des œuvres d''art en ligne tout en préservant l''expérience premium de la galerie physique."},
        {"id": 3, "type": "features", "content": {"features": [{"icon": "🖼️", "title": "Zoom HD", "description": "Visualisation ultra-détaillée des œuvres"}, {"icon": "🏠", "title": "AR Preview", "description": "Prévisualisation de l''œuvre chez soi"}, {"icon": "🔒", "title": "Paiement sécurisé", "description": "Stripe + facilités de paiement"}]}},
        {"id": 4, "type": "code", "content": {"language": "javascript", "code": "// Stack technique\nconst stack = {\n  frontend: ''Next.js 14'',\n  backend: ''Node.js + Supabase'',\n  payment: ''Stripe'',\n  hosting: ''Vercel''\n}"}},
        {"id": 5, "type": "stats", "content": {"stats": [{"value": "150K", "label": "CA généré", "suffix": "€"}, {"value": "2.8", "label": "Temps de chargement", "suffix": "s"}, {"value": "99.9", "label": "Uptime", "suffix": "%"}]}}
    ]'::jsonb,
    'Plateforme e-commerce sur-mesure avec visualisation AR, zoom HD et système de paiement échelonné.',
    'Galerie Artémis',
    '2025-10-01',
    '4 mois',
    '["Next.js", "React", "Supabase", "Stripe", "Three.js"]'::jsonb,
    true,
    'https://galerie-artemis.example.com',
    'https://github.com/example/artgallery',
    'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=400',
    '["https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800"]'::jsonb,
    'Notre chiffre d''affaires en ligne a triplé depuis le lancement. Le site reflète parfaitement l''esprit de notre galerie.',
    'Pierre Dubois, Propriétaire',
    8
),

(
    'Portfolio Personnel V3',
    'Développement Web',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200',
    'Refonte complète de mon portfolio avec animations avancées et CMS custom.',
    '[
        {"id": 1, "type": "statement", "content": "Mon portfolio, ma vitrine."},
        {"id": 2, "type": "text", "content": "La troisième version de mon portfolio personnel, entièrement redesignée et développée avec les dernières technologies. Focus sur les performances, l''accessibilité et les micro-interactions."},
        {"id": 3, "type": "highlight", "content": {"title": "Objectifs", "text": "Score Lighthouse 100/100, animations fluides 60fps, accessibilité WCAG AA, temps de chargement < 1.5s"}},
        {"id": 4, "type": "gallery", "content": {"images": ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600", "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600"]}},
        {"id": 5, "type": "code", "content": {"language": "javascript", "code": "// Features clés\n- Dark mode automatique\n- Animations GSAP\n- Blog intégré (MDX)\n- Dashboard admin custom\n- Analytics self-hosted"}},
        {"id": 6, "type": "stats", "content": {"stats": [{"value": "100", "label": "Lighthouse Score", "suffix": ""}, {"value": "1.2", "label": "LCP", "suffix": "s"}, {"value": "0", "label": "CLS", "suffix": ""}]}}
    ]'::jsonb,
    'Portfolio personnel avec animations avancées, blog intégré, dark mode et performances optimisées.',
    'Projet personnel',
    '2025-12-01',
    '2 mois',
    '["React", "Vite", "GSAP", "Framer Motion", "Supabase"]'::jsonb,
    true,
    'https://rustikop.com',
    'https://github.com/rustikop/portfolio',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
    '[]'::jsonb,
    NULL,
    NULL,
    9
);

-- ============================================
-- VÉRIFICATION
-- ============================================
SELECT 'Produits insérés:' as info, COUNT(*) as count FROM portfolio_products;
SELECT 'Projets insérés:' as info, COUNT(*) as count FROM portfolio_projects;
