-- ============================================================
-- Ajout du logo agence et bucket de stockage
-- ============================================================

-- 1. Colonne logo_url sur la table agencies
ALTER TABLE public.agencies
  ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT NULL;

-- 2. Bucket de stockage pour les logos (fichiers publics)
INSERT INTO storage.buckets (id, name, public)
VALUES ('agency-logos', 'agency-logos', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Politiques RLS pour le bucket agency-logos
--    - Lecture publique (pour afficher sur les PDFs)
--    - Écriture réservée à l'agence propriétaire (owner = user_id)

DROP POLICY IF EXISTS "logos_select_public" ON storage.objects;
DROP POLICY IF EXISTS "logos_insert_owner"  ON storage.objects;
DROP POLICY IF EXISTS "logos_update_owner"  ON storage.objects;
DROP POLICY IF EXISTS "logos_delete_owner"  ON storage.objects;

-- Lecture publique
CREATE POLICY "logos_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'agency-logos');

-- L'utilisateur ne peut uploader que dans son propre dossier (nomme le fichier <user_id>/logo.*)
CREATE POLICY "logos_insert_owner" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'agency-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "logos_update_owner" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'agency-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "logos_delete_owner" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'agency-logos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
