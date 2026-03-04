-- ============================================================
-- RBAC (Role-Based Access Control) — correctement ordonné APRÈS initial_schema
-- Rôles : super_admin, admin, user, viewer
-- ============================================================

-- 1. Création de la table user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'user'
              CHECK (role IN ('super_admin', 'admin', 'user', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leur propre rôle
DROP POLICY IF EXISTS "user_roles_select_own"     ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select_agency"  ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select_super"   ON public.user_roles;

CREATE POLICY "user_roles_select_own" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_roles_select_agency" ON public.user_roles
  FOR SELECT USING (
    agency_id = (SELECT agency_id FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "user_roles_select_super" ON public.user_roles
  FOR ALL USING (
    'super_admin' = (SELECT role FROM public.user_roles WHERE user_id = auth.uid())
  );

-- Index pour la performance des politiques RLS
CREATE INDEX IF NOT EXISTS idx_user_roles_agency_id ON public.user_roles(agency_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role      ON public.user_roles(role);

-- 2. Mise à jour de la fonction handle_new_user (version RBAC)
-- Gère les invitations (invited_at != null → pas de nouvelle agence)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Si l'utilisateur est invité, ne pas lui créer sa propre agence
  IF NEW.invited_at IS NOT NULL THEN
     RETURN NEW;
  END IF;

  -- Création de l'agence depuis les métadonnées ou le prefixe email
  INSERT INTO public.agencies (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'agency_name',
             NEW.raw_user_meta_data->>'name',
             'Agence ' || split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  -- Attribution du rôle admin au créateur
  INSERT INTO public.user_roles (user_id, agency_id, role)
  VALUES (NEW.id, NEW.id, 'admin')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Peuplement initial : donner le rôle 'admin' aux utilisateurs existants sans rôle
INSERT INTO public.user_roles (user_id, agency_id, role)
SELECT id, id, 'admin'
FROM public.agencies
ON CONFLICT (user_id) DO NOTHING;

-- 4. Fonctions helpers pour RLS (SECURITY DEFINER pour éviter la récursion RLS)
CREATE OR REPLACE FUNCTION public.get_user_agency_id() RETURNS UUID AS $$
  SELECT agency_id FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 5. Remplacement des politiques RLS par des politiques RBAC granulaires

-- ── AGENCIES ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "agency_select" ON public.agencies;
DROP POLICY IF EXISTS "agency_insert" ON public.agencies;
DROP POLICY IF EXISTS "agency_update" ON public.agencies;

CREATE POLICY "agency_select" ON public.agencies FOR SELECT USING (
  id = public.get_user_agency_id() OR public.is_super_admin()
);
CREATE POLICY "agency_update" ON public.agencies FOR UPDATE USING (
  (id = public.get_user_agency_id()
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')))
  OR public.is_super_admin()
);

-- ── CLIENTS ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "clients_all"    ON public.clients;
DROP POLICY IF EXISTS "clients_select" ON public.clients;
DROP POLICY IF EXISTS "clients_insert" ON public.clients;
DROP POLICY IF EXISTS "clients_update" ON public.clients;
DROP POLICY IF EXISTS "clients_delete" ON public.clients;

CREATE POLICY "clients_select" ON public.clients FOR SELECT USING (
  agency_id = public.get_user_agency_id() OR public.is_super_admin()
);
CREATE POLICY "clients_insert" ON public.clients FOR INSERT WITH CHECK (
  agency_id = public.get_user_agency_id()
  AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'viewer')
);
CREATE POLICY "clients_update" ON public.clients FOR UPDATE USING (
  (agency_id = public.get_user_agency_id()
    AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'viewer'))
  OR public.is_super_admin()
);
CREATE POLICY "clients_delete" ON public.clients FOR DELETE USING (
  (agency_id = public.get_user_agency_id()
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')))
  OR public.is_super_admin()
);

-- ── QUOTES ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "quotes_all"    ON public.quotes;
DROP POLICY IF EXISTS "quotes_select" ON public.quotes;
DROP POLICY IF EXISTS "quotes_insert" ON public.quotes;
DROP POLICY IF EXISTS "quotes_update" ON public.quotes;
DROP POLICY IF EXISTS "quotes_delete" ON public.quotes;

CREATE POLICY "quotes_select" ON public.quotes FOR SELECT USING (
  agency_id = public.get_user_agency_id() OR public.is_super_admin()
);
CREATE POLICY "quotes_insert" ON public.quotes FOR INSERT WITH CHECK (
  agency_id = public.get_user_agency_id()
  AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'viewer')
);
CREATE POLICY "quotes_update" ON public.quotes FOR UPDATE USING (
  (agency_id = public.get_user_agency_id()
    AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'viewer'))
  OR public.is_super_admin()
);
CREATE POLICY "quotes_delete" ON public.quotes FOR DELETE USING (
  (agency_id = public.get_user_agency_id()
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')))
  OR public.is_super_admin()
);

-- ── INVOICES ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "invoices_all"    ON public.invoices;
DROP POLICY IF EXISTS "invoices_select" ON public.invoices;
DROP POLICY IF EXISTS "invoices_insert" ON public.invoices;
DROP POLICY IF EXISTS "invoices_update" ON public.invoices;
DROP POLICY IF EXISTS "invoices_delete" ON public.invoices;

CREATE POLICY "invoices_select" ON public.invoices FOR SELECT USING (
  agency_id = public.get_user_agency_id() OR public.is_super_admin()
);
CREATE POLICY "invoices_insert" ON public.invoices FOR INSERT WITH CHECK (
  agency_id = public.get_user_agency_id()
  AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'viewer')
);
CREATE POLICY "invoices_update" ON public.invoices FOR UPDATE USING (
  (agency_id = public.get_user_agency_id()
    AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'viewer'))
  OR public.is_super_admin()
);
CREATE POLICY "invoices_delete" ON public.invoices FOR DELETE USING (
  (agency_id = public.get_user_agency_id()
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')))
  OR public.is_super_admin()
);

-- ── PAYMENTS ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "payments_all"    ON public.payments;
DROP POLICY IF EXISTS "payments_select" ON public.payments;
DROP POLICY IF EXISTS "payments_insert" ON public.payments;
DROP POLICY IF EXISTS "payments_update" ON public.payments;
DROP POLICY IF EXISTS "payments_delete" ON public.payments;

CREATE POLICY "payments_select" ON public.payments FOR SELECT USING (
  agency_id = public.get_user_agency_id() OR public.is_super_admin()
);
CREATE POLICY "payments_insert" ON public.payments FOR INSERT WITH CHECK (
  agency_id = public.get_user_agency_id()
  AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'viewer')
);
CREATE POLICY "payments_update" ON public.payments FOR UPDATE USING (
  (agency_id = public.get_user_agency_id()
    AND NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'viewer'))
  OR public.is_super_admin()
);
CREATE POLICY "payments_delete" ON public.payments FOR DELETE USING (
  (agency_id = public.get_user_agency_id()
    AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin')))
  OR public.is_super_admin()
);

-- ── EVENT_LOGS ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "event_logs_select" ON public.event_logs;
CREATE POLICY "event_logs_select" ON public.event_logs FOR SELECT USING (
  auth.uid() = agency_id OR public.is_super_admin()
);
