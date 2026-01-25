-- ============================================================
-- SUPABASE - CORRECTION TABLES PARAMÈTRES ET BANDEROLE
-- Pour: Portfolio Rustikop
-- Date: Janvier 2026
-- 
-- Ce script corrige et met à jour les tables portfolio_settings
-- et portfolio_announcements pour que les paramètres s'enregistrent
-- correctement.
--
-- INSTRUCTIONS:
-- 1. Allez sur votre projet Supabase
-- 2. Ouvrez SQL Editor
-- 3. Copiez-collez ce script entier
-- 4. Cliquez sur "Run"
-- ============================================================

-- ============================================================
-- PARTIE 1: Mise à jour de la table portfolio_settings
-- ============================================================

-- Ajouter la colonne show_loading_screen si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolio_settings' 
        AND column_name = 'show_loading_screen'
    ) THEN
        ALTER TABLE public.portfolio_settings 
        ADD COLUMN show_loading_screen BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- S'assurer que toutes les colonnes nécessaires existent
DO $$ 
BEGIN
    -- site_title
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolio_settings' 
        AND column_name = 'site_title'
    ) THEN
        ALTER TABLE public.portfolio_settings 
        ADD COLUMN site_title VARCHAR(255) DEFAULT 'RUSTIKOP';
    END IF;

    -- contact_email
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolio_settings' 
        AND column_name = 'contact_email'
    ) THEN
        ALTER TABLE public.portfolio_settings 
        ADD COLUMN contact_email VARCHAR(255);
    END IF;

    -- support_phone
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolio_settings' 
        AND column_name = 'support_phone'
    ) THEN
        ALTER TABLE public.portfolio_settings 
        ADD COLUMN support_phone VARCHAR(50);
    END IF;

    -- maintenance_mode
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolio_settings' 
        AND column_name = 'maintenance_mode'
    ) THEN
        ALTER TABLE public.portfolio_settings 
        ADD COLUMN maintenance_mode BOOLEAN DEFAULT FALSE;
    END IF;

    -- grain_effect
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolio_settings' 
        AND column_name = 'grain_effect'
    ) THEN
        ALTER TABLE public.portfolio_settings 
        ADD COLUMN grain_effect BOOLEAN DEFAULT TRUE;
    END IF;

    -- socials (JSONB)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolio_settings' 
        AND column_name = 'socials'
    ) THEN
        ALTER TABLE public.portfolio_settings 
        ADD COLUMN socials JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- updated_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolio_settings' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.portfolio_settings 
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- ============================================================
-- PARTIE 2: Mise à jour de la table portfolio_announcements
-- ============================================================

-- S'assurer que toutes les colonnes nécessaires existent
DO $$ 
BEGIN
    -- icon
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolio_announcements' 
        AND column_name = 'icon'
    ) THEN
        ALTER TABLE public.portfolio_announcements 
        ADD COLUMN icon VARCHAR(50) DEFAULT 'Sparkles';
    END IF;

    -- text_align
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolio_announcements' 
        AND column_name = 'text_align'
    ) THEN
        ALTER TABLE public.portfolio_announcements 
        ADD COLUMN text_align VARCHAR(20) DEFAULT 'left';
    END IF;

    -- timer_position
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolio_announcements' 
        AND column_name = 'timer_position'
    ) THEN
        ALTER TABLE public.portfolio_announcements 
        ADD COLUMN timer_position VARCHAR(20) DEFAULT 'right';
    END IF;

    -- height
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolio_announcements' 
        AND column_name = 'height'
    ) THEN
        ALTER TABLE public.portfolio_announcements 
        ADD COLUMN height VARCHAR(20) DEFAULT '56px';
    END IF;

    -- link
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolio_announcements' 
        AND column_name = 'link'
    ) THEN
        ALTER TABLE public.portfolio_announcements 
        ADD COLUMN link TEXT;
    END IF;

    -- show_timer
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolio_announcements' 
        AND column_name = 'show_timer'
    ) THEN
        ALTER TABLE public.portfolio_announcements 
        ADD COLUMN show_timer BOOLEAN DEFAULT FALSE;
    END IF;

    -- timer_end
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolio_announcements' 
        AND column_name = 'timer_end'
    ) THEN
        ALTER TABLE public.portfolio_announcements 
        ADD COLUMN timer_end TIMESTAMPTZ;
    END IF;

    -- font_weight
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolio_announcements' 
        AND column_name = 'font_weight'
    ) THEN
        ALTER TABLE public.portfolio_announcements 
        ADD COLUMN font_weight VARCHAR(20) DEFAULT '700';
    END IF;

    -- font_style
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolio_announcements' 
        AND column_name = 'font_style'
    ) THEN
        ALTER TABLE public.portfolio_announcements 
        ADD COLUMN font_style VARCHAR(20) DEFAULT 'normal';
    END IF;

    -- subtext
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolio_announcements' 
        AND column_name = 'subtext'
    ) THEN
        ALTER TABLE public.portfolio_announcements 
        ADD COLUMN subtext TEXT;
    END IF;
END $$;

-- ============================================================
-- PARTIE 3: Insérer les données par défaut si les tables sont vides
-- ============================================================

-- Insérer les paramètres par défaut si la table est vide
INSERT INTO public.portfolio_settings (
    site_title, 
    contact_email, 
    support_phone, 
    maintenance_mode, 
    grain_effect,
    show_loading_screen,
    socials,
    updated_at
)
SELECT 
    'RUSTIKOP',
    'rustikop@outlook.fr',
    '',
    FALSE,
    TRUE,
    TRUE,
    '{"instagram": "https://www.instagram.com/rustikop.art/", "twitter": "https://x.com/rustikop", "discord": "https://discord.gg/uaKYcrfyN6"}'::jsonb,
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.portfolio_settings LIMIT 1);

-- Insérer une annonce par défaut si la table est vide
INSERT INTO public.portfolio_announcements (
    text,
    subtext,
    bg_color,
    text_color,
    is_active,
    link,
    show_timer,
    timer_end,
    font_weight,
    font_style,
    height,
    icon,
    text_align,
    timer_position,
    created_at,
    updated_at
)
SELECT 
    '🎉 Bienvenue sur Rustikop ! Découvrez nos créations.',
    '',
    '#d4af37',
    '#000000',
    FALSE, -- Désactivé par défaut
    '',
    FALSE,
    NULL,
    '700',
    'normal',
    '56px',
    'Sparkles',
    'left',
    'right',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.portfolio_announcements LIMIT 1);

-- ============================================================
-- PARTIE 4: Politiques RLS (Row Level Security)
-- ============================================================

-- Activer RLS si pas déjà fait
ALTER TABLE public.portfolio_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_announcements ENABLE ROW LEVEL SECURITY;

-- Politique: Permettre lecture publique des paramètres
DROP POLICY IF EXISTS "Public read settings" ON public.portfolio_settings;
CREATE POLICY "Public read settings" ON public.portfolio_settings
    FOR SELECT USING (true);

-- Politique: Permettre mise à jour avec service role
DROP POLICY IF EXISTS "Service role update settings" ON public.portfolio_settings;
CREATE POLICY "Service role update settings" ON public.portfolio_settings
    FOR UPDATE USING (true);

-- Politique: Permettre insertion avec service role
DROP POLICY IF EXISTS "Service role insert settings" ON public.portfolio_settings;
CREATE POLICY "Service role insert settings" ON public.portfolio_settings
    FOR INSERT WITH CHECK (true);

-- Politique: Permettre lecture publique des annonces actives
DROP POLICY IF EXISTS "Public read active announcements" ON public.portfolio_announcements;
CREATE POLICY "Public read active announcements" ON public.portfolio_announcements
    FOR SELECT USING (true);

-- Politique: Permettre mise à jour avec service role
DROP POLICY IF EXISTS "Service role update announcements" ON public.portfolio_announcements;
CREATE POLICY "Service role update announcements" ON public.portfolio_announcements
    FOR UPDATE USING (true);

-- Politique: Permettre insertion avec service role
DROP POLICY IF EXISTS "Service role insert announcements" ON public.portfolio_announcements;
CREATE POLICY "Service role insert announcements" ON public.portfolio_announcements
    FOR INSERT WITH CHECK (true);

-- ============================================================
-- PARTIE 5: Vérification finale
-- ============================================================

-- Afficher la structure actuelle des tables pour vérification
SELECT 
    'portfolio_settings' as table_name,
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'portfolio_settings'
ORDER BY ordinal_position;

SELECT 
    'portfolio_announcements' as table_name,
    column_name,
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'portfolio_announcements'
ORDER BY ordinal_position;

-- Afficher les données actuelles
SELECT '=== PARAMÈTRES ACTUELS ===' as info;
SELECT * FROM public.portfolio_settings;

SELECT '=== ANNONCES ACTUELLES ===' as info;
SELECT * FROM public.portfolio_announcements;

-- ============================================================
-- FIN DU SCRIPT
-- Si tout s'est bien passé, vous devriez voir la structure
-- des tables et les données par défaut insérées.
-- ============================================================
