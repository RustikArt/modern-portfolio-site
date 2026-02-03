-- ============================================================
-- UPDATE 7.6 - RUSTIKOP PORTFOLIO
-- Exécuter dans Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. Ajouter la colonne instructions aux commandes
-- Permet à l'admin de définir des instructions personnalisées par commande
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_orders' 
                   AND column_name = 'instructions') THEN
        ALTER TABLE public.portfolio_orders 
        ADD COLUMN instructions TEXT;
        
        RAISE NOTICE 'Colonne instructions ajoutée aux commandes';
    ELSE
        RAISE NOTICE 'Colonne instructions existe déjà';
    END IF;
END $$;

-- ============================================================
-- 2. Ajouter status_instructions aux paramètres (valeurs par défaut)
-- Utilisé comme fallback quand une commande n'a pas d'instructions personnalisées
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_settings' 
                   AND column_name = 'status_instructions') THEN
        ALTER TABLE public.portfolio_settings 
        ADD COLUMN status_instructions JSONB DEFAULT '{
            "Réception": "Votre commande a bien été reçue et le paiement confirmé. Nous allons prendre contact avec vous sous 24-48h pour discuter des détails.",
            "En cours": "Votre projet est en cours de réalisation. Vous recevrez des mises à jour régulières sur l''avancement.",
            "Terminé": "Votre commande est terminée ! Les fichiers/livrables ont été envoyés. Merci de votre confiance.",
            "En attente": "Nous avons besoin d''informations complémentaires pour continuer. Veuillez consulter vos emails ou nous contacter."
        }'::jsonb;
        
        RAISE NOTICE 'Colonne status_instructions ajoutée aux paramètres';
    ELSE
        RAISE NOTICE 'Colonne status_instructions existe déjà';
    END IF;
END $$;

-- ============================================================
-- 3. Initialiser les instructions par défaut pour les paramètres existants
-- ============================================================
UPDATE public.portfolio_settings
SET status_instructions = '{
    "Réception": "Votre commande a bien été reçue et le paiement confirmé. Nous allons prendre contact avec vous sous 24-48h pour discuter des détails.",
    "En cours": "Votre projet est en cours de réalisation. Vous recevrez des mises à jour régulières sur l''avancement.",
    "Terminé": "Votre commande est terminée ! Les fichiers/livrables ont été envoyés. Merci de votre confiance.",
    "En attente": "Nous avons besoin d''informations complémentaires pour continuer. Veuillez consulter vos emails ou nous contacter."
}'::jsonb
WHERE status_instructions IS NULL;

-- ============================================================
-- 4. Créer un index pour améliorer les performances
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_orders_status 
ON public.portfolio_orders(status);

-- ============================================================
-- VÉRIFICATION
-- ============================================================
SELECT 
    'portfolio_orders' as table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'portfolio_orders' 
AND column_name = 'instructions';

SELECT 
    'portfolio_settings' as table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'portfolio_settings' 
AND column_name = 'status_instructions';

-- Afficher les instructions par défaut
SELECT status_instructions FROM public.portfolio_settings LIMIT 1;
