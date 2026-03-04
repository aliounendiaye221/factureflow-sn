'use server'

import { SuperAdminService } from '@/services/superAdminService'
import { RbacService } from '@/services/rbacService'
import { revalidatePath } from 'next/cache'
import { PLANS, type PlanId } from '@/lib/plans'

export type ActivateSubscriptionState = {
  success: boolean
  message: string
}

/**
 * Super admin : active ou change le plan d'une agence après confirmation du paiement Wave.
 */
export async function activateSubscriptionAction(
  _prev: ActivateSubscriptionState,
  formData: FormData
): Promise<ActivateSubscriptionState> {
  const isSuperAdmin = await RbacService.isSuperAdmin()
  if (!isSuperAdmin) {
    return { success: false, message: 'Accès refusé.' }
  }

  const agencyId = formData.get('agencyId') as string
  const planId = formData.get('planId') as string

  if (!agencyId || !planId) {
    return { success: false, message: 'Données manquantes.' }
  }

  if (!Object.keys(PLANS).includes(planId)) {
    return { success: false, message: `Plan "${planId}" inconnu.` }
  }

  try {
    await SuperAdminService.updateAgencyPlan(agencyId, planId as PlanId)
    revalidatePath('/dashboard/super-admin')
    return {
      success: true,
      message: `Plan "${PLANS[planId as PlanId].name}" activé avec succès.`,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erreur inconnue'
    return { success: false, message: msg }
  }
}
