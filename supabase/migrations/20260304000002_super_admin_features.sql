-- ============================================================
-- MIGRATION : Fonctionnalités Super Admin
-- - Colonnes de suivi d'abonnement sur agencies
-- - Table page_views pour l'historique des visites
-- Date : 2026-03-04
-- ============================================================

---------------------------------------------------------
-- 1. Colonnes de suivi d'abonnement sur agencies
---------------------------------------------------------
ALTER TABLE public.agencies
  ADD COLUMN IF NOT EXISTS plan_started_at   TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS plan_expires_at   TIMESTAMP WITH TIME ZONE;

---------------------------------------------------------
-- 2. Table page_views pour le suivi des visites
---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.page_views (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  agency_id   UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
  path        TEXT NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut insérer (tracking côté serveur)
CREATE POLICY "page_views_insert" ON public.page_views
  FOR INSERT WITH CHECK (true);

-- Seul le super_admin peut lire
CREATE POLICY "page_views_select" ON public.page_views
  FOR SELECT USING (public.is_super_admin());

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_agency_id  ON public.page_views (agency_id);
CREATE INDEX IF NOT EXISTS idx_page_views_path       ON public.page_views (path);
