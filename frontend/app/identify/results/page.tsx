'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronDown, AlertTriangle } from 'lucide-react'
import SpeciesCard, { type SpeciesResult } from '@/components/SpeciesCard'
import WarningBanner from '@/components/WarningBanner'
import Link from 'next/link'

function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const ids = searchParams.get('ids')?.split(',') ?? []
  const [results, setResults] = useState<SpeciesResult[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    if (!ids.length) { router.push('/identify'); return }
    const fetchSpecies = async () => {
      try {
        const fetched = await Promise.all(
          ids.map(id => fetch(`/api/species/${id}`).then(r => r.json()))
        )
        setResults(fetched.filter(Boolean))
      } catch {
        router.push('/identify')
      } finally {
        setLoading(false)
      }
    }
    fetchSpecies()
  }, [])

  const hasDanger = results.some(r => r.safety_level === 'danger' || !r.is_legal)
  const displayed = showAll ? results : results.slice(0, 3)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-16 h-16 border-4 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
        <p className="text-gray-500 font-medium">Analizando resultados...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/identify" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">
              Resultados de identificación
            </h1>
            <p className="text-sm text-gray-500">{results.length} especie(s) encontrada(s)</p>
          </div>
        </div>

        {hasDanger && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <WarningBanner
              level="danger"
              title="⚠️ Advertencia legal"
              message="Una o más de las especies identificadas puede no ser adecuada o legal para tener en casa. Verifica la legislación de tu país antes de actuar."
              examples={['Animales protegidos', 'Plantas prohibidas', 'Especies en peligro']}
            />
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {displayed.map((species, i) => (
            <SpeciesCard key={species.id} species={species} index={i} />
          ))}
        </div>

        {results.length > 3 && !showAll && (
          <div className="text-center">
            <button
              onClick={() => setShowAll(true)}
              className="btn-secondary flex items-center gap-2 mx-auto"
            >
              <ChevronDown className="w-4 h-4" />
              Ver más resultados ({results.length - 3} más)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-16 h-16 border-4 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}
