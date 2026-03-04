import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '../types/database.types'

type ProductRow = Database['public']['Tables']['products']['Row']

export type CatalogItem = ProductRow

export class CatalogService {
  private static getSupabase() {
    const cookieStore = cookies()
    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() { },
        },
      }
    )
  }

  private static async getAuthContext(): Promise<{ userId: string; agencyId: string }> {
    const supabase = this.getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Non authentifié')
    const { data: agencyId } = await supabase.rpc('get_user_agency_id')
    return { userId: user.id, agencyId: agencyId ?? user.id }
  }

  static async getCatalogItems(): Promise<CatalogItem[]> {
    const supabase = this.getSupabase()
    const { agencyId } = await this.getAuthContext()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('agency_id', agencyId)
      .order('type', { nullsFirst: false })
      .order('name')
    if (error) throw new Error(error.message)
    return data ?? []
  }

  static async getActiveCatalogItems(): Promise<CatalogItem[]> {
    const supabase = this.getSupabase()
    const { agencyId } = await this.getAuthContext()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('agency_id', agencyId)
      .order('name')
    if (error) throw new Error(error.message)
    return data ?? []
  }

  static async createCatalogItem(input: {
    name: string
    description?: string | null
    unit_price: number
    tax_rate?: number
    type?: string | null
  }): Promise<CatalogItem> {
    const supabase = this.getSupabase()
    const { agencyId } = await this.getAuthContext()
    const { data, error } = await supabase
      .from('products')
      .insert({ agency_id: agencyId, ...input })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  }

  static async updateCatalogItem(
    id: string,
    input: Partial<ProductRow>
  ): Promise<CatalogItem> {
    const supabase = this.getSupabase()
    const { agencyId } = await this.getAuthContext()
    const { data, error } = await supabase
      .from('products')
      .update(input)
      .eq('id', id)
      .eq('agency_id', agencyId)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return data
  }

  static async deleteCatalogItem(id: string): Promise<void> {
    const supabase = this.getSupabase()
    const { agencyId } = await this.getAuthContext()
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('agency_id', agencyId)
    if (error) throw new Error(error.message)
  }
}
