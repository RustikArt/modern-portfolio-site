-- ============================================================
-- SUPABASE - SCRIPT DE MISE À JOUR DES COLONNES
-- Pour: Portfolio Rustikop
-- Date: Janvier 2026
-- 
-- INSTRUCTIONS:
-- Ce script ajoute les nouvelles colonnes aux tables existantes.
-- Il est sécurisé et peut être exécuté plusieurs fois sans erreur.
-- ============================================================

-- ============================================================
-- MISE À JOUR DE LA TABLE portfolio_announcements
-- Ajout des colonnes: icon, text_align, timer_position
-- ============================================================

-- Ajouter la colonne icon si elle n'existe pas (nom de l'icône Lucide)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'portfolio_announcements' 
        AND column_name = 'icon'
    ) THEN
        ALTER TABLE public.portfolio_announcements 
        ADD COLUMN icon VARCHAR(50) DEFAULT 'Sparkles';
    END IF;
END $$;

-- Renommer emoji en icon si emoji existe encore
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'portfolio_announcements' 
        AND column_name = 'emoji'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'portfolio_announcements' 
        AND column_name = 'icon'
    ) THEN
        ALTER TABLE public.portfolio_announcements 
        RENAME COLUMN emoji TO icon;
        ALTER TABLE public.portfolio_announcements 
        ALTER COLUMN icon SET DEFAULT 'Sparkles';
    END IF;
END $$;

-- Ajouter la colonne text_align si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'portfolio_announcements' 
        AND column_name = 'text_align'
    ) THEN
        ALTER TABLE public.portfolio_announcements 
        ADD COLUMN text_align VARCHAR(20) DEFAULT 'left';
    END IF;
END $$;

-- Ajouter la colonne timer_position si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'portfolio_announcements' 
        AND column_name = 'timer_position'
    ) THEN
        ALTER TABLE public.portfolio_announcements 
        ADD COLUMN timer_position VARCHAR(20) DEFAULT 'right';
    END IF;
END $$;

-- ============================================================
-- MISE À JOUR DE LA TABLE portfolio_reviews
-- Ajout de la colonne: is_admin_created
-- ============================================================

-- Ajouter la colonne is_admin_created si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'portfolio_reviews' 
        AND column_name = 'is_admin_created'
    ) THEN
        ALTER TABLE public.portfolio_reviews 
        ADD COLUMN is_admin_created BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- ============================================================
-- VÉRIFICATION
-- ============================================================
SELECT 'Colonnes announcements:' as info;
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'portfolio_announcements'
ORDER BY ordinal_position;

SELECT 'Colonnes reviews:' as info;
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'portfolio_reviews'
ORDER BY ordinal_position;
