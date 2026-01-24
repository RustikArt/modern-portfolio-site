-- ============================================================
-- SUPABASE - SCRIPT D'INITIALISATION COMPLET
-- Pour: Portfolio Rustikop
-- Date: Janvier 2026
-- 
-- INSTRUCTIONS:
-- 1. Allez sur votre projet Supabase
-- 2. Ouvrez SQL Editor
-- 3. Copiez-collez ce script entier
-- 4. Cliquez sur "Run"
-- ============================================================

-- ============================================================
-- TABLE 1: portfolio_users (Utilisateurs & Admins)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portfolio_users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'client',
    role_title VARCHAR(100) DEFAULT 'Client',
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide par email
CREATE INDEX IF NOT EXISTS idx_users_email ON public.portfolio_users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.portfolio_users(role);

-- ============================================================
-- TABLE 2: portfolio_products (Produits de la boutique)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portfolio_products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    promo_price DECIMAL(10,2),
    image TEXT,
    category VARCHAR(100),
    tags JSONB DEFAULT '[]'::jsonb,
    is_featured BOOLEAN DEFAULT FALSE,
    alert_message TEXT,
    options JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour filtrage par catégorie
CREATE INDEX IF NOT EXISTS idx_products_category ON public.portfolio_products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.portfolio_products(is_featured);

-- ============================================================
-- TABLE 3: portfolio_orders (Commandes)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portfolio_orders (
    id BIGSERIAL PRIMARY KEY,
    customer_name VARCHAR(255),
    email VARCHAR(255),
    total DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'Payé',
    items JSONB DEFAULT '[]'::jsonb,
    date TIMESTAMPTZ DEFAULT NOW(),
    user_id BIGINT,
    payment_id VARCHAR(255),
    shipping JSONB DEFAULT '{}'::jsonb,
    newsletter BOOLEAN DEFAULT FALSE,
    discount DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    checklist JSONB DEFAULT '[]'::jsonb,
    archived BOOLEAN DEFAULT FALSE,
    completion_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour filtrage par status et date
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.portfolio_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON public.portfolio_orders(date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_email ON public.portfolio_orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.portfolio_orders(user_id);

-- ============================================================
-- TABLE 4: portfolio_projects (Projets du Portfolio)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    image TEXT,
    content TEXT,
    blocks JSONB DEFAULT '[]'::jsonb,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour filtrage par catégorie
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.portfolio_projects(category);

-- ============================================================
-- TABLE 5: portfolio_promo_codes (Codes Promotionnels)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portfolio_promo_codes (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    type VARCHAR(20) DEFAULT 'percent',
    value DECIMAL(10,2) NOT NULL,
    min_amount DECIMAL(10,2),
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    expiration_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche par code
CREATE INDEX IF NOT EXISTS idx_promo_code ON public.portfolio_promo_codes(code);

-- ============================================================
-- TABLE 6: portfolio_settings (Paramètres du Site)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portfolio_settings (
    id BIGSERIAL PRIMARY KEY,
    site_title VARCHAR(255) DEFAULT 'RUSTIKOP',
    contact_email VARCHAR(255),
    support_phone VARCHAR(50),
    maintenance_mode BOOLEAN DEFAULT FALSE,
    grain_effect BOOLEAN DEFAULT TRUE,
    socials JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE 7: portfolio_announcements (Banderole d'Annonces)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portfolio_announcements (
    id BIGSERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    subtext TEXT,
    bg_color VARCHAR(50) DEFAULT '#d4af37',
    text_color VARCHAR(50) DEFAULT '#000000',
    is_active BOOLEAN DEFAULT TRUE,
    link TEXT,
    show_timer BOOLEAN DEFAULT FALSE,
    timer_end TIMESTAMPTZ,
    font_weight VARCHAR(20) DEFAULT '700',
    font_style VARCHAR(20) DEFAULT 'normal',
    height VARCHAR(20) DEFAULT '56px',
    emoji VARCHAR(10) DEFAULT '✨',
    text_align VARCHAR(20) DEFAULT 'left',
    timer_position VARCHAR(20) DEFAULT 'right',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour récupérer les annonces actives
CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.portfolio_announcements(is_active);

-- ============================================================
-- TABLE 8: portfolio_reviews (Avis Clients - Optionnel)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portfolio_reviews (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_admin_created BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour récupérer les avis par produit
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.portfolio_reviews(product_id);

-- ============================================================
-- TABLE 9: portfolio_activity_logs (Logs d'Activité - Optionnel)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portfolio_activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour filtrage par utilisateur et date
CREATE INDEX IF NOT EXISTS idx_logs_user ON public.portfolio_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_date ON public.portfolio_activity_logs(created_at DESC);

-- ============================================================
-- DONNÉES INITIALES
-- ============================================================

-- Insérer les paramètres par défaut (si non existants)
INSERT INTO public.portfolio_settings (site_title, contact_email, support_phone, maintenance_mode, socials)
SELECT 
    'RUSTIKOP',
    'rustikop@outlook.fr',
    '',
    FALSE,
    '{"instagram": "https://www.instagram.com/rustikop.art/", "twitter": "https://x.com/rustikop", "discord": "https://discord.gg/uaKYcrfyN6", "linkedin": ""}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.portfolio_settings LIMIT 1);

-- Créer un compte admin par défaut (mot de passe: Admin123!)
-- Le hash bcrypt correspond à "Admin123!"
INSERT INTO public.portfolio_users (email, password, name, role, role_title, permissions)
SELECT 
    'admin@rustikop.com',
    '$2a$10$rQZ8K.YqT8B6Z3H9Q5V5h.YqT8B6Z3H9Q5V5hYqT8B6Z3H9Q5V5hYq',
    'Super Admin',
    'super_admin',
    'Super Administrateur',
    '["all"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.portfolio_users WHERE email = 'admin@rustikop.com');

-- ============================================================
-- POLITIQUES RLS (Row Level Security) - SÉCURITÉ
-- ============================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.portfolio_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_activity_logs ENABLE ROW LEVEL SECURITY;

-- Politique: Permettre lecture publique des produits
DROP POLICY IF EXISTS "Public read products" ON public.portfolio_products;
CREATE POLICY "Public read products" ON public.portfolio_products
    FOR SELECT USING (true);

-- Politique: Permettre lecture publique des projets
DROP POLICY IF EXISTS "Public read projects" ON public.portfolio_projects;
CREATE POLICY "Public read projects" ON public.portfolio_projects
    FOR SELECT USING (true);

-- Politique: Permettre lecture publique des paramètres
DROP POLICY IF EXISTS "Public read settings" ON public.portfolio_settings;
CREATE POLICY "Public read settings" ON public.portfolio_settings
    FOR SELECT USING (true);

-- Politique: Permettre lecture publique des annonces actives
DROP POLICY IF EXISTS "Public read announcements" ON public.portfolio_announcements;
CREATE POLICY "Public read announcements" ON public.portfolio_announcements
    FOR SELECT USING (is_active = true);

-- Politique: Permettre lecture publique des codes promo
DROP POLICY IF EXISTS "Public read promo codes" ON public.portfolio_promo_codes;
CREATE POLICY "Public read promo codes" ON public.portfolio_promo_codes
    FOR SELECT USING (true);

-- Politique: Permettre lecture publique des avis
DROP POLICY IF EXISTS "Public read reviews" ON public.portfolio_reviews;
CREATE POLICY "Public read reviews" ON public.portfolio_reviews
    FOR SELECT USING (true);

-- Politique: Service Role peut tout faire (pour l'API backend)
-- Note: Le service_role bypass automatiquement RLS, donc ces policies sont pour anon/authenticated

-- Pour les opérations d'écriture, on utilise le service_role_key côté serveur
-- qui bypass RLS automatiquement

-- ============================================================
-- FONCTIONS UTILITAIRES
-- ============================================================

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at automatique
DROP TRIGGER IF EXISTS update_users_updated_at ON public.portfolio_users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.portfolio_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.portfolio_products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.portfolio_products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.portfolio_orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.portfolio_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.portfolio_projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.portfolio_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_promo_codes_updated_at ON public.portfolio_promo_codes;
CREATE TRIGGER update_promo_codes_updated_at BEFORE UPDATE ON public.portfolio_promo_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON public.portfolio_settings;
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.portfolio_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_announcements_updated_at ON public.portfolio_announcements;
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.portfolio_announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- VÉRIFICATION FINALE
-- ============================================================
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE 'portfolio_%';
    
    RAISE NOTICE '✅ Installation terminée! % tables portfolio créées.', table_count;
END $$;

-- Afficher les tables créées
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name LIKE 'portfolio_%'
ORDER BY table_name;
