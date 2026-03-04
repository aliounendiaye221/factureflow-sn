import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const path = body?.path

  if (!path || typeof path !== 'string') {
    return NextResponse.json({ error: 'path required' }, { status: 400 })
  }

  // Récupérer l'utilisateur connecté
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() { },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ ok: true }) // Pas de tracking pour les visiteurs non connectés
  }

  const { data: agencyId } = await supabase.rpc('get_user_agency_id')

  // Insérer via admin pour bypass RLS
  const admin = createAdminClient()
  await admin.from('page_views').insert({
    user_id: user.id,
    agency_id: agencyId ?? user.id,
    path,
  })

  return NextResponse.json({ ok: true })
}
