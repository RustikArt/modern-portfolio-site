-- ============================================================
-- SUPABASE - SCRIPT D'INITIALISATION COMPLET V2
-- Pour: Portfolio Rustikop
-- Date: Janvier 2026
-- Version: 2.0 - Avec tous les nouveaux champs
-- 
-- INSTRUCTIONS:
-- 1. Allez sur votre projet Supabase
-- 2. Ouvrez SQL Editor
-- 3. Copiez-collez ce script entier
-- 4. Cliquez sur "Run"
--
-- NOTE: Ce script est idempotent (peut être exécuté plusieurs fois)
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
    stock INTEGER DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter colonne stock si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_products' AND column_name = 'stock') THEN
        ALTER TABLE public.portfolio_products ADD COLUMN stock INTEGER DEFAULT NULL;
    END IF;
END $$;

-- Ajouter les nouveaux champs produits (V2.1)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_products' AND column_name = 'sku') THEN
        ALTER TABLE public.portfolio_products ADD COLUMN sku VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_products' AND column_name = 'is_digital') THEN
        ALTER TABLE public.portfolio_products ADD COLUMN is_digital BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_products' AND column_name = 'weight') THEN
        ALTER TABLE public.portfolio_products ADD COLUMN weight DECIMAL(10,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_products' AND column_name = 'dimensions') THEN
        ALTER TABLE public.portfolio_products ADD COLUMN dimensions VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_products' AND column_name = 'gallery') THEN
        ALTER TABLE public.portfolio_products ADD COLUMN gallery JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_products' AND column_name = 'is_visible') THEN
        ALTER TABLE public.portfolio_products ADD COLUMN is_visible BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_products' AND column_name = 'available_date') THEN
        ALTER TABLE public.portfolio_products ADD COLUMN available_date TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_products' AND column_name = 'max_per_order') THEN
        ALTER TABLE public.portfolio_products ADD COLUMN max_per_order INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_products' AND column_name = 'related_products') THEN
        ALTER TABLE public.portfolio_products ADD COLUMN related_products JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_products' AND column_name = 'seo_title') THEN
        ALTER TABLE public.portfolio_products ADD COLUMN seo_title VARCHAR(200);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_products' AND column_name = 'seo_description') THEN
        ALTER TABLE public.portfolio_products ADD COLUMN seo_description TEXT;
    END IF;
END $$;

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

-- Ajouter les colonnes si elles n'existent pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_orders' AND column_name = 'checklist') THEN
        ALTER TABLE public.portfolio_orders ADD COLUMN checklist JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_orders' AND column_name = 'archived') THEN
        ALTER TABLE public.portfolio_orders ADD COLUMN archived BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_orders' AND column_name = 'completion_date') THEN
        ALTER TABLE public.portfolio_orders ADD COLUMN completion_date TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_orders' AND column_name = 'notes') THEN
        ALTER TABLE public.portfolio_orders ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Index pour filtrage par status et date
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.portfolio_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_date ON public.portfolio_orders(date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_email ON public.portfolio_orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.portfolio_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_archived ON public.portfolio_orders(archived);

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

-- Ajouter les nouveaux champs projets (V2.1)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_projects' AND column_name = 'description') THEN
        ALTER TABLE public.portfolio_projects ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_projects' AND column_name = 'client') THEN
        ALTER TABLE public.portfolio_projects ADD COLUMN client VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_projects' AND column_name = 'date_completed') THEN
        ALTER TABLE public.portfolio_projects ADD COLUMN date_completed DATE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_projects' AND column_name = 'duration') THEN
        ALTER TABLE public.portfolio_projects ADD COLUMN duration VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_projects' AND column_name = 'technologies') THEN
        ALTER TABLE public.portfolio_projects ADD COLUMN technologies JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_projects' AND column_name = 'is_visible') THEN
        ALTER TABLE public.portfolio_projects ADD COLUMN is_visible BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_projects' AND column_name = 'external_link') THEN
        ALTER TABLE public.portfolio_projects ADD COLUMN external_link TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_projects' AND column_name = 'github_link') THEN
        ALTER TABLE public.portfolio_projects ADD COLUMN github_link TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_projects' AND column_name = 'thumbnail') THEN
        ALTER TABLE public.portfolio_projects ADD COLUMN thumbnail TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_projects' AND column_name = 'gallery') THEN
        ALTER TABLE public.portfolio_projects ADD COLUMN gallery JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_projects' AND column_name = 'testimonial') THEN
        ALTER TABLE public.portfolio_projects ADD COLUMN testimonial TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_projects' AND column_name = 'testimonial_author') THEN
        ALTER TABLE public.portfolio_projects ADD COLUMN testimonial_author VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_projects' AND column_name = 'order_position') THEN
        ALTER TABLE public.portfolio_projects ADD COLUMN order_position INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_projects' AND column_name = 'seo_title') THEN
        ALTER TABLE public.portfolio_projects ADD COLUMN seo_title VARCHAR(200);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_projects' AND column_name = 'seo_description') THEN
        ALTER TABLE public.portfolio_projects ADD COLUMN seo_description TEXT;
    END IF;
END $$;

-- Index pour filtrage par catégorie
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.portfolio_projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_visible ON public.portfolio_projects(is_visible);
CREATE INDEX IF NOT EXISTS idx_projects_order ON public.portfolio_projects(order_position);

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
    show_loading_screen BOOLEAN DEFAULT TRUE,
    show_admin_loading BOOLEAN DEFAULT TRUE,
    navbar_padding VARCHAR(20) DEFAULT 'normal',
    socials JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter les nouvelles colonnes si elles n'existent pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_settings' AND column_name = 'show_loading_screen') THEN
        ALTER TABLE public.portfolio_settings ADD COLUMN show_loading_screen BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_settings' AND column_name = 'show_admin_loading') THEN
        ALTER TABLE public.portfolio_settings ADD COLUMN show_admin_loading BOOLEAN DEFAULT TRUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_settings' AND column_name = 'navbar_padding') THEN
        ALTER TABLE public.portfolio_settings ADD COLUMN navbar_padding VARCHAR(20) DEFAULT 'normal';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_settings' AND column_name = 'grain_effect') THEN
        ALTER TABLE public.portfolio_settings ADD COLUMN grain_effect BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

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
    icon VARCHAR(50) DEFAULT 'Sparkles',
    text_align VARCHAR(20) DEFAULT 'left',
    timer_position VARCHAR(20) DEFAULT 'right',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter les colonnes si elles n'existent pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_announcements' AND column_name = 'height') THEN
        ALTER TABLE public.portfolio_announcements ADD COLUMN height VARCHAR(20) DEFAULT '56px';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_announcements' AND column_name = 'icon') THEN
        ALTER TABLE public.portfolio_announcements ADD COLUMN icon VARCHAR(50) DEFAULT 'Sparkles';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_announcements' AND column_name = 'text_align') THEN
        ALTER TABLE public.portfolio_announcements ADD COLUMN text_align VARCHAR(20) DEFAULT 'left';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_announcements' AND column_name = 'timer_position') THEN
        ALTER TABLE public.portfolio_announcements ADD COLUMN timer_position VARCHAR(20) DEFAULT 'right';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_announcements' AND column_name = 'subtext') THEN
        ALTER TABLE public.portfolio_announcements ADD COLUMN subtext TEXT;
    END IF;
END $$;

-- Index pour récupérer les annonces actives
CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.portfolio_announcements(is_active);

-- ============================================================
-- TABLE 8: portfolio_reviews (Avis Clients)
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
-- TABLE 9: portfolio_activity_logs (Logs d'Activité)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portfolio_activity_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id BIGINT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter les colonnes si elles n'existent pas
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_activity_logs' AND column_name = 'resource_type') THEN
        ALTER TABLE public.portfolio_activity_logs ADD COLUMN resource_type VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'portfolio_activity_logs' AND column_name = 'resource_id') THEN
        ALTER TABLE public.portfolio_activity_logs ADD COLUMN resource_id BIGINT;
    END IF;
END $$;

-- Index pour filtrage par utilisateur et date
CREATE INDEX IF NOT EXISTS idx_logs_user ON public.portfolio_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_date ON public.portfolio_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_action ON public.portfolio_activity_logs(action);

-- ============================================================
-- TABLE 10: custom_orders (Commandes Personnalisées)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.custom_orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.portfolio_users(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    service_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    budget_range VARCHAR(50) NOT NULL,
    timeline VARCHAR(50) NOT NULL,
    references TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    contact_preference VARCHAR(20) DEFAULT 'email',
    additional_notes TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    admin_response TEXT,
    quoted_price DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour récupérer les commandes par utilisateur et statut
CREATE INDEX IF NOT EXISTS idx_custom_orders_user ON public.custom_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_orders_status ON public.custom_orders(status);
CREATE INDEX IF NOT EXISTS idx_custom_orders_date ON public.custom_orders(created_at DESC);

-- Commentaires pour la documentation
COMMENT ON TABLE public.custom_orders IS 'Demandes de projets personnalisés soumis par les utilisateurs';
COMMENT ON COLUMN public.custom_orders.status IS 'pending, reviewed, quoted, accepted, rejected, completed';
COMMENT ON COLUMN public.custom_orders.service_type IS 'website, design, video, illustration, marketing, content, other';
COMMENT ON COLUMN public.custom_orders.budget_range IS 'small, medium, large, premium, unknown';
COMMENT ON COLUMN public.custom_orders.timeline IS 'urgent, normal, relaxed, planning';

-- ============================================================
-- DONNÉES INITIALES
-- ============================================================

-- Insérer les paramètres par défaut (si non existants)
INSERT INTO public.portfolio_settings (
    site_title, 
    contact_email, 
    support_phone, 
    maintenance_mode,
    grain_effect,
    show_loading_screen,
    show_admin_loading,
    navbar_padding,
    socials
)
SELECT 
    'RUSTIKOP',
    'rustikop@outlook.fr',
    '',
    FALSE,
    TRUE,
    TRUE,
    TRUE,
    'normal',
    '{"instagram": "https://www.instagram.com/rustikop.art/", "twitter": "https://x.com/rustikop", "discord": "https://discord.gg/uaKYcrfyN6", "linkedin": ""}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.portfolio_settings LIMIT 1);

-- Créer une annonce par défaut (si non existante)
INSERT INTO public.portfolio_announcements (
    text,
    subtext,
    bg_color,
    text_color,
    is_active,
    font_weight,
    height,
    icon,
    text_align
)
SELECT 
    'Bienvenue sur RUSTIKOP !',
    'Découvrez nos dernières créations',
    '#d4af37',
    '#000000',
    TRUE,
    '700',
    '56px',
    'Sparkles',
    'left'
WHERE NOT EXISTS (SELECT 1 FROM public.portfolio_announcements LIMIT 1);

-- Créer un compte admin par défaut (mot de passe: Admin123!)
-- ATTENTION: Changez ce mot de passe immédiatement après la création!
INSERT INTO public.portfolio_users (email, password, name, role, role_title, permissions)
SELECT 
    'admin@rustikop.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
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

-- Politique: Permettre toutes les opérations avec service_role
DROP POLICY IF EXISTS "Service role full access products" ON public.portfolio_products;
CREATE POLICY "Service role full access products" ON public.portfolio_products
    FOR ALL USING (true) WITH CHECK (true);

-- Politique: Permettre lecture publique des projets
DROP POLICY IF EXISTS "Public read projects" ON public.portfolio_projects;
CREATE POLICY "Public read projects" ON public.portfolio_projects
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access projects" ON public.portfolio_projects;
CREATE POLICY "Service role full access projects" ON public.portfolio_projects
    FOR ALL USING (true) WITH CHECK (true);

-- Politique: Permettre lecture publique des paramètres
DROP POLICY IF EXISTS "Public read settings" ON public.portfolio_settings;
CREATE POLICY "Public read settings" ON public.portfolio_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access settings" ON public.portfolio_settings;
CREATE POLICY "Service role full access settings" ON public.portfolio_settings
    FOR ALL USING (true) WITH CHECK (true);

-- Politique: Permettre lecture publique des annonces actives
DROP POLICY IF EXISTS "Public read announcements" ON public.portfolio_announcements;
CREATE POLICY "Public read announcements" ON public.portfolio_announcements
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access announcements" ON public.portfolio_announcements;
CREATE POLICY "Service role full access announcements" ON public.portfolio_announcements
    FOR ALL USING (true) WITH CHECK (true);

-- Politique: Permettre lecture publique des codes promo
DROP POLICY IF EXISTS "Public read promo codes" ON public.portfolio_promo_codes;
CREATE POLICY "Public read promo codes" ON public.portfolio_promo_codes
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access promo codes" ON public.portfolio_promo_codes;
CREATE POLICY "Service role full access promo codes" ON public.portfolio_promo_codes
    FOR ALL USING (true) WITH CHECK (true);

-- Politique: Permettre lecture publique des avis
DROP POLICY IF EXISTS "Public read reviews" ON public.portfolio_reviews;
CREATE POLICY "Public read reviews" ON public.portfolio_reviews
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access reviews" ON public.portfolio_reviews;
CREATE POLICY "Service role full access reviews" ON public.portfolio_reviews
    FOR ALL USING (true) WITH CHECK (true);

-- Politique: Users - lecture pour auth
DROP POLICY IF EXISTS "Public read users for auth" ON public.portfolio_users;
CREATE POLICY "Public read users for auth" ON public.portfolio_users
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access users" ON public.portfolio_users;
CREATE POLICY "Service role full access users" ON public.portfolio_users
    FOR ALL USING (true) WITH CHECK (true);

-- Politique: Orders - accessible pour la gestion
DROP POLICY IF EXISTS "Public read orders" ON public.portfolio_orders;
CREATE POLICY "Public read orders" ON public.portfolio_orders
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access orders" ON public.portfolio_orders;
CREATE POLICY "Service role full access orders" ON public.portfolio_orders
    FOR ALL USING (true) WITH CHECK (true);

-- Politique: Activity Logs
DROP POLICY IF EXISTS "Service role full access logs" ON public.portfolio_activity_logs;
CREATE POLICY "Service role full access logs" ON public.portfolio_activity_logs
    FOR ALL USING (true) WITH CHECK (true);

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
-- FONCTION: Décrémenter le stock d'un produit
-- ============================================================
CREATE OR REPLACE FUNCTION decrement_product_stock(product_id BIGINT, quantity INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    current_stock INTEGER;
BEGIN
    -- Récupérer le stock actuel
    SELECT stock INTO current_stock 
    FROM public.portfolio_products 
    WHERE id = product_id;
    
    -- Si stock est NULL (illimité) ou suffisant, procéder
    IF current_stock IS NULL THEN
        RETURN TRUE;
    END IF;
    
    IF current_stock >= quantity THEN
        UPDATE public.portfolio_products 
        SET stock = stock - quantity 
        WHERE id = product_id;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

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
    
    RAISE NOTICE '✅ Installation terminée! % tables portfolio créées/mises à jour.', table_count;
END $$;

-- Afficher les tables créées avec leurs colonnes
SELECT 
    t.table_name,
    (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name) as column_count,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = t.table_name) as exists
FROM information_schema.tables t
WHERE t.table_schema = 'public' 
AND t.table_name LIKE 'portfolio_%'
ORDER BY t.table_name;

-- ============================================================
-- NOTES D'UTILISATION
-- ============================================================
-- 
-- 🔒 SÉCURITÉ:
-- - Le service_role_key est utilisé côté serveur (API routes)
-- - L'anon_key est utilisé côté client pour les lectures publiques
-- - Les politiques RLS permettent la lecture publique mais limitent l'écriture
--
-- 📦 STOCK:
-- - stock = NULL signifie stock illimité
-- - stock = 0 signifie rupture de stock
-- - stock > 0 signifie quantité disponible
--
-- ⚙️ PARAMÈTRES:
-- - show_loading_screen: Afficher l'écran de chargement public
-- - show_admin_loading: Afficher l'écran de chargement admin
-- - navbar_padding: 'normal', 'compact', 'spacious'
-- - grain_effect: Effet de grain sur tout le site
--
-- 📢 ANNONCES:
-- - height: '40px', '56px', '72px'
-- - icon: 'Sparkles', 'Bell', 'Star', etc. (icônes Lucide)
-- - text_align: 'left', 'center', 'right'
-- - timer_position: 'left', 'right', 'below'
-- ============================================================
