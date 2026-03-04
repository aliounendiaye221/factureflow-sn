-- ============================================================
-- CORRECTIF : Récursion infinie RLS sur user_roles
-- Problème : les policies "user_roles_select_agency" et "user_roles_select_super"
--   utilisaient des subqueries directes sur user_roles (SELECT ... FROM user_roles)
--   ce qui déclenchait à nouveau les mêmes policies → boucle infinie.
-- Solution : remplacer les subqueries par des fonctions SECURITY DEFINER
--   qui contournent RLS lorsqu'elles lisent user_roles.
-- ============================================================

-- Nouvelle fonction helper : récupère le rôle de l'utilisateur courant sans récursion
CREATE OR REPLACE FUNCTION public.get_my_role() RETURNS TEXT AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Supprimer les anciennes policies récursives
DROP POLICY IF EXISTS "user_roles_select_agency" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select_super"  ON public.user_roles;

-- Recréer sans subquery récursive (les fonctions SECURITY DEFINER contournent RLS)
CREATE POLICY "user_roles_select_agency" ON public.user_roles
  FOR SELECT USING (
    agency_id = public.get_user_agency_id()
    AND public.get_my_role() IN ('admin', 'super_admin')
  );

CREATE POLICY "user_roles_select_super" ON public.user_roles
  FOR ALL USING (public.is_super_admin());
