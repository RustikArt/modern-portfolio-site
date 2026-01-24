-- ============================================================
-- SUPABASE SQL INITIALIZATION
-- For: portfolio_settings table
-- When: Run ONCE in Supabase SQL Editor before deployment
-- ============================================================

-- Initialize default configuration (run this in SQL Editor)
INSERT INTO public.portfolio_settings 
  (site_title, contact_email, support_phone, maintenance_mode, socials)
VALUES 
  ('Rustikop - Modern Portfolio', 
   'contact@rustikop.com', 
   '+33 1 23 45 67 89', 
   false,
   '{"instagram": "", "twitter": "", "linkedin": "", "discord": ""}'::jsonb)
ON CONFLICT DO NOTHING
RETURNING *;

-- Verify it was created
SELECT * FROM public.portfolio_settings LIMIT 1;
