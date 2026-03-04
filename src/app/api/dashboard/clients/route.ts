import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ClientService } from '@/services/clientService'
import { createClient } from '@/lib/supabase/server'

// ─── Helper : vérifier l'authentification ─────────────────────────────────────
async function getAuthenticatedUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

// ─── Schéma Zod ───────────────────────────────────────────────────────────────
const CreateClientSchema = z.object({
  name:    z.string().min(2, 'Le nom doit faire au moins 2 caractères').max(100),
  email:   z.string().email('Email invalide').optional().nullable(),
  phone:   z.string().max(20).optional().nullable(),
  address: z.string().max(300).optional().nullable(),
  tax_id:  z.string().max(50).optional().nullable(),
})

// ─── GET /api/dashboard/clients ───────────────────────────────────────────────
export async function GET() {
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  try {
    const clients = await ClientService.getClients()
    return NextResponse.json(clients)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}

// ─── POST /api/dashboard/clients ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide' }, { status: 400 })
  }

  const parsed = CreateClientSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Données invalides', details: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  try {
    const client = await ClientService.createClient(parsed.data)
    return NextResponse.json(client, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}

// ─── DELETE /api/dashboard/clients?id=<uuid> ─────────────────────────────────
export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Paramètre id requis' }, { status: 400 })
  }

  try {
    await ClientService.deleteClient(id)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}

