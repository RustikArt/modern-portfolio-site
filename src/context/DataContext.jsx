import { createContext, useContext, useState, useEffect } from 'react';
import Toast from '../components/Toast';
import emailjs from '@emailjs/browser';
// BCrypt is handled backend-side in production, removed frontend import to fix build error

const DataContext = createContext();

export const useData = () => useContext(DataContext);

// --- SECURITY CONSTANTS ---
export const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    MODERATOR: 'moderator',
    EDITOR: 'editor',
    CLIENT: 'client'
};

const PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: ['all'],
    [ROLES.ADMIN]: ['manage_orders', 'manage_products', 'manage_content', 'view_users', 'view_stats'],
    [ROLES.MODERATOR]: ['manage_orders', 'view_users', 'view_stats'],
    [ROLES.EDITOR]: ['manage_content', 'view_stats'],
    [ROLES.CLIENT]: []
};

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Fallback Initial Data
const fallbackProjects = [
    { id: 1, title: 'Nebula', category: 'Web Design', image: 'https://placehold.co/600x400/1a1a1a/FFF?text=Nebula', content: '<p>Une exploration profonde de l\'espace numérique.</p>' },
    { id: 2, title: 'Quartz', category: 'Branding', image: 'https://placehold.co/600x400/2a2a2a/FFF?text=Quartz', content: '<p>Identité visuelle cristalline et intemporelle.</p>' },
    { id: 3, title: 'Echo', category: 'App Mobile', image: 'https://placehold.co/600x400/151515/FFF?text=Echo', content: '<p>Connecter les gens par la voix.</p>' },
    { id: 4, title: 'Horizon', category: 'Ecommerce', image: 'https://placehold.co/600x400/0f0f0f/FFF?text=Horizon', content: '<p>Le futur du commerce en ligne.</p>' },
];

const defaultHomeContent = {
    hero: {
        titleLine1: "Toutes les faces de l'art,",
        titleLine2: "réunies.",
        subtitle: "Design numérique & Expériences immersives.",
        buttonText: "Voir les projets",
        buttonLink: "/projects"
    },
    featuredProjects: {
        title: "Projets à la une",
        ids: [1, 2, 3] // Default project IDs to show
    },
    services: [
        { id: 1, title: "Design Graphique", icon: "Palette", description: "Identités visuelles marquantes et designs uniques." },
        { id: 2, title: "Développement Web", icon: "Code", description: "Sites performants, réactifs et modernes." },
        { id: 3, title: "Branding", icon: "Briefcase", description: "Stratégies de marque pour vous démarquer." },
        { id: 4, title: "Marketing Digital", icon: "TrendingUp", description: "Campagnes ciblées pour accroître votre visibilité." }
    ],
    testimonials: [
        { id: 1, name: "Sophie Martin", role: "CEO, TechFlow", quote: "Une équipe incroyable qui a su transformer notre vision en réalité.", image: "https://placehold.co/100x100/333/FFF?text=SM" },
        { id: 2, name: "Thomas Dubois", role: "Directeur Artistique", quote: "Créativité et professionnalisme au rendez-vous. Je recommande !", image: "https://placehold.co/100x100/333/FFF?text=TD" }
    ],
    stats: [
        { id: 1, label: "Projets Réalisés", value: "150+" },
        { id: 2, label: "Clients Satisfaits", value: "80+" },
        { id: 3, label: "Années d'Expérience", value: "5+" },
        { id: 4, label: "Taux de Satisfaction", value: "98%" }
    ],
    cta: {
        title: "Prêt à démarrer votre projet ?",
        text: "Contactez-nous dès aujourd'hui pour discuter de vos besoins.",
        buttonText: "Nous Contacter",
        buttonLink: "/contact"
    }
};

const fallbackProducts = [
    // ==================== GRAPHISME ====================
    {
        id: 101,
        name: 'Création de Logo',
        price: 350,
        promoPrice: null,
        is_featured: true,
        image: 'https://cdn-icons-png.flaticon.com/512/1005/1005141.png',
        category: 'Graphisme',
        tags: ['logo', 'branding', 'identité visuelle', 'entreprise', 'création'],
        options: [
            { name: 'Style', type: 'select', values: [{ label: 'Minimaliste', priceModifier: 0 }, { label: 'Illustratif', priceModifier: 150 }, { label: 'Typographique', priceModifier: 50 }] },
            { name: 'Révisions', type: 'select', values: [{ label: '2 révisions', priceModifier: 0 }, { label: '5 révisions', priceModifier: 100 }, { label: 'Illimitées', priceModifier: 250 }] },
            { name: 'Charte graphique', type: 'select', values: [{ label: 'Sans', priceModifier: 0 }, { label: 'Simplifiée', priceModifier: 150 }] }
        ]
    },
    {
        id: 102,
        name: 'Identité Visuelle Complète',
        price: 1500,
        promoPrice: 1350,
        is_featured: true,
        image: 'https://cdn-icons-png.flaticon.com/512/2620/2620552.png',
        category: 'Graphisme',
        tags: ['branding', 'identité visuelle', 'charte graphique', 'entreprise', 'design'],
        options: [
            { name: 'Pack', type: 'select', values: [{ label: 'Essentiel', priceModifier: 0 }, { label: 'Premium', priceModifier: 800 }, { label: 'Complet', priceModifier: 1500 }] },
            { name: 'Cartes de visite', type: 'select', values: [{ label: 'Non incluses', priceModifier: 0 }, { label: 'Design inclus', priceModifier: 100 }] }
        ]
    },
    {
        id: 103,
        name: 'Bannière / Header Web',
        price: 75,
        promoPrice: null,
        is_featured: false,
        image: 'https://cdn-icons-png.flaticon.com/512/1055/1055646.png',
        category: 'Graphisme',
        tags: ['bannière', 'header', 'webdesign', 'publicité', 'réseaux sociaux'],
        options: [
            { name: 'Format', type: 'select', values: [{ label: 'Statique', priceModifier: 0 }, { label: 'Animé GIF', priceModifier: 50 }] },
            { name: 'Plateformes', type: 'select', values: [{ label: '1 plateforme', priceModifier: 0 }, { label: 'Multi-plateformes', priceModifier: 40 }] }
        ]
    },
    {
        id: 104,
        name: 'Pack Réseaux Sociaux',
        price: 250,
        promoPrice: 199,
        is_featured: true,
        image: 'https://cdn-icons-png.flaticon.com/512/3955/3955024.png',
        category: 'Graphisme',
        tags: ['réseaux sociaux', 'marketing digital', 'contenu', 'branding', 'instagram'],
        options: [
            { name: 'Nombre de visuels', type: 'select', values: [{ label: '5 visuels', priceModifier: 0 }, { label: '10 visuels', priceModifier: 150 }, { label: '20 visuels', priceModifier: 350 }] },
            { name: 'Stories incluses', type: 'select', values: [{ label: 'Non', priceModifier: 0 }, { label: 'Oui (+5)', priceModifier: 80 }] }
        ]
    },
    {
        id: 105,
        name: 'Carte de Visite',
        price: 90,
        promoPrice: null,
        is_featured: false,
        image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
        category: 'Graphisme',
        tags: ['carte de visite', 'papeterie', 'branding', 'professionnel', 'impression'],
        options: [
            { name: 'Face', type: 'select', values: [{ label: 'Recto seul', priceModifier: 0 }, { label: 'Recto/Verso', priceModifier: 40 }] },
            { name: 'Finition', type: 'select', values: [{ label: 'Mat', priceModifier: 0 }, { label: 'Brillant', priceModifier: 15 }, { label: 'Soft-touch', priceModifier: 30 }] }
        ]
    },
    {
        id: 106,
        name: 'Affiche / Poster Digital',
        price: 65,
        promoPrice: null,
        is_featured: false,
        image: 'https://cdn-icons-png.flaticon.com/512/3304/3304590.png',
        category: 'Graphisme',
        tags: ['affiche', 'poster', 'événement', 'publicité', 'décoration'],
        options: [
            { name: 'Format', type: 'select', values: [{ label: 'A4', priceModifier: 0 }, { label: 'A3', priceModifier: 20 }, { label: 'A2', priceModifier: 40 }] },
            { name: 'Style', type: 'select', values: [{ label: 'Moderne', priceModifier: 0 }, { label: 'Vintage', priceModifier: 15 }, { label: 'Artistique', priceModifier: 25 }] }
        ]
    },
    {
        id: 107,
        name: 'Infographie',
        price: 280,
        promoPrice: null,
        is_featured: false,
        image: 'https://cdn-icons-png.flaticon.com/512/2329/2329087.png',
        category: 'Graphisme',
        tags: ['infographie', 'données', 'éducation', 'marketing', 'information'],
        options: [
            { name: 'Complexité', type: 'select', values: [{ label: 'Simple', priceModifier: 0 }, { label: 'Moyenne', priceModifier: 100 }, { label: 'Complexe', priceModifier: 220 }] }
        ]
    },
    {
        id: 108,
        name: 'Design Packaging',
        price: 450,
        promoPrice: null,
        is_featured: false,
        image: 'https://cdn-icons-png.flaticon.com/512/685/685388.png',
        category: 'Graphisme',
        tags: ['packaging', 'produit', 'marque', 'design', 'étiquette'],
        options: [
            { name: 'Type', type: 'select', values: [{ label: 'Étiquette simple', priceModifier: 0 }, { label: 'Boîte complète', priceModifier: 350 }] },
            { name: 'Maquette 3D', type: 'select', values: [{ label: 'Non', priceModifier: 0 }, { label: 'Oui', priceModifier: 100 }] }
        ]
    },
    {
        id: 109,
        name: 'Template Présentation',
        price: 180,
        promoPrice: 149,
        is_featured: false,
        image: 'https://cdn-icons-png.flaticon.com/512/732/732076.png',
        category: 'Graphisme',
        tags: ['présentation', 'business', 'modèle', 'powerpoint', 'slides'],
        options: [
            { name: 'Slides', type: 'select', values: [{ label: '10 slides', priceModifier: 0 }, { label: '20 slides', priceModifier: 100 }, { label: '40 slides', priceModifier: 250 }] },
            { name: 'Format', type: 'select', values: [{ label: 'PowerPoint', priceModifier: 0 }, { label: 'Google Slides', priceModifier: 0 }, { label: 'Keynote', priceModifier: 20 }] }
        ]
    },

    // ==================== ILLUSTRATION ====================
    {
        id: 201,
        name: 'Portrait Illustré Personnalisé',
        price: 85,
        promoPrice: null,
        is_featured: true,
        image: 'https://cdn-icons-png.flaticon.com/512/3141/3141036.png',
        category: 'Illustration',
        tags: ['illustration', 'portrait', 'personnalisé', 'cadeau', 'famille'],
        options: [
            { name: 'Style', type: 'select', values: [{ label: 'Cartoon', priceModifier: 0 }, { label: 'Semi-réaliste', priceModifier: 30 }, { label: 'Réaliste', priceModifier: 65 }] },
            { name: 'Sujets', type: 'select', values: [{ label: '1 personne', priceModifier: 0 }, { label: '2 personnes', priceModifier: 40 }, { label: 'Famille (+3)', priceModifier: 80 }] },
            { name: 'Arrière-plan', type: 'select', values: [{ label: 'Simple', priceModifier: 0 }, { label: 'Détaillé', priceModifier: 35 }] }
        ]
    },
    {
        id: 202,
        name: 'Illustration Éditoriale',
        price: 350,
        promoPrice: null,
        is_featured: false,
        image: 'https://cdn-icons-png.flaticon.com/512/3655/3655580.png',
        category: 'Illustration',
        tags: ['illustration', 'éditorial', 'livre', 'article', 'média'],
        options: [
            { name: 'Complexité', type: 'select', values: [{ label: 'Scène simple', priceModifier: 0 }, { label: 'Scène détaillée', priceModifier: 200 }, { label: 'Multi-personnages', priceModifier: 400 }] },
            { name: 'Droits', type: 'select', values: [{ label: 'Web uniquement', priceModifier: 0 }, { label: 'Print + Web', priceModifier: 150 }] }
        ]
    },
    {
        id: 203,
        name: 'Pack Icônes Custom',
        price: 55,
        promoPrice: 45,
        is_featured: false,
        image: 'https://cdn-icons-png.flaticon.com/512/2621/2621341.png',
        category: 'Illustration',
        tags: ['illustration', 'icônes', 'UI/UX', 'web', 'application'],
        options: [
            { name: 'Quantité', type: 'select', values: [{ label: '10 icônes', priceModifier: 0 }, { label: '25 icônes', priceModifier: 35 }, { label: '50 icônes', priceModifier: 70 }] },
            { name: 'Style', type: 'select', values: [{ label: 'Flat', priceModifier: 0 }, { label: 'Line', priceModifier: 0 }, { label: '3D', priceModifier: 25 }] }
        ]
    },
    {
        id: 204,
        name: 'Illustration T-shirt / Merch',
        price: 120,
        promoPrice: null,
        is_featured: false,
        image: 'https://cdn-icons-png.flaticon.com/512/892/892458.png',
        category: 'Illustration',
        tags: ['illustration', 't-shirt', 'merchandising', 'vêtements', 'design'],
        options: [
            { name: 'Complexité', type: 'select', values: [{ label: 'Simple', priceModifier: 0 }, { label: 'Détaillé', priceModifier: 80 }] },
            { name: 'Licence', type: 'select', values: [{ label: 'Usage personnel', priceModifier: 0 }, { label: 'Commercial (100 pcs)', priceModifier: 100 }, { label: 'Commercial illimité', priceModifier: 250 }] }
        ]
    },
    {
        id: 205,
        name: 'Design pour Tatouage',
        price: 95,
        promoPrice: null,
        is_featured: false,
        image: 'https://cdn-icons-png.flaticon.com/512/3225/3225270.png',
        category: 'Illustration',
        tags: ['illustration', 'tatouage', 'art corporel', 'design', 'personnalisé'],
        options: [
            { name: 'Style', type: 'select', values: [{ label: 'Minimaliste', priceModifier: 0 }, { label: 'Traditionnel', priceModifier: 30 }, { label: 'Réaliste', priceModifier: 80 }, { label: 'Géométrique', priceModifier: 40 }] },
            { name: 'Taille', type: 'select', values: [{ label: 'Petit (5-10cm)', priceModifier: 0 }, { label: 'Moyen (15-20cm)', priceModifier: 50 }, { label: 'Grand (30cm+)', priceModifier: 100 }] }
        ]
    },
    {
        id: 206,
        name: 'Carte Postale Illustrée',
        price: 40,
        promoPrice: null,
        is_featured: false,
        image: 'https://cdn-icons-png.flaticon.com/512/3082/3082060.png',
        category: 'Illustration',
        tags: ['illustration', 'carte postale', 'voyage', 'fêtes', 'cadeau'],
        options: [
            { name: 'Thème', type: 'select', values: [{ label: 'Voyage', priceModifier: 0 }, { label: 'Anniversaire', priceModifier: 0 }, { label: 'Noël/Fêtes', priceModifier: 0 }, { label: 'Personnalisé', priceModifier: 20 }] }
        ]
    },

    // ==================== PHOTOGRAPHIE ====================
    {
        id: 301,
        name: "Tirage Photo Fine Art",
        price: 120,
        promoPrice: null,
        is_featured: true,
        image: 'https://cdn-icons-png.flaticon.com/512/3004/3004613.png',
        category: 'Photographie',
        tags: ['photographie', 'art', 'tirage', 'décoration', 'paysage'],
        options: [
            { name: 'Format', type: 'select', values: [{ label: 'A4 (21x30cm)', priceModifier: 0 }, { label: 'A3 (30x42cm)', priceModifier: 60 }, { label: '50x70cm', priceModifier: 150 }, { label: '70x100cm', priceModifier: 280 }] },
            { name: 'Papier', type: 'select', values: [{ label: 'Mat Hahnemühle', priceModifier: 0 }, { label: 'Brillant Pro', priceModifier: 20 }, { label: 'Texturé Aquarelle', priceModifier: 40 }] },
            { name: 'Édition', type: 'select', values: [{ label: 'Ouverte', priceModifier: 0 }, { label: 'Limitée (30ex)', priceModifier: 100 }, { label: 'Limitée signée (10ex)', priceModifier: 200 }] }
        ]
    },
    {
        id: 302,
        name: 'Licence Photo Stock',
        price: 45,
        promoPrice: null,
        is_featured: false,
        image: 'https://cdn-icons-png.flaticon.com/512/2659/2659360.png',
        category: 'Photographie',
        tags: ['photographie', 'stock', 'licence', 'commercial', 'web'],
        options: [
            { name: 'Licence', type: 'select', values: [{ label: 'Standard (web)', priceModifier: 0 }, { label: 'Étendue (print)', priceModifier: 80 }, { label: 'Exclusive', priceModifier: 300 }] },
            { name: 'Résolution', type: 'select', values: [{ label: 'Web (1920px)', priceModifier: 0 }, { label: 'HD (4000px)', priceModifier: 30 }, { label: 'RAW', priceModifier: 60 }] }
        ]
    },
    {
        id: 303,
        name: 'Séance Photo Portrait',
        price: 250,
        promoPrice: null,
        is_featured: true,
        image: 'https://cdn-icons-png.flaticon.com/512/2956/2956744.png',
        category: 'Photographie',
        tags: ['photographie', 'portrait', 'service', 'professionnel', 'studio'],
        options: [
            { name: 'Durée', type: 'select', values: [{ label: '30 min', priceModifier: 0 }, { label: '1 heure', priceModifier: 150 }, { label: '2 heures', priceModifier: 350 }] },
            { name: 'Photos livrées', type: 'select', values: [{ label: '5 photos retouchées', priceModifier: 0 }, { label: '15 photos retouchées', priceModifier: 100 }, { label: 'Toutes les photos', priceModifier: 200 }] },
            { name: 'Lieu', type: 'select', values: [{ label: 'Studio', priceModifier: 0 }, { label: 'Extérieur (Paris)', priceModifier: 50 }] }
        ]
    },
    {
        id: 304,
        name: 'Pack Photos Voyage',
        price: 35,
        promoPrice: 25,
        is_featured: false,
        image: 'https://cdn-icons-png.flaticon.com/512/201/201623.png',
        category: 'Photographie',
        tags: ['photographie', 'voyage', 'paysage', 'nature', 'digital'],
        options: [
            { name: 'Nombre', type: 'select', values: [{ label: '5 photos', priceModifier: 0 }, { label: '10 photos', priceModifier: 25 }, { label: '20 photos', priceModifier: 55 }] }
        ]
    },

    // ==================== VIDÉO & MUSIQUE ====================
    {
        id: 401,
        name: 'Montage Vidéo Réels/TikTok',
        price: 95,
        promoPrice: null,
        is_featured: true,
        image: 'https://cdn-icons-png.flaticon.com/512/1179/1179120.png',
        category: 'Vidéo & Musique',
        tags: ['vidéo', 'réseaux sociaux', 'TikTok', 'Instagram', 'montage'],
        options: [
            { name: 'Durée', type: 'select', values: [{ label: '15 secondes', priceModifier: 0 }, { label: '30 secondes', priceModifier: 40 }, { label: '60 secondes', priceModifier: 80 }] },
            { name: 'Sous-titres', type: 'select', values: [{ label: 'Sans', priceModifier: 0 }, { label: 'Avec animation', priceModifier: 30 }] },
            { name: 'Révisions', type: 'select', values: [{ label: '1 révision', priceModifier: 0 }, { label: '3 révisions', priceModifier: 25 }] }
        ]
    },
    {
        id: 402,
        name: 'Motion Design Animation',
        price: 380,
        promoPrice: null,
        is_featured: true,
        image: 'https://cdn-icons-png.flaticon.com/512/2784/2784459.png',
        category: 'Vidéo & Musique',
        tags: ['vidéo', 'animation', 'motion design', 'explicatif', 'publicité'],
        options: [
            { name: 'Durée', type: 'select', values: [{ label: '15 secondes', priceModifier: 0 }, { label: '30 secondes', priceModifier: 200 }, { label: '60 secondes', priceModifier: 450 }] },
            { name: 'Voix-off', type: 'select', values: [{ label: 'Sans', priceModifier: 0 }, { label: 'Voix française', priceModifier: 80 }, { label: 'Voix anglaise', priceModifier: 80 }] },
            { name: 'Musique', type: 'select', values: [{ label: 'Libre de droits', priceModifier: 0 }, { label: 'Composition originale', priceModifier: 150 }] }
        ]
    },
    {
        id: 403,
        name: 'Composition Musicale',
        price: 350,
        promoPrice: null,
        is_featured: false,
        image: 'https://cdn-icons-png.flaticon.com/512/3844/3844724.png',
        category: 'Vidéo & Musique',
        tags: ['musique', 'composition', 'bande son', 'film', 'publicité'],
        options: [
            { name: 'Durée', type: 'select', values: [{ label: '30 secondes', priceModifier: 0 }, { label: '1 minute', priceModifier: 150 }, { label: '2-3 minutes', priceModifier: 400 }] },
            { name: 'Style', type: 'select', values: [{ label: 'Ambiance/Cinématique', priceModifier: 0 }, { label: 'Électronique', priceModifier: 0 }, { label: 'Orchestral', priceModifier: 200 }] },
            { name: 'Droits', type: 'select', values: [{ label: 'Personnel', priceModifier: 0 }, { label: 'Commercial', priceModifier: 200 }, { label: 'Exclusif', priceModifier: 500 }] }
        ]
    },
    {
        id: 404,
        name: 'Jingle / Intro Podcast',
        price: 120,
        promoPrice: 99,
        is_featured: false,
        image: 'https://cdn-icons-png.flaticon.com/512/3039/3039436.png',
        category: 'Vidéo & Musique',
        tags: ['musique', 'audio', 'jingle', 'podcast', 'branding'],
        options: [
            { name: 'Durée', type: 'select', values: [{ label: '5 secondes', priceModifier: 0 }, { label: '10 secondes', priceModifier: 40 }, { label: '15 secondes', priceModifier: 70 }] },
            { name: 'Voix-off', type: 'select', values: [{ label: 'Sans', priceModifier: 0 }, { label: 'Avec voix', priceModifier: 60 }] }
        ]
    },
    {
        id: 405,
        name: 'Pack Beats / Samples',
        price: 45,
        promoPrice: null,
        is_featured: false,
        image: 'https://cdn-icons-png.flaticon.com/512/2995/2995101.png',
        category: 'Vidéo & Musique',
        tags: ['musique', 'production', 'samples', 'beats', 'instrumentaux'],
        options: [
            { name: 'Pack', type: 'select', values: [{ label: '5 samples', priceModifier: 0 }, { label: '15 samples', priceModifier: 50 }, { label: '30 samples', priceModifier: 100 }] },
            { name: 'Genre', type: 'select', values: [{ label: 'Hip-Hop', priceModifier: 0 }, { label: 'Électro', priceModifier: 0 }, { label: 'Lo-Fi', priceModifier: 0 }] }
        ]
    },

    // ==================== OBJETS & ÉDITIONS ====================
    {
        id: 501,
        name: 'Objet Artisanal Céramique',
        price: 65,
        promoPrice: null,
        is_featured: false,
        image: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png',
        category: 'Objets & Éditions',
        tags: ['artisanat', 'fait main', 'céramique', 'décoration', 'unique'],
        options: [
            { name: 'Type', type: 'select', values: [{ label: 'Tasse', priceModifier: 0 }, { label: 'Vase petit', priceModifier: 30 }, { label: 'Vase moyen', priceModifier: 80 }, { label: 'Sculpture', priceModifier: 150 }] },
            { name: 'Couleur', type: 'select', values: [{ label: 'Blanc naturel', priceModifier: 0 }, { label: 'Noir mat', priceModifier: 10 }, { label: 'Émaillé couleur', priceModifier: 25 }] }
        ]
    },
    {
        id: 502,
        name: 'Faire-Part Personnalisé',
        price: 8,
        promoPrice: null,
        is_featured: false,
        image: 'https://cdn-icons-png.flaticon.com/512/3187/3187522.png',
        category: 'Objets & Éditions',
        tags: ['papeterie', 'mariage', 'anniversaire', 'personnalisé', 'impression'],
        options: [
            { name: 'Événement', type: 'select', values: [{ label: 'Mariage', priceModifier: 0 }, { label: 'Naissance', priceModifier: 0 }, { label: 'Anniversaire', priceModifier: 0 }] },
            { name: 'Quantité', type: 'select', values: [{ label: '25 exemplaires', priceModifier: 0 }, { label: '50 exemplaires', priceModifier: 150 }, { label: '100 exemplaires', priceModifier: 350 }] },
            { name: 'Finition', type: 'select', values: [{ label: 'Standard', priceModifier: 0 }, { label: 'Dorure à chaud', priceModifier: 80 }] }
        ]
    },
    {
        id: 503,
        name: 'T-Shirt Artistique',
        price: 35,
        promoPrice: null,
        is_featured: true,
        image: 'https://cdn-icons-png.flaticon.com/512/892/892458.png',
        category: 'Objets & Éditions',
        tags: ['vêtements', 'mode', 'personnalisé', 't-shirt', 'design'],
        options: [
            { name: 'Taille', type: 'select', values: [{ label: 'S', priceModifier: 0 }, { label: 'M', priceModifier: 0 }, { label: 'L', priceModifier: 0 }, { label: 'XL', priceModifier: 5 }, { label: 'XXL', priceModifier: 10 }] },
            { name: 'Coupe', type: 'select', values: [{ label: 'Classique', priceModifier: 0 }, { label: 'Oversize', priceModifier: 8 }] },
            { name: 'Couleur', type: 'select', values: [{ label: 'Noir', priceModifier: 0 }, { label: 'Blanc', priceModifier: 0 }, { label: 'Beige', priceModifier: 5 }] }
        ]
    },
    {
        id: 504,
        name: 'Zine / Livre d\'Art',
        price: 28,
        promoPrice: null,
        is_featured: false,
        image: 'https://cdn-icons-png.flaticon.com/512/3165/3165065.png',
        category: 'Objets & Éditions',
        tags: ['livre d\'art', 'zine', 'édition', 'collection', 'photographie'],
        options: [
            { name: 'Édition', type: 'select', values: [{ label: 'Standard', priceModifier: 0 }, { label: 'Limitée numérotée', priceModifier: 25 }, { label: 'Signée + numérotée', priceModifier: 50 }] }
        ]
    },
    {
        id: 505,
        name: 'Kit DIY Peinture',
        price: 42,
        promoPrice: 35,
        is_featured: false,
        image: 'https://cdn-icons-png.flaticon.com/512/1998/1998610.png',
        category: 'Objets & Éditions',
        tags: ['DIY', 'kit créatif', 'loisirs', 'peinture', 'cadeau'],
        options: [
            { name: 'Niveau', type: 'select', values: [{ label: 'Débutant', priceModifier: 0 }, { label: 'Intermédiaire', priceModifier: 15 }, { label: 'Avancé', priceModifier: 30 }] },
            { name: 'Format', type: 'select', values: [{ label: 'Petit (20x20cm)', priceModifier: 0 }, { label: 'Moyen (30x40cm)', priceModifier: 18 }] }
        ]
    },

    // ==================== ART NUMÉRIQUE ====================
    {
        id: 601,
        name: 'NFT / Art Crypto',
        price: 150,
        promoPrice: null,
        is_featured: true,
        image: 'https://cdn-icons-png.flaticon.com/512/6262/6262178.png',
        category: 'Art Numérique',
        tags: ['NFT', 'crypto art', 'blockchain', 'digital', 'collection'],
        options: [
            { name: 'Édition', type: 'select', values: [{ label: 'Série (100 ex)', priceModifier: 0 }, { label: 'Limitée (10 ex)', priceModifier: 200 }, { label: 'Unique (1/1)', priceModifier: 850 }] },
            { name: 'Accompagnement', type: 'select', values: [{ label: 'Œuvre seule', priceModifier: 0 }, { label: 'Aide mise en vente', priceModifier: 100 }] }
        ]
    },
    {
        id: 602,
        name: 'Filtre AR Instagram',
        price: 280,
        promoPrice: null,
        is_featured: false,
        image: 'https://cdn-icons-png.flaticon.com/512/3081/3081330.png',
        category: 'Art Numérique',
        tags: ['AR', 'réalité augmentée', 'Instagram', 'Snapchat', 'filtre'],
        options: [
            { name: 'Complexité', type: 'select', values: [{ label: '2D simple', priceModifier: 0 }, { label: '3D basique', priceModifier: 250 }, { label: '3D interactif', priceModifier: 500 }] },
            { name: 'Plateforme', type: 'select', values: [{ label: 'Instagram', priceModifier: 0 }, { label: 'Snapchat', priceModifier: 50 }, { label: 'Les deux', priceModifier: 150 }] }
        ]
    },
    {
        id: 603,
        name: 'Modèle 3D Asset',
        price: 85,
        promoPrice: null,
        is_featured: false,
        image: 'https://cdn-icons-png.flaticon.com/512/3161/3161837.png',
        category: 'Art Numérique',
        tags: ['3D', 'modélisation', 'assets', 'jeu vidéo', 'animation'],
        options: [
            { name: 'Complexité', type: 'select', values: [{ label: 'Low-poly', priceModifier: 0 }, { label: 'Mid-poly', priceModifier: 80 }, { label: 'High-poly détaillé', priceModifier: 250 }] },
            { name: 'Textures', type: 'select', values: [{ label: 'Sans', priceModifier: 0 }, { label: 'PBR incluses', priceModifier: 60 }] },
            { name: 'Animation', type: 'select', values: [{ label: 'Statique', priceModifier: 0 }, { label: 'Animé', priceModifier: 150 }] }
        ]
    },
    {
        id: 604,
        name: 'Art Génératif',
        price: 120,
        promoPrice: null,
        is_featured: true,
        image: 'https://cdn-icons-png.flaticon.com/512/2784/2784403.png',
        category: 'Art Numérique',
        tags: ['art génératif', 'algorithmique', 'code', 'digital', 'abstrait'],
        options: [
            { name: 'Format', type: 'select', values: [{ label: 'Image HD', priceModifier: 0 }, { label: 'Image 4K', priceModifier: 40 }, { label: 'Vidéo loop', priceModifier: 150 }] },
            { name: 'Personnalisation', type: 'select', values: [{ label: 'Aléatoire', priceModifier: 0 }, { label: 'Paramètres custom', priceModifier: 80 }] }
        ]
    },
    {
        id: 605,
        name: 'Boucle Vidéo Art',
        price: 180,
        promoPrice: null,
        is_featured: false,
        image: 'https://cdn-icons-png.flaticon.com/512/1179/1179069.png',
        category: 'Art Numérique',
        tags: ['vidéo', 'art vidéo', 'boucle', 'visuel', 'ambiance'],
        options: [
            { name: 'Résolution', type: 'select', values: [{ label: 'Full HD', priceModifier: 0 }, { label: '4K', priceModifier: 100 }] },
            { name: 'Durée loop', type: 'select', values: [{ label: '10 secondes', priceModifier: 0 }, { label: '30 secondes', priceModifier: 80 }, { label: '1 minute', priceModifier: 150 }] },
            { name: 'Audio', type: 'select', values: [{ label: 'Sans', priceModifier: 0 }, { label: 'Ambiance sonore', priceModifier: 60 }] }
        ]
    }
];


// Initial Admin User (Auto-created if no users exist)
const initialAdmin = {
    id: 'admin_01',
    name: 'Administrateur',
    email: 'rustiksbaz@gmail.com',
    password: 'admin123', // In a real app, hash this!
    role: 'admin'
};

export const DataProvider = ({ children }) => {
    // --- CORE DATA ---
    const [projects, setProjects] = useState([]);
    const [products, setProducts] = useState([]);

    // --- E-COMMERCE DATA ---
    const [users, setUsers] = useState(() => {
        const saved = localStorage.getItem('portfolio_users');
        let parsedUsers = saved ? JSON.parse(saved) : [];

        // Phase 3: Ensure Admin exists
        if (!parsedUsers.find(u => u.email === initialAdmin.email)) {
            parsedUsers = [...parsedUsers, initialAdmin];
        }
        return parsedUsers;
    });

    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('portfolio_currentUser');
        return saved ? JSON.parse(saved) : null;
    });

    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('portfolio_cart');
        return saved ? JSON.parse(saved) : [];
    });

    const [orders, setOrders] = useState(() => {
        const saved = localStorage.getItem('portfolio_orders');
        return saved ? JSON.parse(saved) : [];
    });

    // Promo Codes State
    const [promoCodes, setPromoCodes] = useState([]);
    const [activePromo, setActivePromo] = useState(() => {
        const saved = localStorage.getItem('portfolio_active_promo');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        localStorage.setItem('portfolio_active_promo', JSON.stringify(activePromo));
    }, [activePromo]);

    // Toast State
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // Announcement Banner State (from Supabase)
    const [announcement, setAnnouncement] = useState(null);

    const [loginHistory, setLoginHistory] = useState(() => {
        const saved = localStorage.getItem('portfolio_login_history');
        return saved ? JSON.parse(saved) : [];
    });

    const checkPermission = (requiredPermission) => {
        if (!currentUser) return false;

        // Super admin always has all permissions
        if (currentUser.role === ROLES.SUPER_ADMIN) return true;

        // Normalize permissions whether they come as string or array
        let perms = currentUser.permissions;
        if (typeof perms === 'string') {
            try {
                perms = JSON.parse(perms);
            } catch (e) {
                // allow comma-separated or '*' styles
                if (perms.includes(',')) perms = perms.split(',').map(p => p.trim());
                else perms = [perms];
            }
        }

        if (Array.isArray(perms)) {
            // Accept both 'all' and '*' as global wildcard
            if (perms.includes('all') || perms.includes('*')) return true;
            return perms.includes(requiredPermission);
        }

        const rolePermissions = PERMISSIONS[currentUser.role] || [];

        // Fallback to role-based permissions if granular ones aren't defined
        return rolePermissions.includes('all') || rolePermissions.includes(requiredPermission);
    };


    // Admin Notifications State
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('portfolio_notifications');
        return saved ? JSON.parse(saved) : [];
    });

    const [homeContent, setHomeContent] = useState(() => {
        const saved = localStorage.getItem('portfolio_home_content');
        return saved ? JSON.parse(saved) : defaultHomeContent;
    });

    // Add effect to save announcement to localStorage for dismissal tracking
    useEffect(() => {
        if (announcement) {
            localStorage.setItem('portfolio_announcement', JSON.stringify(announcement));
        }
    }, [announcement]);

    // --- GLOBAL SETTINGS (from Supabase) ---
    const [settings, setSettings] = useState(() => {
        const defaultSettings = {
            maintenanceMode: false,
            grainEffect: true,
            siteTitle: 'RUSTIKOP',
            contactEmail: 'rustikop@outlook.fr',
            supportPhone: '',
            socials: {
                instagram: 'https://www.instagram.com/rustikop.art/',
                twitter: 'https://x.com/rustikop',
                discord: 'https://discord.gg/uaKYcrfyN6',
                linkedin: ''
            },
            version: 1.1
        };
        // Load from localStorage as fallback while waiting for Supabase
        const saved = localStorage.getItem('portfolio_settings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                return { ...defaultSettings, ...parsed };
            } catch (e) {
                return defaultSettings;
            }
        }
        return defaultSettings;
    });

    // --- FETCH DATA ON MOUNT ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectsRes, productsRes, promoRes, usersRes, ordersRes] = await Promise.all([
                    fetch('/api/projects'),
                    fetch('/api/products'),
                    fetch('/api/promo-codes'),
                    fetch('/api/users'),
                    fetch('/api/orders')
                ]);

                if (projectsRes && projectsRes.ok) {
                    const projectsData = await projectsRes.json();
                    if (Array.isArray(projectsData)) {
                        setProjects(projectsData);
                    } else {
                        throw new Error('Invalid projects data format');
                    }
                } else {
                    console.error('Projects API failed:', projectsRes?.status);
                    // Try to recover from local storage
                    const localProjects = localStorage.getItem('portfolio_projects');
                    if (localProjects) {
                        const parsed = JSON.parse(localProjects);
                        setProjects(Array.isArray(parsed) ? parsed : fallbackProjects);
                    } else {
                        setProjects(fallbackProjects);
                    }
                }

                if (productsRes && productsRes.ok) {
                    const productsData = await productsRes.json();
                    if (Array.isArray(productsData)) {
                        setProducts(productsData);
                    } else {
                        throw new Error('Invalid products data format');
                    }
                } else {
                    console.error('Products API failed:', productsRes?.status);
                    const localProducts = localStorage.getItem('portfolio_products');
                    if (localProducts) {
                        const parsed = JSON.parse(localProducts);
                        setProducts(Array.isArray(parsed) ? parsed : fallbackProducts);
                    } else {
                        setProducts(fallbackProducts);
                    }
                }

                if (promoRes.ok) {
                    const promoData = await promoRes.json();
                    // Normalize to camelCase for frontend usage
                    const normalizedPromos = promoData.map(p => ({
                        ...p,
                        expirationDate: p.expiration_date || p.expirationDate,
                        maxUses: p.max_uses || p.maxUses,
                        minAmount: p.min_amount || p.minAmount
                    }));
                    setPromoCodes(normalizedPromos);
                } else {
                    console.error('Promo codes API failed');
                }

                if (usersRes && usersRes.ok) {
                    const usersData = await usersRes.json();
                    if (usersData && usersData.length > 0) {
                        // Normalize users (permissions as array)
                        const normalizedUsers = usersData.map(u => ({
                            ...u,
                            permissions: typeof u.permissions === 'string' ? JSON.parse(u.permissions) : (u.permissions || [])
                        }));
                        setUsers(normalizedUsers);
                    }
                }

                if (ordersRes && ordersRes.ok) {
                    const ordersData = await ordersRes.json();
                    if (ordersData && ordersData.length > 0) {
                        // Normalize to camelCase
                        const normalizedOrders = ordersData.map(o => ({
                            ...o,
                            customerName: o.customer_name || o.customerName,
                            userId: o.user_id || o.userId,
                            paymentId: o.payment_id || o.paymentId
                        }));
                        setOrders(normalizedOrders);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch data from API:', error);
                // Try to recover from local storage
                const localProjects = localStorage.getItem('portfolio_projects');
                const localProducts = localStorage.getItem('portfolio_products');
                const localPromos = localStorage.getItem('portfolio_promo_codes');

                if (localProjects) {
                    console.log('Recovering all data from local storage');
                    setProjects(JSON.parse(localProjects));
                    setProducts(JSON.parse(localProducts || '[]'));
                    setPromoCodes(JSON.parse(localPromos || '[]'));
                } else {
                    console.log('No local data found, using fallbacks');
                    setProjects(fallbackProjects);
                    setProducts(fallbackProducts);
                    setPromoCodes([
                        { id: 1, code: 'WELCOME10', type: 'percent', value: 10 },
                        { id: 2, code: 'MINUS5', type: 'fixed', value: 5 }
                    ]);
                }
            }
        };
        fetchData();
    }, []);

    // --- FETCH SETTINGS & ANNOUNCEMENTS FROM SUPABASE ---
    useEffect(() => {
        const fetchSupabaseData = async () => {
            if (!supabase) return;

            try {
                // Fetch settings
                const { data: settingsData, error: settingsError } = await supabase
                    .from('portfolio_settings')
                    .select('*')
                    .order('id', { ascending: false })
                    .limit(1);

                if (settingsError) {
                    console.error('Error fetching settings:', settingsError);
                } else if (settingsData && settingsData.length > 0) {
                    const fetchedSettings = settingsData[0];
                    setSettings(prev => ({
                        ...prev,
                        maintenanceMode: fetchedSettings.maintenance_mode || prev.maintenanceMode,
                        siteTitle: fetchedSettings.site_title || prev.siteTitle,
                        contactEmail: fetchedSettings.contact_email || prev.contactEmail,
                        supportPhone: fetchedSettings.support_phone || prev.supportPhone,
                        socials: fetchedSettings.socials || prev.socials
                    }));
                }

                // Fetch announcement
                const { data: announcementData, error: announcementError } = await supabase
                    .from('portfolio_announcements')
                    .select('*')
                    .eq('is_archived', false)
                    .eq('is_active', true)
                    .order('updated_at', { ascending: false })
                    .limit(1);

                if (announcementError) {
                    console.error('Error fetching announcement:', announcementError);
                } else if (announcementData && announcementData.length > 0) {
                    setAnnouncement(announcementData[0]);
                }
            } catch (error) {
                console.error('Failed to fetch Supabase data:', error);
            }
        };

        fetchSupabaseData();
    }, []);

    // --- PERSISTENCE --- (Now handled by API)

    useEffect(() => {
        localStorage.setItem('portfolio_users', JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        localStorage.setItem('portfolio_currentUser', JSON.stringify(currentUser));
        // Sync role to localStorage for ProtectedRoute
        if (currentUser && currentUser.role === 'admin') {
            localStorage.setItem('isAdmin', 'true');
        } else {
            localStorage.removeItem('isAdmin');
        }
    }, [currentUser]);

    useEffect(() => {
        localStorage.setItem('portfolio_cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        // Sanitize orders to ensure they have the new status names and checklist if missing
        const sanitizedOrders = orders.map(order => ({
            ...order,
            status: order.status === 'Payé' || order.status === 'En attente' ? 'Réception' : order.status,
            checklist: order.checklist || [
                { id: 1, label: 'Brief client reçu', completed: false },
                { id: 2, label: 'Concept design validé', completed: false },
                { id: 3, label: 'Production / Création', completed: false },
                { id: 4, label: 'Envoi finalisé', completed: false }
            ]
        }));
        localStorage.setItem('portfolio_orders', JSON.stringify(sanitizedOrders));
    }, [orders]);

    // Sync local storage with API data to prevent data loss
    useEffect(() => {
        const syncLocalStorageWithAPI = async () => {
            try {
                // Sync projects
                const projectsRes = await fetch('/api/projects');
                if (projectsRes.ok) {
                    const projectsData = await projectsRes.json();
                    localStorage.setItem('portfolio_projects', JSON.stringify(projectsData));
                }

                // Sync products
                const productsRes = await fetch('/api/products');
                if (productsRes.ok) {
                    const productsData = await productsRes.json();
                    localStorage.setItem('portfolio_products', JSON.stringify(productsData));
                }

                // Sync promo codes
                const promoRes = await fetch('/api/promo-codes');
                if (promoRes.ok) {
                    const promoData = await promoRes.json();
                    localStorage.setItem('portfolio_promo_codes', JSON.stringify(promoData));
                }
            } catch (error) {
                console.error('Failed to sync local storage with API:', error);
            }
        };

        // Sync every 5 minutes
        const syncInterval = setInterval(syncLocalStorageWithAPI, 5 * 60 * 1000);

        // Initial sync
        syncLocalStorageWithAPI();

        return () => clearInterval(syncInterval);
    }, []);

    useEffect(() => {
        localStorage.setItem('portfolio_announcement', JSON.stringify(announcement));
    }, [announcement]);

    useEffect(() => {
        localStorage.setItem('portfolio_notifications', JSON.stringify(notifications));
    }, [notifications]);

    useEffect(() => {
        localStorage.setItem('portfolio_home_content', JSON.stringify(homeContent));
    }, [homeContent]);


    // --- ACTIONS ---

    // Admin / Data
    const addProject = async (project) => {
        try {
            // Convert camelCase to snake_case for Supabase compatibility
            const projectData = {
                ...project,
                blocks: project.blocks || []
            };

            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData)
            });
            if (res.ok) {
                const updatedProjects = await res.json();
                setProjects(updatedProjects);
            } else {
                const errorText = await res.text();
                console.error('Failed to add project, response:', errorText);
                throw new Error(`Add failed: ${errorText}`);
            }
        } catch (error) {
            console.error('Failed to add project, error:', error);
            throw error;
        }
    };
    const deleteProject = async (id) => {
        try {
            const res = await fetch('/api/projects', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (res.ok) {
                const updatedProjects = await res.json();
                setProjects(updatedProjects);
            } else {
                const errorText = await res.text();
                console.error('Failed to delete project, response:', errorText);
                throw new Error(`Delete failed: ${errorText}`);
            }
        } catch (error) {
            console.error('Failed to delete project, error:', error);
            throw error;
        }
    };
    const updateProject = async (id, updatedProject) => {
        try {
            // Convert camelCase to snake_case for Supabase compatibility
            const projectData = {
                ...updatedProject,
                blocks: updatedProject.blocks || []
            };

            const res = await fetch('/api/projects', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...projectData })
            });
            if (res.ok) {
                const updatedProjects = await res.json();
                setProjects(updatedProjects);
            } else {
                const errorText = await res.text();
                console.error('Failed to update project, response:', errorText);
                throw new Error(`Update failed: ${errorText}`);
            }
        } catch (error) {
            console.error('Failed to update project, error:', error);
            throw error;
        }
    };

    // Updated addProduct to support Phase 3 fields
    const addProduct = async (product) => {
        try {
            // Convert camelCase to snake_case for Supabase compatibility
            const productData = {
                ...product,
                promo_price: product.promoPrice,
                is_featured: product.is_featured,
                tags: product.tags || []
            };
            delete productData.promoPrice; // Remove the frontend field
            delete productData.is_featured; // Remove the frontend field

            console.log('Sending product data to API:', productData);

            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });
            console.log('API response status:', res.status);

            if (res.ok) {
                const updatedProducts = await res.json();
                console.log('Product added successfully:', updatedProducts);
                setProducts(updatedProducts);
            } else {
                const errorText = await res.text();
                console.error('Failed to add product, response:', errorText);
                // Try to parse JSON error for more details
                try {
                    const errorObj = JSON.parse(errorText);
                    console.error('Detailed error:', errorObj);
                } catch (e) {
                    console.error('Error parsing JSON response');
                }
                throw new Error(`Add failed: ${errorText}`);
            }
        } catch (error) {
            console.error('Failed to add product, error:', error);
            throw error;
        }
    };
    const deleteProduct = async (id) => {
        try {
            const res = await fetch('/api/products', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (res.ok) {
                const updatedProducts = await res.json();
                setProducts(updatedProducts);
            } else {
                const errorText = await res.text();
                console.error('Failed to delete product, response:', errorText);
                throw new Error(`Delete failed: ${errorText}`);
            }
        } catch (error) {
            console.error('Failed to delete product, error:', error);
            throw error;
        }
    };
    const updateProduct = async (id, updatedProduct) => {
        try {
            // Convert camelCase to snake_case for Supabase compatibility
            const productData = {
                ...updatedProduct,
                promo_price: updatedProduct.promoPrice,
                is_featured: updatedProduct.is_featured
            };
            delete productData.promoPrice; // Remove the frontend field
            delete productData.is_featured; // Remove the frontend field

            const res = await fetch('/api/products', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...productData })
            });
            if (res.ok) {
                const updatedProducts = await res.json();
                setProducts(updatedProducts);
            } else {
                const errorText = await res.text();
                console.error('Failed to update product, response:', errorText);
                throw new Error(`Update failed: ${errorText}`);
            }
        } catch (error) {
            console.error('Failed to update product, error:', error);
            throw error;
        }
    };

    // User Auth
    const register = async (emailOrObj, password, name) => {
        let newUser;
        if (typeof emailOrObj === 'object') {
            newUser = { role: 'client', ...emailOrObj };
        } else {
            newUser = { email: emailOrObj.trim().toLowerCase(), password: password.trim(), name, role: 'client' };
        }

        const email = newUser.email;
        const exists = users.find(u => u.email === email);
        if (exists) return { success: false, message: 'Email déjà utilisé.' };

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });

            if (res.ok) {
                const updatedUsers = await res.json();

                // Ensure permissions are parsed if they come as JSON strings
                const normalizedUsers = updatedUsers.map(u => ({
                    ...u,
                    permissions: typeof u.permissions === 'string' ? JSON.parse(u.permissions) : (u.permissions || [])
                }));

                setUsers(normalizedUsers);
                const createdUser = normalizedUsers.find(u => u.email === email);
                setCurrentUser(createdUser || newUser);
                addNotification('account', `Nouveau compte créé : ${newUser.name} (${email})`);
                return { success: true };
            } else {
                const errData = await res.json().catch(() => ({}));
                console.error('Registration failed on server:', errData);
                return {
                    success: false,
                    message: errData.error || 'Erreur lors de la création du compte sur le serveur.'
                };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: 'Impossible de contacter le serveur. Vérifiez votre connexion.'
            };
        }
    };

    const login = async (email, password) => {
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase(), password: password.trim() })
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                const msg = err.error || err.message || 'Identifiants ou mot de passe incorrects.';
                try { addNotification('account', `Échec connexion : ${msg}`); } catch (e) { console.warn('addNotification unavailable', e); }
                return { success: false, message: msg };
            }

            const { user } = await res.json();
            if (!user) return { success: false, message: 'Identifiants invalides.' };

            // Update client state
            // Ensure we keep users list in sync (merge or add)
            setUsers(prev => {
                const exists = prev.some(u => u.email === user.email);
                if (exists) return prev.map(u => u.email === user.email ? { ...u, ...user } : u);
                return [user, ...prev];
            });

            setCurrentUser(user);
            return { success: true, isAdmin: user.role === 'admin' };
        } catch (e) {
            console.error('Login error:', e);
            try { addNotification('account', 'Impossible de contacter le serveur.'); } catch (e2) { /* ignore */ }
            return { success: false, message: 'Impossible de contacter le serveur.' };
        }
    };

    const logout = () => {
        setCurrentUser(null);
        setCart([]);
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('portfolio_cart');
    };

    // Promo Codes
    const applyPromoCode = (code) => {
        const promo = promoCodes.find(p => p.code === code);
        if (promo) {
            // 1. Check Expiration
            if (promo.expirationDate && new Date(promo.expirationDate) < new Date()) {
                alert("Ce code promo a expiré.");
                return false;
            }
            // 2. Check Usage Limits
            if (promo.maxUses && promo.uses >= promo.maxUses) {
                alert("Ce code promo a atteint sa limite d'utilisation.");
                return false;
            }
            // 3. Check Minimum Amount
            const currentTotal = getCartTotal();
            if (promo.minAmount && currentTotal < promo.minAmount) {
                alert(`Ce code nécessite un minimum d'achat de ${promo.minAmount}€.`);
                return false;
            }

            setActivePromo(promo);
            return true;
        }
        setActivePromo(null);
        alert("Code promo invalide");
        return false;
    };

    const addPromoCode = async (code) => {
        try {
            // Convert camelCase to snake_case for Supabase compatibility
            const promoData = {
                code: code.code,
                type: code.type,
                value: code.value || 0,
                // Add optional fields map
                expiration_date: code.expirationDate,
                max_uses: code.maxUses,
                min_amount: code.minAmount
            };

            const res = await fetch('/api/promo-codes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(promoData)
            });
            if (res.ok) {
                const updatedPromoCodes = await res.json();
                setPromoCodes(updatedPromoCodes);
            } else {
                const errorText = await res.text();
                console.error('Failed to add promo code, response:', errorText);
                throw new Error(`Add failed: ${errorText}`);
            }
        } catch (error) {
            console.error('Failed to add promo code, error:', error);
            throw error;
        }
    };
    const deletePromoCode = async (id) => {
        try {
            const res = await fetch('/api/promo-codes', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            if (res.ok) {
                const updatedPromoCodes = await res.json();
                setPromoCodes(updatedPromoCodes);
            } else {
                const errorText = await res.text();
                console.error('Failed to delete promo code, response:', errorText);
                throw new Error(`Delete failed: ${errorText}`);
            }
        } catch (error) {
            console.error('Failed to delete promo code, error:', error);
            throw error;
        }
    };

    // Helper to calculate product dynamic price
    const calculateProductPrice = (product) => {
        // Logic for auto-calc can go here if we want dynamic rules, 
        // but for now we rely on explicit promoPrice set by admin.
        return product.promoPrice || product.price;
    };

    // Helper to calculate total price including options modifiers
    const calculateItemTotal = (item) => {
        let base = item.promoPrice || item.price;
        // Add option modifiers
        if (item.options && Array.isArray(item.options)) {
            item.options.forEach(opt => {
                // If option has a priceModifier
                if (opt.priceModifier) base += parseFloat(opt.priceModifier);
            });
        }
        // If options structure changes to { name: "Size", value: "XL", modifier: 5 }, handle it
        // For Phase 5 we will standardize cart items to hold the specific selected variant's modifier
        return base;
    };

    // Cart
    const addToCart = (product, selectedOptions = [], quantity = 1) => {
        // selectedOptions should be array of { name, value, priceModifier, type }
        setCart(prev => {
            // Check if same product with same options exists
            const existing = prev.find(item =>
                item.productId === product.id &&
                JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
            );

            // Calculate unit price at time of add (Base + Modifiers)
            let unitPrice = product.promoPrice || product.price;
            selectedOptions.forEach(opt => {
                if (opt.priceModifier) unitPrice += parseFloat(opt.priceModifier);
            });

            if (existing) {
                return prev.map(item =>
                    (item.productId === product.id && JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions))
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, {
                productId: product.id,
                name: product.name,
                price: unitPrice, // Persist the calculated price
                basePrice: product.price,
                image: product.image,
                selectedOptions,
                quantity
            }];
        });
    };

    const removeFromCart = (index) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const clearCart = () => setCart([]);

    const getCartTotal = () => cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Orders
    // Phase 3: Added verification that payment was successful (status checking)
    const placeOrder = async (shippingDetails, paymentDetails, totalOverride = null) => {
        if (!currentUser) return false;

        const newOrder = {
            userId: currentUser.id,
            customerName: currentUser.name,
            email: currentUser.email,
            items: [...cart],
            total: totalOverride !== null ? totalOverride : getCartTotal(),
            status: 'Réception',
            checklist: [
                { id: 1, label: 'Brief client reçu', completed: false },
                { id: 2, label: 'Concept design validé', completed: false },
                { id: 3, label: 'Production / Création', completed: false },
                { id: 4, label: 'Envoi finalisé', completed: false }
            ],
            date: new Date().toISOString(),
            shipping: shippingDetails,
            paymentId: paymentDetails ? paymentDetails.id : 'MANUAL_TEST',
            notes: ''
        };

        try {
            const orderData = {
                ...newOrder,
                user_id: newOrder.userId,
                customer_name: newOrder.customerName,
                payment_id: newOrder.paymentId
            };
            // Keep original camelCase keys if DB is lax, but ensure snake_case are present
            // Or remove camelCase if DB is strict? Let's send both or just strict depending on DB.
            // Assuming strict snake_case is safer for Supabase if columns are snake_case.
            delete orderData.userId;
            delete orderData.customerName;
            delete orderData.paymentId;

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                const updatedOrders = await res.json();
                // Normalize response
                const normalizedOrders = updatedOrders.map(o => ({
                    ...o,
                    customerName: o.customer_name || o.customerName,
                    userId: o.user_id || o.userId,
                    paymentId: o.payment_id || o.paymentId
                }));
                setOrders(normalizedOrders);
                const createdOrder = updatedOrders[0];

                // Increment Promo Usage if applicable
                if (activePromo) {
                    const updatedPromos = promoCodes.map(p =>
                        p.code === activePromo.code ? { ...p, uses: (p.uses || 0) + 1 } : p
                    );
                    setPromoCodes(updatedPromos);

                    // Sync to DB
                    const targetPromo = updatedPromos.find(p => p.code === activePromo.code);
                    if (targetPromo) {
                        try {
                            fetch('/api/promo-codes', {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: targetPromo.id, uses: targetPromo.uses })
                            }).catch(err => console.error("Sync Promo Error:", err));
                        } catch (e) { }
                    }
                }

                clearCart();
                setActivePromo(null);
                addNotification('order', `Nouvelle commande de ${currentUser.name} (${newOrder.total}€)`);
                sendOrderConfirmation(createdOrder || newOrder);
                return createdOrder || newOrder;
            } else {
                throw new Error('Erreur lors de la commande sur le serveur');
            }
        } catch (error) {
            console.error('Order error:', error);
            // Fallback to local
            const localOrder = { ...newOrder, id: Date.now().toString() };
            setOrders([localOrder, ...orders]);
            if (activePromo) {
                const updatedPromos = promoCodes.map(p =>
                    p.code === activePromo.code ? { ...p, uses: (p.uses || 0) + 1 } : p
                );
                setPromoCodes(updatedPromos);
            }
            clearCart();
            setActivePromo(null);
            addNotification('order', `Nouvelle commande de ${currentUser.name} (${newOrder.total}€)`);
            sendOrderConfirmation(localOrder);
            return localOrder;
        }
    };

    const deleteUser = async (userId) => {
        try {
            const res = await fetch('/api/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId })
            });

            if (res.ok) {
                const updatedUsers = await res.json();
                setUsers(updatedUsers);
                return { success: true };
            } else {
                throw new Error('Erreur lors de la suppression de l\'utilisateur');
            }
        } catch (error) {
            console.error('Delete user error:', error);
            setUsers(prev => prev.filter(u => u.id !== userId));
            return { success: true, message: 'Utilisateur supprimé localement.' };
        }
    };

    const sendOrderConfirmation = async (order) => {
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
        // Prioritize specific order template, fallback to general template
        const templateId = import.meta.env.VITE_EMAILJS_ORDER_TEMPLATE_ID || 'template_ez20ag4';
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

        const itemsSummary = order.items.map(i => `${i.name} x${i.quantity}`).join(', ');

        if (!serviceId || serviceId === 'YOUR_SERVICE_ID' || serviceId.includes('YOUR')) {
            console.warn("EmailJS configuration missing.");
            return;
        }

        const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const discountFactor = order.total < subtotal ? (order.total / subtotal) : 1;

        const templateParams = {
            order_id: String(order.id).slice(-6),
            name: String(order.customerName),
            email: String(order.email),
            to_email: String(order.email),
            cost: {
                total: String(order.total),
                subtotal: String(subtotal.toFixed(2)),
                discount: String((subtotal - order.total).toFixed(2))
            },
            ordres: order.items.map(item => ({
                nom: item.name,
                units: item.quantity,
                // If a discount was applied, show the price the client actually paid for that item
                price: (item.price * discountFactor).toFixed(2),
                original_price: item.price,
                image_url: item.image
            })),
            is_discounted: order.total < subtotal,
            // Keeping legacy fields for safety
            title: `Confirmation de commande #${String(order.id).slice(-6)}`,
            order_total: String(order.total)
        };

        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId,
                    templateId,
                    templateParams,
                    publicKey
                })
            });

            if (response.ok) {
                console.log('Order confirmation email sent successfully via Serverless function.');
            } else {
                const error = await response.json();
                console.error('Failed to send order confirmation:', error.error);
            }
        } catch (err) {
            console.error('Error triggering order confirmation email:', err);
        }
    };

    const syncOrder = async (orderId, updatedFields) => {
        try {
            const order = orders.find(o => o.id === orderId);
            if (!order) return;
            const updatedOrder = { ...order, ...updatedFields };

            const res = await fetch('/api/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: orderId, ...updatedFields })
            });

            if (res.ok) {
                const refreshedOrders = await res.json();
                setOrders(refreshedOrders);
            } else {
                // local fallback if API fails
                setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
            }
        } catch (error) {
            console.error('Order sync error:', error);
            setOrders(orders.map(o => o.id === orderId ? { ...o, ...updatedFields } : o));
        }
    };

    const updateOrderStatus = (orderId, status) => {
        syncOrder(orderId, { status });
    };

    const toggleChecklistItem = (orderId, itemId) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;
        const newChecklist = order.checklist.map(item =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        syncOrder(orderId, { checklist: newChecklist });
    };

    const updateOrderNotes = (orderId, notes) => {
        syncOrder(orderId, { notes });
    };

    const secureFullReset = (password) => {
        if (password === 'admin123') {
            // Selective Wipe
            setOrders([]);
            setNotifications([]); // Clear notifications on reset
            setUsers(users.filter(u => u.role === 'admin')); // Keep only admins
            // We usually keep products and promoCodes as they are hard to rebuild
            alert("Données réinitialisées (Commandes et clients supprimés).");
            return true;
        }
        return false;
    };

    // --- WISHLIST ACTIONS ---
    const [wishlist, setWishlist] = useState(() => {
        const saved = localStorage.getItem('portfolio_wishlist');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('portfolio_wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const toggleWishlist = (productId) => {
        setWishlist(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId);
            }
            return [...prev, productId];
        });
    };

    const isInWishlist = (productId) => wishlist.includes(productId);

    // --- REVIEWS ACTIONS ---
    const [reviews, setReviews] = useState(() => {
        const saved = localStorage.getItem('portfolio_reviews');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('portfolio_reviews', JSON.stringify(reviews));
    }, [reviews]);

    const addReview = (productId, review) => {
        // review: { user: string, rating: number, comment: string, date: string }
        setReviews(prev => {
            const productReviews = prev[productId] || [];
            return {
                ...prev,
                [productId]: [review, ...productReviews]
            };
        });
    };

    const getProductReviews = (productId) => reviews[productId] || [];

    const getProductRating = (productId) => {
        const productReviews = reviews[productId] || [];
        if (productReviews.length === 0) return 0;
        const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
        return sum / productReviews.length;
    };

    const deleteReview = (productId, reviewIndex) => {
        setReviews(prev => {
            const productReviews = [...(prev[productId] || [])];
            productReviews.splice(reviewIndex, 1);
            return {
                ...prev,
                [productId]: productReviews
            };
        });
    };

    const hasPurchasedProduct = (productId) => {
        if (!currentUser) return false;
        // Check if any order of the current user contains this product
        return orders.some(order =>
            (order.userEmail === currentUser.email || (order.billingDetails && order.billingDetails.email === currentUser.email)) &&
            order.items.some(item => item.id === productId)
        );
    };

    // --- ANNOUNCEMENT & NOTIFICATIONS ACTIONS ---
    const updateAnnouncement = async (config) => {
        try {
            // Update in Supabase if user is authenticated
            if (supabase && currentUser) {
                let error;
                
                if (announcement && announcement.id) {
                    // Update existing
                    const result = await supabase
                        .from('portfolio_announcements')
                        .update({
                            ...config,
                            text: config.text || announcement.text,
                            updated_by: currentUser.id,
                            updated_at: new Date().toISOString()
                        })
                        .eq('id', announcement.id);
                    
                    error = result.error;
                } else {
                    // Create new if doesn't exist
                    const result = await supabase
                        .from('portfolio_announcements')
                        .insert([{
                            text: config.text || 'Annonce',
                            subtext: config.subtext || '',
                            bg_color: config.bgColor || '#d4af37',
                            text_color: config.textColor || '#000000',
                            is_active: config.isActive !== undefined ? config.isActive : true,
                            link: config.link || '',
                            show_timer: config.showTimer || false,
                            timer_end: config.timerEnd || null,
                            font_weight: config.fontWeight || '700',
                            font_style: config.fontStyle || 'normal',
                            height: config.height || '56px',
                            created_by: currentUser.id,
                            updated_by: currentUser.id
                        }])
                        .select();
                    
                    error = result.error;
                    if (!error && result.data && result.data.length > 0) {
                        setAnnouncement(result.data[0]);
                    }
                }

                if (error) {
                    console.error('Error updating announcement:', error);
                    addNotification('error', 'Erreur: impossible de sauvegarder l\'annonce');
                    return;
                }

                // Log activity
                await logActivity('UPDATE', 'announcement_banner', announcement?.id || 'new', config);

                // Update local state
                setAnnouncement(prev => prev ? { ...prev, ...config } : prev);
                addNotification('success', 'Annonce mise à jour avec succès');
            } else {
                // Fallback: just update local state if not authenticated
                setAnnouncement(prev => prev ? { ...prev, ...config } : prev);
            }
        } catch (error) {
            console.error('Failed to update announcement:', error);
            addNotification('error', 'Erreur: impossible de sauvegarder l\'annonce');
        }
    };

    const updateSettings = async (newSettings) => {
        try {
            // Update in Supabase if authenticated
            if (supabase && currentUser) {
                // First try to update
                const { error: updateError, data: updateData } = await supabase
                    .from('portfolio_settings')
                    .update({
                        maintenance_mode: newSettings.maintenanceMode !== undefined ? newSettings.maintenanceMode : settings.maintenanceMode,
                        site_title: newSettings.siteTitle !== undefined ? newSettings.siteTitle : settings.siteTitle,
                        contact_email: newSettings.contactEmail !== undefined ? newSettings.contactEmail : settings.contactEmail,
                        support_phone: newSettings.supportPhone !== undefined ? newSettings.supportPhone : settings.supportPhone,
                        socials: newSettings.socials || settings.socials,
                        updated_by: currentUser.id,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', 1);

                // If update failed (no row exists), try to insert
                if (updateError && updateError.message?.includes('No rows')) {
                    const { error: insertError } = await supabase
                        .from('portfolio_settings')
                        .insert([{
                            id: 1,
                            maintenance_mode: newSettings.maintenanceMode !== undefined ? newSettings.maintenanceMode : settings.maintenanceMode,
                            site_title: newSettings.siteTitle !== undefined ? newSettings.siteTitle : settings.siteTitle,
                            contact_email: newSettings.contactEmail !== undefined ? newSettings.contactEmail : settings.contactEmail,
                            support_phone: newSettings.supportPhone !== undefined ? newSettings.supportPhone : settings.supportPhone,
                            socials: newSettings.socials || settings.socials,
                            updated_by: currentUser.id
                        }]);

                    if (insertError) {
                        console.error('Error creating settings:', insertError);
                        addNotification('error', 'Erreur: impossible de sauvegarder les paramètres');
                        return;
                    }
                } else if (updateError) {
                    console.error('Error updating settings:', updateError);
                    addNotification('error', 'Erreur: impossible de sauvegarder les paramètres');
                    return;
                }

                // Log activity
                await logActivity('UPDATE', 'site_settings', 1, newSettings);

                // Update local state
                setSettings(prev => ({ ...prev, ...newSettings }));
                addNotification('success', 'Paramètres mis à jour avec succès');
            } else {
                // Fallback: just update local state
                setSettings(prev => ({ ...prev, ...newSettings }));
            }
        } catch (error) {
            console.error('Failed to update settings:', error);
            addNotification('error', 'Erreur: impossible de sauvegarder les paramètres');
        }
    };

    const logActivity = async (action, resourceType, resourceId, details = {}) => {
        if (!supabase || !currentUser) return;

        try {
            await supabase.from('portfolio_activity_logs').insert([{
                user_id: currentUser.id,
                action,
                resource_type: resourceType,
                resource_id: resourceId,
                details,
                ip_address: 'client',
                user_agent: navigator.userAgent
            }]);
        } catch (error) {
            console.error('Failed to log activity:', error);
        }
    };

    const addNotification = (type, message) => {
        const newNotif = {
            id: Date.now().toString(),
            type, // 'order', 'account', 'contact'
            message,
            date: new Date().toISOString(),
            isRead: false
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    const markNotificationAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const markAllNotificationsAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };


    return (
        <DataContext.Provider value={{
            // Data
            projects, products,
            addProject, deleteProject, updateProject,
            addProduct, deleteProduct, updateProduct,

            // Auth
            users, currentUser, register, login, logout, deleteUser, checkPermission, loginHistory,

            // Cart
            cart, addToCart, removeFromCart, clearCart, getCartTotal,

            // Orders
            orders, placeOrder, updateOrderStatus, toggleChecklistItem, updateOrderNotes,
            sendOrderConfirmation,

            // Promo Codes
            promoCodes, addPromoCode, deletePromoCode, applyPromoCode, activePromo,

            // Announcement
            announcement, updateAnnouncement,

            // Notifications
            notifications, addNotification, markNotificationAsRead, deleteNotification, markAllNotificationsAsRead,

            // Home Content
            homeContent, setHomeContent,

            // Settings
            settings, updateSettings, logActivity,

            // Wishlist
            wishlist, toggleWishlist, isInWishlist,

            // Reviews
            reviews, addReview, getProductReviews, getProductRating, deleteReview, hasPurchasedProduct,

            // Admin Actions
            secureFullReset,

            // Toasts
            showToast
        }}>
            {children}
            <div style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end'
            }}>
                {toasts.map(t => (
                    <Toast key={t.id} {...t} onClose={removeToast} />
                ))}
            </div>
        </DataContext.Provider>
    );
};

export default DataContext;

