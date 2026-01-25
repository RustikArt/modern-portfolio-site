-- ============================================================
-- SUPABASE - MISE À JOUR DES COLONNES
-- Pour: Portfolio Rustikop
-- Date: Janvier 2026
-- 
-- INSTRUCTIONS:
-- 1. Allez sur votre projet Supabase
-- 2. Ouvrez SQL Editor
-- 3. Copiez-collez ce script entier
-- 4. Cliquez sur "Run"
--
-- Ce script ajoute les nouvelles colonnes nécessaires aux
-- fonctionnalités récentes (écran de chargement, navbar, etc.)
-- ============================================================

-- ============================================================
-- TABLE portfolio_settings - Nouvelles colonnes
-- ============================================================

-- Ajouter la colonne show_loading_screen si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'portfolio_settings' 
        AND column_name = 'show_loading_screen'
    ) THEN
        ALTER TABLE public.portfolio_settings 
        ADD COLUMN show_loading_screen BOOLEAN DEFAULT TRUE;
        RAISE NOTICE '✅ Colonne show_loading_screen ajoutée';
    ELSE
        RAISE NOTICE '⏭️ Colonne show_loading_screen existe déjà';
    END IF;
END $$;

-- Ajouter la colonne show_admin_loading si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'portfolio_settings' 
        AND column_name = 'show_admin_loading'
    ) THEN
        ALTER TABLE public.portfolio_settings 
        ADD COLUMN show_admin_loading BOOLEAN DEFAULT TRUE;
        RAISE NOTICE '✅ Colonne show_admin_loading ajoutée';
    ELSE
        RAISE NOTICE '⏭️ Colonne show_admin_loading existe déjà';
    END IF;
END $$;

-- Ajouter la colonne navbar_padding si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'portfolio_settings' 
        AND column_name = 'navbar_padding'
    ) THEN
        ALTER TABLE public.portfolio_settings 
        ADD COLUMN navbar_padding VARCHAR(20) DEFAULT 'normal';
        RAISE NOTICE '✅ Colonne navbar_padding ajoutée';
    ELSE
        RAISE NOTICE '⏭️ Colonne navbar_padding existe déjà';
    END IF;
END $$;

-- ============================================================
-- Mettre à jour les valeurs par défaut dans les enregistrements existants
-- ============================================================

UPDATE public.portfolio_settings
SET 
    show_loading_screen = COALESCE(show_loading_screen, TRUE),
    show_admin_loading = COALESCE(show_admin_loading, TRUE),
    navbar_padding = COALESCE(navbar_padding, 'normal')
WHERE show_loading_screen IS NULL 
   OR show_admin_loading IS NULL 
   OR navbar_padding IS NULL;

-- ============================================================
-- VÉRIFICATION FINALE
-- ============================================================

DO $$
DECLARE
    col_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO col_count 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'portfolio_settings'
    AND column_name IN ('show_loading_screen', 'show_admin_loading', 'navbar_padding');
    
    IF col_count = 3 THEN
        RAISE NOTICE '✅ Toutes les nouvelles colonnes sont présentes (3/3)';
    ELSE
        RAISE NOTICE '⚠️ Certaines colonnes sont manquantes (%/3)', col_count;
    END IF;
END $$;

-- Afficher la structure actuelle de la table portfolio_settings
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'portfolio_settings'
ORDER BY ordinal_position;
