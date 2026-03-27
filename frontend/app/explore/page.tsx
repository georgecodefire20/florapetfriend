'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Leaf, PawPrint, Filter } from 'lucide-react'
import SpeciesCard, { type SpeciesResult } from '@/components/SpeciesCard'
import { supabase } from '@/lib/supabase'

export default function ExplorePage() {
  const [species, setSpecies] = useState<SpeciesResult[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'animal' | 'plant'>('all')

  useEffect(() => {
    const fetchSpecies = async () => {
      let query = supabase.from('species').select('*').order('common_name')
      if (filter !== 'all') query = query.eq('type', filter)
      if (search) query = query.ilike('common_name', `%${search}%`)
      const { data } = await query.limit(10)
      setSpecies((data || []) as SpeciesResult[])
      setLoading(false)
    }
    const timer = setTimeout(fetchSpecies, 300)
    return () => clearTimeout(timer)
  }, [search, filter])

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Filter className="w-7 h-7 text-brand-500" />
            Explorar Especies
          </h1>
          <p className="text-gray-500">Descubre el catálogo de animales y plantas identificados por la comunidad</p>
        </motion.div>

        {/* Search and filter bar */}
        <div className="flex gap-3 mb-8 flex-col sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar animal o planta..."
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'animal', 'plant'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  filter === f
                    ? 'bg-brand-500 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300'
                }`}
              >
                {f === 'animal' && <PawPrint className="w-3.5 h-3.5" />}
                {f === 'plant' && <Leaf className="w-3.5 h-3.5" />}
                {f === 'all' ? 'Todos' : f === 'animal' ? 'Animales' : 'Plantas'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-12 h-12 border-4 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : species.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500">No se encontraron especies. Prueba identificando una nueva.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {species.map((s, i) => (
              <SpeciesCard key={s.id} species={s} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
