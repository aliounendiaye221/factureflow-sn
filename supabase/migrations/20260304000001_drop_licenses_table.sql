-- ============================================================
-- NETTOYAGE : Suppression de la table licenses (système abandonné)
-- Le système de licences logicielles a été remplacé par des
-- abonnements Wave validés manuellement par le super admin.
-- ============================================================

DROP TABLE IF EXISTS public.licenses CASCADE;
