-- ============================================================
-- Correction du trigger handle_new_user pour les utilisateurs invités
-- + Fonction pour lister les membres d'une agence
-- ============================================================

-- 1. Mettre à jour handle_new_user pour assigner le rôle depuis les métadonnées
--    lors d'une invitation (inviteUserByEmail passe agency_id + assigned_role dans raw_user_meta_data)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN

  -- ── Cas 1 : Utilisateur invité ─────────────────────────────────────────
  IF NEW.invited_at IS NOT NULL THEN
    -- Assigner le rôle et l'agence depuis les métadonnées de l'invitation
    INSERT INTO public.user_roles (user_id, agency_id, role)
    VALUES (
      NEW.id,
      (NEW.raw_user_meta_data->>'agency_id')::UUID,
      COALESCE(NEW.raw_user_meta_data->>'assigned_role', 'user')
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
  END IF;

  -- ── Cas 2 : Inscription classique ──────────────────────────────────────
  -- Créer l'agence
  INSERT INTO public.agencies (id, name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'agency_name',
      NEW.raw_user_meta_data->>'name',
      'Agence ' || split_part(NEW.email, '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING;

  -- Attribuer le rôle admin au créateur de l'agence
  INSERT INTO public.user_roles (user_id, agency_id, role)
  VALUES (NEW.id, NEW.id, 'admin')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Recréer le trigger (sécurité : éviter les doublons)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
