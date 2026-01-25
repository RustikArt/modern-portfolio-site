-- ============================================================
-- SUPABASE - CORRECTION SETTINGS & ANNOUNCEMENTS
-- Pour: Portfolio Rustikop
-- Date: Janvier 2026
-- 
-- INSTRUCTIONS:
-- 1. Allez sur votre projet Supabase > SQL Editor
-- 2. Copiez-collez ce script entier
-- 3. Cliquez sur "Run"
-- ============================================================

-- ============================================================
-- ÉTAPE 1: Corriger les valeurs NULL en valeurs par défaut
-- ============================================================

-- Corriger portfolio_settings
UPDATE public.portfolio_settings 
SET 
    maintenance_mode = COALESCE(maintenance_mode, false),
    grain_effect = COALESCE(grain_effect, false),
    show_loading_screen = COALESCE(show_loading_screen, true),
    site_title = COALESCE(site_title, 'RUSTIKOP'),
    contact_email = COALESCE(contact_email, 'rustikop@outlook.fr'),
    socials = COALESCE(socials, '{"discord": "", "twitter": "", "linkedin": "", "instagram": ""}'::jsonb)
WHERE id IS NOT NULL;

-- Corriger portfolio_announcements  
UPDATE public.portfolio_announcements 
SET 
    is_active = COALESCE(is_active, true),
    show_timer = COALESCE(show_timer, false),
    bg_color = COALESCE(bg_color, '#d4af37'),
    text_color = COALESCE(text_color, '#000000'),
    font_weight = COALESCE(font_weight, '700'),
    font_style = COALESCE(font_style, 'normal'),
    height = COALESCE(height, '56px'),
    icon = COALESCE(icon, 'Sparkles'),
    text_align = COALESCE(text_align, 'left'),
    timer_position = COALESCE(timer_position, 'right')
WHERE id IS NOT NULL;

-- ============================================================
-- ÉTAPE 2: Vérifier qu'il y a au moins un enregistrement settings
-- ============================================================

-- Insérer un settings par défaut si la table est vide
INSERT INTO public.portfolio_settings (
    site_title, 
    contact_email, 
    maintenance_mode, 
    grain_effect, 
    show_loading_screen,
    socials
)
SELECT 
    'RUSTIKOP',
    'rustikop@outlook.fr',
    false,
    false,
    true,
    '{"discord": "", "twitter": "", "linkedin": "", "instagram": ""}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.portfolio_settings LIMIT 1);

-- ============================================================
-- ÉTAPE 3: Vérifier qu'il y a au moins une annonce (inactive par défaut)
-- ============================================================

INSERT INTO public.portfolio_announcements (
    text,
    subtext,
    is_active,
    show_timer,
    bg_color,
    text_color,
    height,
    icon,
    text_align,
    timer_position
)
SELECT 
    'Bienvenue sur le site !',
    '',
    false,
    false,
    '#d4af37',
    '#000000',
    '56px',
    'Sparkles',
    'left',
    'right'
WHERE NOT EXISTS (SELECT 1 FROM public.portfolio_announcements LIMIT 1);

-- ============================================================
-- ÉTAPE 4: Vérification - Afficher les données actuelles
-- ============================================================

-- Afficher les settings actuels
SELECT 
    id,
    site_title,
    contact_email,
    maintenance_mode,
    grain_effect,
    show_loading_screen,
    socials,
    updated_at
FROM public.portfolio_settings
ORDER BY id DESC
LIMIT 1;

-- Afficher les annonces actuelles
SELECT 
    id,
    text,
    is_active,
    show_timer,
    height,
    icon,
    text_align,
    updated_at
FROM public.portfolio_announcements
ORDER BY updated_at DESC
LIMIT 5;

-- ============================================================
-- FIN DU SCRIPT
-- ============================================================
