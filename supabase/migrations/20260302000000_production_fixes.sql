-- ============================================================
-- MIGRATION : Correctifs de production — FactureFlow SN
-- Date : 2026-03-02
-- ============================================================

---------------------------------------------------------
-- 1. Colonne PLAN sur agencies (billing)
---------------------------------------------------------
ALTER TABLE public.agencies
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'pro', 'agency'));

---------------------------------------------------------
-- 2. Colonnes de profil sur agencies (mail, tel, adresse)
--    (réappliqué en idempotent au cas où la migration 20260301 ne serait pas encore jouée)
---------------------------------------------------------
ALTER TABLE public.agencies
  ADD COLUMN IF NOT EXISTS email   TEXT,
  ADD COLUMN IF NOT EXISTS phone   TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT;

---------------------------------------------------------
-- 3. user_id dans event_logs (traçabilité des actions)
---------------------------------------------------------
ALTER TABLE public.event_logs
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_logs_user_id ON public.event_logs(user_id);

---------------------------------------------------------
-- 4. Colonnes compteurs atomiques pour la numérotation
--    (évite les race conditions dans le code applicatif)
---------------------------------------------------------
ALTER TABLE public.agencies
  ADD COLUMN IF NOT EXISTS next_invoice_seq INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_quote_seq   INTEGER NOT NULL DEFAULT 0;

-- Initialiser les compteurs depuis les données existantes
UPDATE public.agencies a
SET next_invoice_seq = COALESCE(
  (SELECT COUNT(*) FROM public.invoices WHERE agency_id = a.id), 0
);

UPDATE public.agencies a
SET next_quote_seq = COALESCE(
  (SELECT COUNT(*) FROM public.quotes WHERE agency_id = a.id), 0
);

---------------------------------------------------------
-- 5. Fonctions d'incrémentation atomique (SECURITY DEFINER)
--    Utilise une UPDATE row-level lock pour l'atomicité
---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.next_invoice_number(p_agency_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_seq INTEGER;
  v_ym  TEXT;
BEGIN
  UPDATE public.agencies
     SET next_invoice_seq = next_invoice_seq + 1
   WHERE id = p_agency_id
  RETURNING next_invoice_seq INTO v_seq;

  IF v_seq IS NULL THEN
    RAISE EXCEPTION 'Agence introuvable : %', p_agency_id;
  END IF;

  v_ym := TO_CHAR(NOW() AT TIME ZONE 'UTC', 'YYYYMM');
  RETURN 'FAC-' || v_ym || '-' || LPAD(v_seq::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.next_quote_number(p_agency_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_seq INTEGER;
  v_ym  TEXT;
BEGIN
  UPDATE public.agencies
     SET next_quote_seq = next_quote_seq + 1
   WHERE id = p_agency_id
  RETURNING next_quote_seq INTO v_seq;

  IF v_seq IS NULL THEN
    RAISE EXCEPTION 'Agence introuvable : %', p_agency_id;
  END IF;

  v_ym := TO_CHAR(NOW() AT TIME ZONE 'UTC', 'YYYYMM');
  RETURN 'DEVIS-' || v_ym || '-' || LPAD(v_seq::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

---------------------------------------------------------
-- 6. Trigger updated_at pour agencies (idempotent)
---------------------------------------------------------
DROP TRIGGER IF EXISTS update_agencies_modtime ON public.agencies;
CREATE TRIGGER update_agencies_modtime
  BEFORE UPDATE ON public.agencies
  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

---------------------------------------------------------
-- 7. Index supplémentaires pour la performance
---------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_invoices_paid_at ON public.invoices(paid_at)
  WHERE paid_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_quotes_status    ON public.quotes(status);
