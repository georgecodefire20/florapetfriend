'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Lock, Sparkles } from 'lucide-react'
import SpeciesCard, { type SpeciesResult } from '@/components/SpeciesCard'
import WarningBanner from '@/components/WarningBanner'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'

function LockedCard({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative rounded-3xl overflow-hidden border border-gray-200 bg-white"
    >
      {/* Blurred fake content */}
      <div className="blur-sm pointer-events-none select-none p-5 space-y-3">
        <div className="h-40 bg-gradient-to-br from-brand-100 to-earth-100 rounded-2xl" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-100 rounded-full w-16" />
          <div className="h-6 bg-gray-100 rounded-full w-20" />
        </div>
      </div>
      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] p-6 text-center">
        <div className="w-12 h-12 bg-brand-100 rounded-2xl flex items-center justify-center mb-3">
          <Lock className="w-6 h-6 text-brand-600" />
        </div>
        <p className="font-display font-bold text-gray-800 mb-1">Resultado bloqueado</p>
        <p className="text-xs text-gray-500 mb-4">Regístrate gratis para ver todos los resultados</p>
        <Link href="/auth" className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" />
          Crear cuenta gratis
        </Link>
      </div>
    </motion.div>
  )
}

function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const ids = searchParams.get('ids')?.split(',') ?? []
  const [results, setResults] = useState<SpeciesResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ids.length) { router.push('/identify'); return }

    const cached = sessionStorage.getItem('identify_results')
    if (cached) {
      try {
        const parsed: SpeciesResult[] = JSON.parse(cached)
        const filtered = parsed.filter(r => r && r.id && r.common_name)
        if (filtered.length > 0) {
          setResults(filtered)
          setLoading(false)
          sessionStorage.removeItem('identify_results')
          filtered.forEach(r => sessionStorage.setItem(`species_basic_${r.id}`, JSON.stringify(r)))
          return
        }
      } catch {}
    }

    const fetchSpecies = async () => {
      try {
        const fetched = await Promise.all(
          ids.map(id => fetch(`/api/species/${id}`).then(r => r.ok ? r.json() : null))
        )
        const valid = fetched.filter((r): r is SpeciesResult => r !== null && r.id != null)
        setResults(valid)
        valid.forEach(r => sessionStorage.setItem(`species_basic_${r.id}`, JSON.stringify(r)))
      } catch {
        router.push('/identify')
      } finally {
        setLoading(false)
      }
    }
    fetchSpecies()
  }, [])

  const hasDanger = results.some(r => r.safety_level === 'danger' || !r.is_legal)
  const isGuest = !authLoading && !user

  if (loading || authLoading) {
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
            <p className="text-sm text-gray-500">
              {isGuest ? '1 resultado gratis' : `${results.length} especie(s) encontrada(s)`}
            </p>
          </div>
        </div>

        {/* Guest banner */}
        {isGuest && results.length > 1 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3"
          >
            <div className="flex items-center gap-3 flex-1">
              <Lock className="w-5 h-5 text-brand-600 shrink-0" />
              <div>
                <p className="font-semibold text-brand-800 text-sm">Modo gratuito — 1 resultado disponible</p>
                <p className="text-xs text-brand-600">Regístrate gratis para ver los {results.length} resultados completos, crear mascotas virtuales y recordatorios.</p>
              </div>
            </div>
            <Link href="/auth" className="btn-primary text-sm py-2 px-4 whitespace-nowrap shrink-0 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Crear cuenta gratis
            </Link>
          </motion.div>
        )}

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
          {results.map((species, i) => {
            if (isGuest && i > 0) return <LockedCard key={species.id} index={i} />
            return <SpeciesCard key={species.id} species={species} index={i} />
          })}
        </div>
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
