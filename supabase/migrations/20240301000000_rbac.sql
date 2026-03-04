-- ⚠️ MIGRATION VIDE - contenu déplacé dans 20260228000001_rbac.sql
-- Raison : cette migration avait un timestamp 2024 inférieur à l'initial_schema 2026,
-- ce qui causait une erreur FK sur fresh install (public.agencies n'existait pas encore).
-- NE PAS SUPPRIMER CE FICHIER : Supabase suit les migrations par nom de fichier.
-- Toute la logique RBAC se trouve désormais dans 20260228000001_rbac.sql.

-- (no-op intentionnel)
DO $$ BEGIN NULL; END; $$;
