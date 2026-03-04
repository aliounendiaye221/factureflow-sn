export type PlanId = 'free' | 'pro' | 'agency'

export type Plan = {
    id: PlanId
    name: string
    price: number // FCFA/mois
    limits: {
        invoices: number         // -1 = illimité
        clients: number          // -1 = illimité
        users: number            // -1 = illimité
    }
    features: string[]
    highlight?: string           // Badge affiché sur la carte plan
}

export const PLANS: Record<PlanId, Plan> = {
    free: {
        id: 'free',
        name: 'Gratuit',
        price: 0,
        limits: {
            invoices: 5,
            clients: 10,
            users: 1,
        },
        features: [
            '5 factures par mois',
            '10 clients maximum',
            '1 utilisateur',
            'Lien de paiement Wave / Orange Money',
            'Factures conformes DGI (NINEA, RCCM)',
            'PDF téléchargeable',
        ]
    },
    pro: {
        id: 'pro',
        name: 'PME',
        price: 9900,
        highlight: 'Le plus populaire',
        limits: {
            invoices: -1,
            clients: -1,
            users: 3,
        },
        features: [
            'Factures & devis illimités',
            'Clients illimités',
            '3 utilisateurs',
            'Templates Pro (Classique, Moderne, Élite)',
            'Conversion devis → facture en 1 clic',
            'Relances WhatsApp intelligente',
            'Livre d’Inventaire dynamique',
            'Conformité DGI Sénégal intégrée',
        ]
    },
    agency: {
        id: 'agency',
        name: 'Pro',
        price: 19900,
        limits: {
            invoices: -1,
            clients: -1,
            users: 20,
        },
        features: [
            'Tout le plan PME inclus',
            '20 utilisateurs',
            'Livre d’Inventaire Multi-utilisateurs',
            'Rapports avancés & exports financiers',
            'Gestion des rôles équipe',
            'Permissions sécurisées',
            'Support onboarding dédié',
        ]
    }
}

/**
 * Vérifie si une agence a dépassé ses limites de plan
 */
export function checkLimit(
    planId: string | null | undefined,
    resource: keyof Plan['limits'],
    currentCount: number
): { allowed: boolean; limit: number } {
    const plan = PLANS[planId as PlanId] ?? PLANS['free'] // fallback au plan gratuit si inconnu
    const limit = plan.limits[resource]
    if (limit === -1) return { allowed: true, limit: -1 }
    return { allowed: currentCount < limit, limit }
}

export function formatPlanPrice(planId: string | null | undefined): string {
    const plan = PLANS[planId as PlanId] ?? PLANS['free']
    if (plan.price === 0) return 'Gratuit'
    return `${plan.price.toLocaleString('fr-SN')} FCFA/mois`
}
