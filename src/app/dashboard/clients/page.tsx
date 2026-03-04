import { ClientService } from '@/services/clientService'
import { RbacService } from '@/services/rbacService'
import NewClientModal from './NewClientModal'
import ClientListWithSearch from './ClientListWithSearch'
import { Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
  const [clients, statsMap, canEdit, canDelete] = await Promise.all([
    ClientService.getClients(),
    ClientService.getClientStats(),
    RbacService.checkRole(['super_admin', 'admin', 'user']),
    RbacService.checkRole(['super_admin', 'admin']),
  ])

  // Sérialiser la Map en objet pour le passage au Client Component
  const statsObj: Record<string, { total_billed: number; invoice_count: number; unpaid_total: number }> = {}
  statsMap.forEach((v, k) => { statsObj[k] = v })

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 rounded-lg">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Clients</h2>
            <p className="text-gray-500 text-sm">Gérez votre portefeuille client</p>
          </div>
        </div>
        {canEdit && <NewClientModal />}
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center flex flex-col items-center">
          <Users className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Aucun client</h3>
          <p className="text-gray-500 max-w-sm mx-auto">Vous n'avez pas encore ajouté de client. Créez votre premier client pour commencer à facturer.</p>
        </div>
      ) : (
        <ClientListWithSearch
          clients={clients}
          stats={statsObj}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      )}
    </div>
  )
}
