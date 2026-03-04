'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useState } from 'react'
import { PLANS, type PlanId } from '@/lib/plans'
import { activateSubscriptionAction, type ActivateSubscriptionState } from '@/app/actions/subscriptionActions'
import { CheckCircle2, Loader2 } from 'lucide-react'

const PLAN_COLORS: Record<string, string> = {
  free:   'bg-gray-100 text-gray-700',
  pro:    'bg-blue-100 text-blue-700',
  agency: 'bg-amber-100 text-amber-700',
}

const initialState: ActivateSubscriptionState = { success: false, message: '' }

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
    >
      {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
      Valider
    </button>
  )
}

export default function PlanSelector({
  agencyId,
  currentPlan,
}: {
  agencyId: string
  currentPlan: string
}) {
  const [open, setOpen] = useState(false)
  const [state, formAction] = useFormState(activateSubscriptionAction, initialState)

  return (
    <div className="flex items-center gap-2">
      {/* Badge plan actuel */}
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${PLAN_COLORS[currentPlan] ?? 'bg-gray-100 text-gray-600'}`}>
        {PLANS[currentPlan as PlanId]?.name ?? currentPlan}
      </span>

      {/* Bouton pour ouvrir le sélecteur */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="text-xs text-blue-600 hover:underline font-medium"
        >
          Changer
        </button>
      )}

      {/* Formulaire inline */}
      {open && (
        <form action={formAction} className="flex items-center gap-2">
          <input type="hidden" name="agencyId" value={agencyId} />
          <select
            name="planId"
            defaultValue={currentPlan}
            className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {Object.values(PLANS).map(plan => (
              <option key={plan.id} value={plan.id}>
                {plan.name} {plan.price > 0 ? `(${plan.price.toLocaleString('fr-SN')} FCFA)` : '(Gratuit)'}
              </option>
            ))}
          </select>

          <SubmitBtn />

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </form>
      )}

      {/* Feedback */}
      {state.message && (
        <span className={`text-xs font-medium ${state.success ? 'text-green-600' : 'text-red-500'}`}>
          {state.message}
        </span>
      )}
    </div>
  )
}
