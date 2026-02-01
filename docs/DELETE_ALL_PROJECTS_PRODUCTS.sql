-- =====================================================
-- RUSTIKOP - SQL COMMANDS TO DELETE ALL PROJECTS AND ARTICLES
-- =====================================================
-- 
-- ATTENTION: Ces commandes suppriment définitivement toutes les données !
-- Assurez-vous d'avoir une sauvegarde avant d'exécuter.
-- 
-- À exécuter dans Supabase SQL Editor ou psql
-- =====================================================

-- ===== SUPPRIMER TOUS LES PROJETS =====
-- Cela supprime tous les projets de la table portfolio_projects
DELETE FROM portfolio_projects;

-- Optionnel: Réinitialiser la séquence d'ID pour recommencer à 1
ALTER SEQUENCE IF EXISTS portfolio_projects_id_seq RESTART WITH 1;

-- ===== SUPPRIMER TOUS LES PRODUITS (ARTICLES) =====
-- Cela supprime tous les produits de la table portfolio_products
-- Note: Les reviews associées seront aussi supprimées si ON DELETE CASCADE est configuré
DELETE FROM portfolio_products;

-- Optionnel: Réinitialiser la séquence d'ID pour recommencer à 1
ALTER SEQUENCE IF EXISTS portfolio_products_id_seq RESTART WITH 1;

-- ===== SUPPRIMER LES REVIEWS ASSOCIÉES (si pas de CASCADE) =====
-- Si les reviews ne sont pas supprimées automatiquement:
DELETE FROM portfolio_reviews;

-- Optionnel: Réinitialiser la séquence d'ID pour recommencer à 1
ALTER SEQUENCE IF EXISTS portfolio_reviews_id_seq RESTART WITH 1;

-- =====================================================
-- VÉRIFICATION
-- =====================================================
-- Exécutez ces requêtes pour vérifier que tout est supprimé:

SELECT COUNT(*) as projects_count FROM portfolio_projects;
SELECT COUNT(*) as products_count FROM portfolio_products;
SELECT COUNT(*) as reviews_count FROM portfolio_reviews;

-- =====================================================
-- COMMANDE COMBINÉE (exécuter tout d'un coup)
-- =====================================================
-- 
-- BEGIN;
--     DELETE FROM portfolio_reviews;
--     DELETE FROM portfolio_products;
--     DELETE FROM portfolio_projects;
--     ALTER SEQUENCE IF EXISTS portfolio_projects_id_seq RESTART WITH 1;
--     ALTER SEQUENCE IF EXISTS portfolio_products_id_seq RESTART WITH 1;
--     ALTER SEQUENCE IF EXISTS portfolio_reviews_id_seq RESTART WITH 1;
-- COMMIT;
