-- ============================================================
-- Fonctions de numérotation séquentielle atomique
-- next_quote_number(p_agency_id)   → "DEV-2026-0001"
-- next_invoice_number(p_agency_id) → "FAC-2026-0001"
-- Utilise un advisory lock par agence pour éviter les doublons
-- en cas de requêtes simultanées.
-- ============================================================

-- ── Devis ───────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.next_quote_number(p_agency_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_year   INT  := EXTRACT(YEAR FROM NOW());
  v_count  INT;
  v_number TEXT;
BEGIN
  -- Verrou consultatif par agence (évite les numéros dupliqués en concurrence)
  PERFORM pg_advisory_xact_lock(hashtext(p_agency_id::text || '-quote'));

  SELECT COUNT(*) + 1
    INTO v_count
    FROM public.quotes
   WHERE agency_id = p_agency_id
     AND EXTRACT(YEAR FROM created_at) = v_year;

  v_number := 'DEV-' || v_year || '-' || LPAD(v_count::text, 4, '0');
  RETURN v_number;
END;
$$;

-- ── Factures ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.next_invoice_number(p_agency_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_year   INT  := EXTRACT(YEAR FROM NOW());
  v_count  INT;
  v_number TEXT;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_agency_id::text || '-invoice'));

  SELECT COUNT(*) + 1
    INTO v_count
    FROM public.invoices
   WHERE agency_id = p_agency_id
     AND EXTRACT(YEAR FROM created_at) = v_year;

  v_number := 'FAC-' || v_year || '-' || LPAD(v_count::text, 4, '0');
  RETURN v_number;
END;
$$;
