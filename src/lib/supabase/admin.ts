import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

/**
 * Client Supabase avec la clé service_role.
 * Contourne la RLS — à utiliser UNIQUEMENT dans des contextes serveur isolés
 * (webhooks, jobs, routes API sans session utilisateur).
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession:   false,
      },
    }
  )
}
