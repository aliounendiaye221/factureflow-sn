-- Ajouter les coordonnées de contact à la table agencies
ALTER TABLE public.agencies
  ADD COLUMN IF NOT EXISTS email   TEXT,
  ADD COLUMN IF NOT EXISTS phone   TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT;
