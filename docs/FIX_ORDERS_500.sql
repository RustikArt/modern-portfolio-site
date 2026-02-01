-- ============================================================
-- FIX SCRIPT: Resolve 500 errors on order modifications
-- Execute this in your Supabase SQL Editor
-- ============================================================

-- Step 1: Add missing columns to portfolio_orders table
-- These columns are used by the API but may not exist in the database

DO $$
BEGIN
    -- Add updated_at column if it doesn't exist (REQUIRED for triggers)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'portfolio_orders' 
                   AND column_name = 'updated_at') THEN
        ALTER TABLE public.portfolio_orders ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added column: updated_at';
    ELSE
        RAISE NOTICE 'Column updated_at already exists';
    END IF;

    -- Add promo_code_used column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'portfolio_orders' 
                   AND column_name = 'promo_code_used') THEN
        ALTER TABLE public.portfolio_orders ADD COLUMN promo_code_used VARCHAR(100);
        RAISE NOTICE 'Added column: promo_code_used';
    ELSE
        RAISE NOTICE 'Column promo_code_used already exists';
    END IF;
    
    -- Add promo_discount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'portfolio_orders' 
                   AND column_name = 'promo_discount') THEN
        ALTER TABLE public.portfolio_orders ADD COLUMN promo_discount DECIMAL(10,2) DEFAULT 0;
        RAISE NOTICE 'Added column: promo_discount';
    ELSE
        RAISE NOTICE 'Column promo_discount already exists';
    END IF;

    -- Add tracking_number column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'portfolio_orders' 
                   AND column_name = 'tracking_number') THEN
        ALTER TABLE public.portfolio_orders ADD COLUMN tracking_number VARCHAR(255);
        RAISE NOTICE 'Added column: tracking_number';
    ELSE
        RAISE NOTICE 'Column tracking_number already exists';
    END IF;

    -- Ensure notes column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'portfolio_orders' 
                   AND column_name = 'notes') THEN
        ALTER TABLE public.portfolio_orders ADD COLUMN notes TEXT;
        RAISE NOTICE 'Added column: notes';
    ELSE
        RAISE NOTICE 'Column notes already exists';
    END IF;

    -- Ensure checklist column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'portfolio_orders' 
                   AND column_name = 'checklist') THEN
        ALTER TABLE public.portfolio_orders ADD COLUMN checklist JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Added column: checklist';
    ELSE
        RAISE NOTICE 'Column checklist already exists';
    END IF;

    -- Ensure archived column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'portfolio_orders' 
                   AND column_name = 'archived') THEN
        ALTER TABLE public.portfolio_orders ADD COLUMN archived BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added column: archived';
    ELSE
        RAISE NOTICE 'Column archived already exists';
    END IF;

    -- Ensure completion_date column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'portfolio_orders' 
                   AND column_name = 'completion_date') THEN
        ALTER TABLE public.portfolio_orders ADD COLUMN completion_date TIMESTAMPTZ;
        RAISE NOTICE 'Added column: completion_date';
    ELSE
        RAISE NOTICE 'Column completion_date already exists';
    END IF;

END $$;

-- Step 2: Update RLS Policies for portfolio_orders
-- Drop and recreate policies to ensure proper access

-- Enable RLS
ALTER TABLE public.portfolio_orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Public read orders" ON public.portfolio_orders;
DROP POLICY IF EXISTS "Service role full access orders" ON public.portfolio_orders;
DROP POLICY IF EXISTS "Anon can insert orders" ON public.portfolio_orders;
DROP POLICY IF EXISTS "Allow service role all operations" ON public.portfolio_orders;

-- Create policies
CREATE POLICY "Public read orders" ON public.portfolio_orders
    FOR SELECT USING (true);

CREATE POLICY "Service role full access orders" ON public.portfolio_orders
    FOR ALL USING (true) WITH CHECK (true);

-- Step 3: Add missing columns to portfolio_promo_codes if needed

DO $$
BEGIN
    -- Ensure current_uses column exists (for promo usage tracking)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'portfolio_promo_codes' 
                   AND column_name = 'current_uses') THEN
        ALTER TABLE public.portfolio_promo_codes ADD COLUMN current_uses INTEGER DEFAULT 0;
        RAISE NOTICE 'Added column: current_uses to promo_codes';
    ELSE
        RAISE NOTICE 'Column current_uses already exists in promo_codes';
    END IF;
    
    -- Ensure is_active column exists (for promo enable/disable)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'portfolio_promo_codes' 
                   AND column_name = 'is_active') THEN
        ALTER TABLE public.portfolio_promo_codes ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
        RAISE NOTICE 'Added column: is_active to promo_codes';
    ELSE
        RAISE NOTICE 'Column is_active already exists in promo_codes';
    END IF;
    
    -- Ensure updated_at column exists (required by trigger)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'portfolio_promo_codes' 
                   AND column_name = 'updated_at') THEN
        ALTER TABLE public.portfolio_promo_codes ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added column: updated_at to promo_codes';
    ELSE
        RAISE NOTICE 'Column updated_at already exists in promo_codes';
    END IF;
END $$;

-- Step 4: Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'portfolio_orders'
ORDER BY ordinal_position;

-- Done! If you see all columns listed above, the fix was successful.
-- Columns should include: promo_code_used, promo_discount, tracking_number, notes, checklist, archived, completion_date
