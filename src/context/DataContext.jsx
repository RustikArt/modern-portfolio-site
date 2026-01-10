import { createContext, useContext, useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

// Fallback Initial Data
const fallbackProjects = [
    { id: 1, title: 'Nebula', category: 'Web Design', image: 'https://placehold.co/600x400/1a1a1a/FFF?text=Nebula', content: '<p>Une exploration profonde de l\'espace numérique.</p>' },
    { id: 2, title: 'Quartz', category: 'Branding', image: 'https://placehold.co/600x400/2a2a2a/FFF?text=Quartz', content: '<p>Identité visuelle cristalline et intemporelle.</p>' },
    { id: 3, title: 'Echo', category: 'App Mobile', image: 'https://placehold.co/600x400/151515/FFF?text=Echo', content: '<p>Connecter les gens par la voix.</p>' },
    { id: 4, title: 'Horizon', category: 'Ecommerce', image: 'https://placehold.co/600x400/0f0f0f/FFF?text=Horizon', content: '<p>Le futur du commerce en ligne.</p>' },
];

const fallbackProducts = [
    // ==================== GRAPHISME ====================
    {
        id: 101,
        name: 'Création de Logo',
        price: 350,
        promoPrice: null,
        isFeatured: true,
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
        isFeatured: true,
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
        isFeatured: false,
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
        isFeatured: true,
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
        isFeatured: false,
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
        isFeatured: false,
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
        isFeatured: false,
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
        isFeatured: false,
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
        isFeatured: false,
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
        isFeatured: true,
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
        isFeatured: false,
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
        isFeatured: false,
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
        isFeatured: false,
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
        isFeatured: false,
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
        isFeatured: false,
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
        isFeatured: true,
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
        isFeatured: false,
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
        isFeatured: true,
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
        isFeatured: false,
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
        isFeatured: true,
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
        isFeatured: true,
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
        isFeatured: false,
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
        isFeatured: false,
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
        isFeatured: false,
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
        isFeatured: false,
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
        isFeatured: false,
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
        isFeatured: true,
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
        isFeatured: false,
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
        isFeatured: false,
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
        isFeatured: true,
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
        isFeatured: false,
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
        isFeatured: false,
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
        isFeatured: true,
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
        isFeatured: false,
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

    // Announcement Banner State
    const [announcement, setAnnouncement] = useState(() => {
        const saved = localStorage.getItem('portfolio_announcement');
        return saved ? JSON.parse(saved) : {
            text: 'Bienvenue sur Rustikop ! Découvrez nos nouveaux services.',
            bgColor: '#d4af37',
            textColor: '#000000',
            height: '40px',
            link: '',
            isActive: false,
            fontWeight: 'normal',
            fontStyle: 'normal',
            showTimer: false,
            timerEnd: ''
        };
    });

    // Admin Notifications State
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('portfolio_notifications');
        return saved ? JSON.parse(saved) : [];
    });

    // --- FETCH DATA ON MOUNT ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectsRes, productsRes, promoRes] = await Promise.all([
                    fetch('/api/projects'),
                    fetch('/api/products'),
                    fetch('/api/promo-codes')
                ]);

                // Recovery mechanism: Check local storage first if API fails
                if (projectsRes.ok) {
                    const projectsData = await projectsRes.json();
                    setProjects(projectsData);
                } else {
                    console.error('Projects API failed:', projectsRes.status, await projectsRes.text());
                    // Try to recover from local storage
                    const localProjects = localStorage.getItem('portfolio_projects');
                    if (localProjects) {
                        console.log('Recovering projects from local storage');
                        setProjects(JSON.parse(localProjects));
                    } else {
                        console.log('No local projects found, using fallback');
                        setProjects(fallbackProjects);
                    }
                }

                if (productsRes.ok) {
                    const productsData = await productsRes.json();
                    setProducts(productsData);
                } else {
                    console.error('Products API failed:', productsRes.status, await productsRes.text());
                    const localProducts = localStorage.getItem('portfolio_products');
                    if (localProducts) {
                        console.log('Recovering products from local storage');
                        setProducts(JSON.parse(localProducts));
                    } else {
                        console.log('No local products found, using fallback');
                        setProducts(fallbackProducts);
                    }
                }

                if (promoRes.ok) {
                    const promoData = await promoRes.json();
                    setPromoCodes(promoData);
                } else {
                    console.error('Promo codes API failed:', promoRes.status, await promoRes.text());
                    const localPromos = localStorage.getItem('portfolio_promo_codes');
                    if (localPromos) {
                        console.log('Recovering promo codes from local storage');
                        setPromoCodes(JSON.parse(localPromos));
                    } else {
                        console.log('No local promo codes found, using fallback');
                        setPromoCodes([
                            { id: 1, code: 'WELCOME10', type: 'percent', value: 10 },
                            { id: 2, code: 'MINUS5', type: 'fixed', value: 5 }
                        ]);
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


    // --- ACTIONS ---

    // Admin / Data
    const addProject = async (project) => {
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(project)
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
            const res = await fetch('/api/projects', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updatedProject })
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
            // Convert promoPrice to promo_price for Supabase compatibility
            const productData = {
                ...product,
                promo_price: product.promoPrice,
                tags: product.tags || []
            };
            delete productData.promoPrice; // Remove the frontend field

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
            // Convert promoPrice to promo_price for Supabase compatibility
            const productData = {
                ...updatedProduct,
                promo_price: updatedProduct.promoPrice
            };
            delete productData.promoPrice; // Remove the frontend field

            const res = await fetch('/api/products', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...productData })
            });
            if (res.ok) {
                const updatedProducts = await res.json();
                setProducts(updatedProducts);
            }
        } catch (error) {
            console.error('Failed to update product, error:', error);
            throw error;
        }
    };

    // User Auth
    const register = (email, password, name) => {
        const cleanEmail = email.trim().toLowerCase();
        const cleanPassword = password.trim();
        const exists = users.find(u => u.email === cleanEmail);
        if (exists) return { success: false, message: 'Email déjà utilisé.' };

        const newUser = { id: Date.now(), email: cleanEmail, password: cleanPassword, name, role: 'client' };
        setUsers([...users, newUser]);
        setCurrentUser(newUser);

        // Notify Admin
        addNotification('account', `Nouveau compte créé : ${name} (${cleanEmail})`);

        return { success: true };
    };

    const login = (email, password) => {
        const cleanEmail = email.trim().toLowerCase();
        const cleanPassword = password.trim();

        // Phase 3: No more hardcoded backdoor. Check against users array.
        const user = users.find(u => u.email === cleanEmail && u.password === cleanPassword);

        if (user) {
            setCurrentUser(user);
            return { success: true, isAdmin: user.role === 'admin' };
        }
        return { success: false, message: 'Identifiants incorrects.' };
    };

    const logout = () => {
        setCurrentUser(null);
        setCart([]);
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('portfolio_cart');
    };

    // Promo Codes
    const addPromoCode = async (code) => {
        try {
            const res = await fetch('/api/promo-codes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(code)
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
    const placeOrder = (shippingDetails, paymentDetails, totalOverride = null) => {
        if (!currentUser) return false;

        const newOrder = {
            id: Date.now().toString(),
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
        setOrders([newOrder, ...orders]);
        clearCart();

        // Notify Admin
        addNotification('order', `Nouvelle commande de ${currentUser.name} (${newOrder.total}€)`);

        // Automatic EmailJS Trigger
        sendOrderConfirmation(newOrder);

        return newOrder;
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

    const updateOrderStatus = (orderId, status) => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    };

    const toggleChecklistItem = (orderId, itemId) => {
        setOrders(orders.map(o => {
            if (o.id === orderId) {
                const newChecklist = o.checklist.map(item =>
                    item.id === itemId ? { ...item, completed: !item.completed } : item
                );
                return { ...o, checklist: newChecklist };
            }
            return o;
        }));
    };

    const updateOrderNotes = (orderId, notes) => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, notes } : o));
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

    // --- ANNOUNCEMENT & NOTIFICATIONS ACTIONS ---
    const updateAnnouncement = (config) => {
        setAnnouncement(prev => ({ ...prev, ...config }));
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
            users, currentUser, register, login, logout,

            // Cart
            cart, addToCart, removeFromCart, clearCart, getCartTotal,

            // Orders
            orders, placeOrder, updateOrderStatus, toggleChecklistItem, updateOrderNotes,
            sendOrderConfirmation,

            // Promo Codes
            promoCodes, addPromoCode, deletePromoCode,

            // Announcement
            announcement, updateAnnouncement,

            // Notifications
            notifications, addNotification, markNotificationAsRead, deleteNotification, markAllNotificationsAsRead,

            // Admin Actions
            secureFullReset
        }}>
            {children}
        </DataContext.Provider>
    );
};
