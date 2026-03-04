'use client'

export default function DashboardError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  return (
    <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
      <h2 className="text-lg font-semibold text-red-700 mb-2">Erreur de chargement</h2>
      <pre className="text-sm text-red-600 whitespace-pre-wrap">{error.message}</pre>
      <p className="text-xs text-red-400 mt-4">
        Si l'erreur persiste, vérifiez que les tables Supabase sont bien créées et que les politiques RLS sont actives.
      </p>
    </div>
  )
}
