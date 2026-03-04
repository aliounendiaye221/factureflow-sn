import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'

export type FilterConfig<T> = {
  key: string
  label: string
  options: Array<{ value: string; label: string }>
  getValue: (item: T) => string
}

/** Hook réutilisable : gère l'état de recherche + filtres et retourne le tableau filtré */
export function useSearchFilter<T>(
  items: T[],
  searchFields: (keyof T | ((item: T) => string))[],
  filterConfigs: FilterConfig<T>[] = []
) {
  const [query, setQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  const filtered = useMemo(() => {
    let result = items
    for (const f of filterConfigs) {
      const active = activeFilters[f.key]
      if (active) result = result.filter(item => f.getValue(item) === active)
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(item =>
        searchFields.some(field => {
          const val = typeof field === 'function' ? field(item) : String(item[field] ?? '')
          return val.toLowerCase().includes(q)
        })
      )
    }
    return result
  }, [items, query, activeFilters, searchFields, filterConfigs])

  const setFilter = (key: string, value: string) =>
    setActiveFilters(prev => {
      if (prev[key] === value) { const { [key]: _, ...rest } = prev; return rest }
      return { ...prev, [key]: value }
    })

  const clearAll = () => { setQuery(''); setActiveFilters({}) }
  const hasActive = !!query.trim() || Object.keys(activeFilters).length > 0

  return { query, setQuery, activeFilters, setFilter, filtered, clearAll, hasActive }
}

type SearchBarProps<T> = {
  query: string
  setQuery: (q: string) => void
  activeFilters: Record<string, string>
  setFilter: (key: string, value: string) => void
  clearAll: () => void
  hasActive: boolean
  filteredCount: number
  placeholder?: string
  filters?: FilterConfig<T>[]
}

/** Composant de barre de recherche + filtres (sans render prop) */
export default function SearchBar<T>({
  query, setQuery, activeFilters, setFilter, clearAll, hasActive, filteredCount,
  placeholder = 'Rechercher…',
  filters = [],
}: SearchBarProps<T>) {
  return (
    <div className="flex flex-wrap gap-3 items-center mb-4">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {filters.map(filter => (
        <div key={filter.key} className="flex items-center gap-1.5 flex-wrap">
          {filter.options.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(filter.key, opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                activeFilters[filter.key] === opt.value
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-gray-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ))}

      {hasActive && (
        <div className="flex items-center gap-2 ml-auto text-xs text-gray-500">
          <span>{filteredCount} résultat{filteredCount > 1 ? 's' : ''}</span>
          <button onClick={clearAll} className="text-primary hover:text-primary-700 font-medium flex items-center gap-1">
            <X className="w-3 h-3" />
            Effacer
          </button>
        </div>
      )}
    </div>
  )
}
