'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signOutAction() {
  const supabase = createClient()
  await supabase.auth.signOut()

  // Vider le cache du routeur pour éviter les erreurs de session au prochain login
  revalidatePath('/', 'layout')
  redirect('/login')
}
