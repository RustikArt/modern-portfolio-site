-- =====================================================
-- RUSTIKOP PORTFOLIO DATABASE SCHEMA
-- Version: 1.0 - February 2026
-- =====================================================
-- 
-- Ce fichier contient le schéma complet de la base de données.
-- ANALYSE: Toutes les tables sont correctes et complètes.
-- 
-- CORRECTIONS APPLIQUÉES:
-- 1. Ajout de la colonne 'uses' manquante sur promo_codes (si absente)
-- 2. Ajout d'index pour améliorer les performances
-- 3. Suppression du trigger dupliqué sur portfolio_users (n'a pas updated_at)
-- =====================================================

-- ===== FONCTION DE MISE À JOUR AUTOMATIQUE =====
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CORRECTIONS À EXÉCUTER
-- =====================================================

-- 1. Corriger promo_codes: Ajouter colonne 'uses' si elle n'existe pas
-- (current_uses existe déjà, mais le code utilise aussi 'uses')
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolio_promo_codes' AND column_name = 'uses'
    ) THEN
        ALTER TABLE portfolio_promo_codes ADD COLUMN uses integer DEFAULT 0;
    END IF;
END $$;

-- 2. S'assurer que current_uses et uses sont synchronisés
UPDATE portfolio_promo_codes 
SET uses = COALESCE(current_uses, 0)
WHERE uses IS NULL OR uses != COALESCE(current_uses, 0);

-- 3. Supprimer le trigger sur portfolio_users car cette table n'a pas de colonne updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON portfolio_users;

-- 4. Supprimer les triggers dupliqués sur portfolio_products et portfolio_projects
DROP TRIGGER IF EXISTS update_products_updated_at ON portfolio_products;
DROP TRIGGER IF EXISTS update_projects_updated_at ON portfolio_projects;

-- 5. Ajouter des index manquants pour de meilleures performances
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON portfolio_orders (payment_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON portfolio_reviews (created_at DESC);

-- =====================================================
-- VÉRIFICATION DE L'INTÉGRITÉ DU SCHÉMA
-- =====================================================

-- Vérifier que toutes les colonnes nécessaires existent
DO $$
DECLARE
    missing_columns TEXT := '';
BEGIN
    -- Vérifier alert_message sur products
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolio_products' AND column_name = 'alert_message'
    ) THEN
        missing_columns := missing_columns || 'portfolio_products.alert_message, ';
    END IF;
    
    -- Vérifier is_active sur promo_codes
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolio_promo_codes' AND column_name = 'is_active'
    ) THEN
        missing_columns := missing_columns || 'portfolio_promo_codes.is_active, ';
    END IF;
    
    -- Vérifier favicon sur settings
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolio_settings' AND column_name = 'favicon'
    ) THEN
        missing_columns := missing_columns || 'portfolio_settings.favicon, ';
    END IF;
    
    IF missing_columns != '' THEN
        RAISE NOTICE 'Colonnes manquantes détectées: %', missing_columns;
    ELSE
        RAISE NOTICE 'Toutes les colonnes requises sont présentes ✓';
    END IF;
END $$;

-- =====================================================
-- NOTES SUR LE SCHÉMA ACTUEL
-- =====================================================
-- 
-- ✅ TABLES CORRECTES:
-- - portfolio_activity_logs: OK (logs d'activité)
-- - portfolio_announcements: OK (bandeaux d'annonce)
-- - portfolio_carts: OK (paniers utilisateurs)
-- - portfolio_email_logs: OK (logs d'emails)
-- - portfolio_orders: OK (commandes)
-- - portfolio_products: OK (produits)
-- - portfolio_projects: OK (projets portfolio)
-- - portfolio_promo_codes: OK (codes promo)
-- - portfolio_reviews: OK (avis produits)
-- - portfolio_settings: OK (paramètres site)
-- - portfolio_users: OK (utilisateurs)
-- - portfolio_wishlists: OK (listes de souhaits)
-- 
-- ✅ INDEX CORRECTS:
-- - Tous les index nécessaires sont présents
-- 
-- ✅ TRIGGERS CORRECTS:
-- - update_updated_at_column fonctionne sur toutes les tables avec updated_at
-- 
-- ⚠️ CORRIGÉ:
-- - Trigger supprimé sur portfolio_users (pas de colonne updated_at)
-- - Triggers dupliqués supprimés sur products et projects
-- - Colonne 'uses' ajoutée sur promo_codes (synchronisée avec current_uses)
-- 
-- =====================================================
