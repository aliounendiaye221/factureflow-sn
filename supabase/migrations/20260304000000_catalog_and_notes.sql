-- ============================================================
-- SPRINT : Catalogue de produits/services + Notes sur documents
-- Améliorations FactureFlow SN pour surpasser SamaFacture
-- ============================================================

-- ─── 1. TABLE: catalog_items (Catalogue de produits/services) ───────────────
CREATE TABLE IF NOT EXISTS public.catalog_items (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id   UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  unit_price  NUMERIC(15,2) NOT NULL DEFAULT 0,
  unit        TEXT DEFAULT 'forfait',  -- ex: forfait, heure, jour, unité, mois
  category    TEXT,                    -- ex: Développement, Design, Conseil...
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;

-- RLS via la fonction SECURITY DEFINER pour éviter la récursion
DROP POLICY IF EXISTS "catalog_items_all" ON public.catalog_items;
CREATE POLICY "catalog_items_all" ON public.catalog_items
  FOR ALL USING (agency_id = public.get_user_agency_id());

CREATE INDEX IF NOT EXISTS idx_catalog_items_agency_id ON public.catalog_items(agency_id);
CREATE INDEX IF NOT EXISTS idx_catalog_items_agency_active ON public.catalog_items(agency_id, is_active);

-- ─── 2. Colonnes notes sur quotes ────────────────────────────────────────────
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS validity_days INT DEFAULT 30;   -- validité du devis en jours

-- ─── 3. Colonnes notes + conditions de paiement sur invoices ─────────────────
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS payment_terms TEXT;             -- ex: "Paiement à 30 jours"

-- ─── 4. Colonne adresse sur clients (si pas encore présente) ─────────────────
-- (déjà présente normalement, mais on sécurise)
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Sénégal';

-- ─── 5. Trigger updated_at pour catalog_items ────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS catalog_items_updated_at ON public.catalog_items;
CREATE TRIGGER catalog_items_updated_at
  BEFORE UPDATE ON public.catalog_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS quotes_updated_at ON public.quotes;
CREATE TRIGGER quotes_updated_at
  BEFORE UPDATE ON public.quotes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS invoices_updated_at ON public.invoices;
CREATE TRIGGER invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── 6. Statistiques dashboard enrichies ─────────────────────────────────────
-- Fonction pour le CA mensuel des 6 derniers mois
CREATE OR REPLACE FUNCTION public.get_monthly_revenue(p_agency_id UUID)
RETURNS TABLE(month TEXT, revenue NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(DATE_TRUNC('month', paid_at), 'YYYY-MM') AS month,
    SUM(total_amount) AS revenue
  FROM public.invoices
  WHERE agency_id = p_agency_id
    AND status = 'paid'
    AND paid_at >= NOW() - INTERVAL '6 months'
  GROUP BY DATE_TRUNC('month', paid_at)
  ORDER BY DATE_TRUNC('month', paid_at);
END;
$$;

-- Fonction pour le top clients par CA
CREATE OR REPLACE FUNCTION public.get_top_clients(p_agency_id UUID, p_limit INT DEFAULT 5)
RETURNS TABLE(client_id UUID, client_name TEXT, total_billed NUMERIC, invoice_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS client_id,
    c.name AS client_name,
    COALESCE(SUM(i.total_amount), 0) AS total_billed,
    COUNT(i.id) AS invoice_count
  FROM public.clients c
  LEFT JOIN public.invoices i ON i.client_id = c.id
    AND i.agency_id = p_agency_id
    AND i.status != 'cancelled'
  WHERE c.agency_id = p_agency_id
  GROUP BY c.id, c.name
  HAVING COALESCE(SUM(i.total_amount), 0) > 0
  ORDER BY total_billed DESC
  LIMIT p_limit;
END;
$$;
