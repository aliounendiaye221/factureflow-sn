-- SPRINT 0 : Schéma SQL Complet, RLS, & Indexation pour FactureFlow SN
-- Règles : Multi-tenant strict (agency_id), RLS, Index composites, Sécurité des paiements.

---------------------------------------------------------
-- 0. CLEANUP
---------------------------------------------------------
DROP TABLE IF EXISTS public.payments   CASCADE;
DROP TABLE IF EXISTS public.event_logs CASCADE;
DROP TABLE IF EXISTS public.invoices   CASCADE;
DROP TABLE IF EXISTS public.quotes     CASCADE;
DROP TABLE IF EXISTS public.clients    CASCADE;
DROP TABLE IF EXISTS public.agencies   CASCADE;

---------------------------------------------------------
-- 1. TABLE: agencies
---------------------------------------------------------
CREATE TABLE public.agencies (
  id         UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name       TEXT NOT NULL,
  ninea      TEXT,
  rccm       TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agency_select" ON public.agencies FOR SELECT USING (auth.uid() = id);
CREATE POLICY "agency_insert" ON public.agencies FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "agency_update" ON public.agencies FOR UPDATE USING (auth.uid() = id);

CREATE INDEX idx_agencies_created_at ON public.agencies(created_at);

---------------------------------------------------------
-- 2. TABLE: clients
---------------------------------------------------------
CREATE TABLE public.clients (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id  UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  name       TEXT NOT NULL,
  email      TEXT,
  phone      TEXT,
  address    TEXT,
  tax_id     TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients_all" ON public.clients FOR ALL USING (auth.uid() = agency_id);

CREATE INDEX idx_clients_agency_id      ON public.clients(agency_id);
CREATE INDEX idx_clients_agency_created ON public.clients(agency_id, created_at);

---------------------------------------------------------
-- 3. TABLE: quotes (Devis)
---------------------------------------------------------
CREATE TABLE public.quotes (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id    UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id    UUID REFERENCES public.clients(id) ON DELETE RESTRICT NOT NULL,
  quote_number TEXT NOT NULL,
  subtotal     NUMERIC(15,2) NOT NULL DEFAULT 0,
  tax_amount   NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
  items        JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE (agency_id, quote_number)
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quotes_all" ON public.quotes FOR ALL USING (auth.uid() = agency_id);

CREATE INDEX idx_quotes_agency_id      ON public.quotes(agency_id);
CREATE INDEX idx_quotes_agency_created ON public.quotes(agency_id, created_at);
CREATE INDEX idx_quotes_client_id      ON public.quotes(client_id);

---------------------------------------------------------
-- 4. TABLE: invoices (Factures)
-- Statuts : unpaid | paid | overdue | cancelled
---------------------------------------------------------
CREATE TABLE public.invoices (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id      UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  client_id      UUID REFERENCES public.clients(id) ON DELETE RESTRICT NOT NULL,
  quote_id       UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  subtotal       NUMERIC(15,2) NOT NULL DEFAULT 0,
  tax_amount     NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_amount   NUMERIC(15,2) NOT NULL DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'unpaid'
                   CHECK (status IN ('unpaid', 'paid', 'overdue', 'cancelled')),
  items          JSONB NOT NULL DEFAULT '[]'::jsonb,
  due_date       TIMESTAMP WITH TIME ZONE,
  paid_at        TIMESTAMP WITH TIME ZONE,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE (agency_id, invoice_number)
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoices_all" ON public.invoices FOR ALL USING (auth.uid() = agency_id);

CREATE INDEX idx_invoices_agency_id      ON public.invoices(agency_id);
CREATE INDEX idx_invoices_agency_created ON public.invoices(agency_id, created_at);
CREATE INDEX idx_invoices_status         ON public.invoices(status);

---------------------------------------------------------
-- 5. TABLE: payments (Paiements)
---------------------------------------------------------
CREATE TABLE public.payments (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id          UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
  invoice_id         UUID REFERENCES public.invoices(id) ON DELETE RESTRICT NOT NULL,
  amount             NUMERIC(15,2) NOT NULL,
  provider           TEXT NOT NULL,
  status             TEXT NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'success', 'failed')),
  external_reference TEXT UNIQUE,
  idempotency_key    TEXT UNIQUE NOT NULL,
  webhook_payload    JSONB,
  created_at         TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at         TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_all" ON public.payments FOR ALL USING (auth.uid() = agency_id);

CREATE INDEX idx_payments_agency_id    ON public.payments(agency_id);
CREATE INDEX idx_payments_invoice_id   ON public.payments(invoice_id);
CREATE INDEX idx_payments_external_ref ON public.payments(external_reference);
CREATE INDEX idx_payments_idempotency  ON public.payments(idempotency_key);

---------------------------------------------------------
-- 6. TABLE: event_logs (Monitoring & Audit)
---------------------------------------------------------
CREATE TABLE public.event_logs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id   UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id   UUID,
  action      TEXT NOT NULL,
  status      TEXT NOT NULL,
  payload     JSONB,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.event_logs ENABLE ROW LEVEL SECURITY;
-- Lecture par l'agence propriétaire ; écriture réservée au service_role (bypass RLS)
CREATE POLICY "event_logs_select" ON public.event_logs FOR SELECT USING (auth.uid() = agency_id);

CREATE INDEX idx_logs_agency_created ON public.event_logs(agency_id, created_at);

---------------------------------------------------------
-- 7. TRIGGER : updated_at automatique
---------------------------------------------------------
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agencies_modtime  BEFORE UPDATE ON public.agencies  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_clients_modtime   BEFORE UPDATE ON public.clients   FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_quotes_modtime    BEFORE UPDATE ON public.quotes    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_invoices_modtime  BEFORE UPDATE ON public.invoices  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_payments_modtime  BEFORE UPDATE ON public.payments  FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

---------------------------------------------------------
-- 8. TRIGGER : création automatique d'agence au signup
---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.agencies (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Agence ' || split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
