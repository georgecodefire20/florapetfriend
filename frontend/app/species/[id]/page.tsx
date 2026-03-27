'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Leaf, PawPrint, Clock, MapPin, Utensils,
  Plus, CheckCircle, Globe, Home, BookOpen, Star, Shield,
  Droplets, Sun, Baby, Volume2, TreePine, Thermometer, Lock, Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import WarningBanner from '@/components/WarningBanner'
import toast from 'react-hot-toast'
import type { SpeciesDetails } from '@/lib/ollama'
import { useAuth } from '@/lib/auth'

interface BasicSpecies {
  id: string
  common_name: string
  scientific_name: string
  type: 'animal' | 'plant'
  image_url?: string
  safety_level: 'safe' | 'caution' | 'danger'
  is_legal: boolean
  is_domestic: boolean
  short_desc: string
  diet?: string
  lifespan?: string
  habitat?: string
  care_notes?: string
  legal_notes?: string
}

function InfoRow({ label, value }: { label: string; value: string | boolean | undefined | null }) {
  if (value === null || value === undefined || value === '') return null
  const display = typeof value === 'boolean' ? (value ? 'Sí' : 'No') : String(value)
  return (
    <div className="flex gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 uppercase tracking-wide w-36 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-700">{display}</span>
    </div>
  )
}

function SectionCard({ title, icon, children, delay = 0, color = 'bg-brand-100 text-brand-600' }: {
  title: string
  icon: ReactNode
  children: ReactNode
  delay?: number
  color?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card mb-5"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <h2 className="font-display font-bold text-lg text-gray-900">{title}</h2>
      </div>
      {children}
    </motion.div>
  )
}

const difficultyColor: Record<string, string> = {
  fácil: 'bg-green-100 text-green-700',
  moderado: 'bg-yellow-100 text-yellow-700',
  difícil: 'bg-orange-100 text-orange-700',
  experto: 'bg-red-100 text-red-700',
}

function QuickStat({ icon, label, value, color }: { icon: ReactNode; label: string; value: string | null | undefined; color: string }) {
  if (!value) return null
  return (
    <div className="flex flex-col items-start gap-1.5 p-3 rounded-2xl bg-white border border-gray-100 shadow-sm">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
      <span className="text-xs text-gray-400 leading-none">{label}</span>
      <span className="text-sm font-semibold text-gray-800 leading-tight">{value}</span>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="card mb-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gray-200" />
        <div className="h-5 bg-gray-200 rounded w-40" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex gap-3">
            <div className="h-3 bg-gray-100 rounded w-28" />
            <div className="h-3 bg-gray-100 rounded flex-1" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SpeciesDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const [species, setSpecies] = useState<BasicSpecies | null>(null)
  const [details, setDetails] = useState<SpeciesDetails | null>(null)
  const [loadingBasic, setLoadingBasic] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [creatingPet, setCreatingPet] = useState(false)
  const [petCreated, setPetCreated] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  useEffect(() => {
    const load = async () => {
      const cached = sessionStorage.getItem(`species_basic_${id}`)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          if (parsed?.id) { setSpecies(parsed); setLoadingBasic(false); return }
        } catch {}
      }
      const res = await fetch(`/api/species/${id}`)
      if (res.ok) {
        const data = await res.json()
        if (data?.id) {
          setSpecies(data)
          sessionStorage.setItem(`species_basic_${id}`, JSON.stringify(data))
        }
      }
      setLoadingBasic(false)
    }
    load().catch(() => setLoadingBasic(false))
  }, [id])

  useEffect(() => {
    if (!species) return
    const cached = sessionStorage.getItem(`species_details_${id}`)
    if (cached) {
      try { setDetails(JSON.parse(cached)); return } catch {}
    }
    setLoadingDetails(true)
    const p = new URLSearchParams({ name: species.common_name, scientific: species.scientific_name, type: species.type })
    fetch(`/api/species/${id}/enrich?${p}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && !data.error) {
          setDetails(data)
          sessionStorage.setItem(`species_details_${id}`, JSON.stringify(data))
        }
      })
      .catch(() => {})
      .finally(() => setLoadingDetails(false))
  }, [species])

  const handleCreatePet = async () => {
    if (!species) return
    setShowConfirmModal(false)
    setCreatingPet(true)
    try {
      const res = await fetch('/api/virtual-pet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          species_id: species.id,
          species_name: species.common_name,
          species_type: species.type,
          species_scientific: species.scientific_name,
          user_id: user?.id ?? 'anonymous',
          country: (typeof navigator !== 'undefined' ? navigator.language?.split('-')[1] : null) || 'MX',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`¡${data.pet.name} ha sido creado! 🎉`)
      setPetCreated(true)
      setTimeout(() => router.push('/pets'), 1800)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error creando mascota')
    } finally {
      setCreatingPet(false)
    }
  }

  if (loadingBasic) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-14 h-14 border-4 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!species) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-500">Especie no encontrada</p>
        <Link href="/identify" className="btn-primary">Identificar especie</Link>
      </div>
    )
  }

  const homeRec = details?.home_recommendation
    ?? ((!species.is_legal || species.safety_level === 'danger') ? 'not_recommended'
      : species.safety_level === 'caution' ? 'possible' : 'recommended')

  const recMap = {
    recommended: { cls: 'bg-green-50 border-green-200', badge: 'bg-green-100 text-green-800', emoji: '🟢', label: 'Recomendado para tener en casa' },
    possible: { cls: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-100 text-yellow-800', emoji: '🟡', label: 'Posible con cuidados especiales' },
    not_recommended: { cls: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-800', emoji: '🔴', label: 'No recomendado o ilegal' },
  }
  const rec = recMap[homeRec]

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/identify" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card mb-6 overflow-hidden p-0">
          <div className="relative h-64 bg-gradient-to-br from-brand-100 to-earth-100">
            {species.image_url ? (
              <Image src={species.image_url} alt={species.common_name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl">
                {species.type === 'animal' ? '🐾' : '🌿'}
              </div>
            )}
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h1 className="text-3xl font-display font-bold text-gray-900">{details?.common_name || species.common_name}</h1>
                <p className="text-gray-400 italic text-sm mt-1">{species.scientific_name}</p>
                {details?.biological_family && (
                  <p className="text-xs text-gray-400 mt-1">Familia: <span className="font-medium text-gray-500">{details.biological_family}</span></p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`badge ${species.type === 'animal' ? 'bg-purple-50 text-purple-700' : 'bg-brand-50 text-brand-700'}`}>
                  {species.type === 'animal' ? <PawPrint className="w-3 h-3" /> : <Leaf className="w-3 h-3" />}
                  {species.type === 'animal' ? 'Animal' : 'Planta'}
                </span>
                {details?.classification && (
                  <span className="badge bg-gray-50 text-gray-600 text-xs">{details.classification}</span>
                )}
                {(details?.is_domestic ?? species.is_domestic) && (
                  <span className="badge bg-blue-50 text-blue-600">🏠 Doméstico</span>
                )}
              </div>
            </div>
            <p className="text-gray-600">{details?.short_desc || species.short_desc}</p>
          </div>
        </motion.div>

        {/* Quick Stats */}
        {details && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mb-6"
          >
            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2 ml-1">Datos clave</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <QuickStat icon={<Clock className="w-4 h-4" />} label="Esperanza de vida" value={details.lifespan} color="bg-teal-100 text-teal-600" />
              <div className="flex flex-col items-start gap-1.5 p-3 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-pink-100 text-pink-600">
                  <Star className="w-4 h-4" />
                </div>
                <span className="text-xs text-gray-400 leading-none">Dificultad</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${difficultyColor[details.care_difficulty?.toLowerCase()] ?? 'bg-gray-100 text-gray-700'}`}>
                  {details.care_difficulty}
                </span>
              </div>
              <QuickStat icon={<Thermometer className="w-4 h-4" />} label="Temperatura" value={details.ideal_temperature} color="bg-orange-100 text-orange-600" />
              <QuickStat icon={<Globe className="w-4 h-4" />} label="Origen" value={details.geographic_origin} color="bg-blue-100 text-blue-600" />
              <QuickStat icon={<Utensils className="w-4 h-4" />} label="Dieta" value={details.diet} color="bg-amber-100 text-amber-600" />
              <QuickStat icon={<Home className="w-4 h-4" />} label="En casa" value={details.is_domestic ? '🏠 Doméstico' : '🌿 Silvestre'} color="bg-purple-100 text-purple-600" />
            </div>
          </motion.div>
        )}

        {/* ✔️ ¿Es buena idea tenerlo en casa? */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`rounded-2xl border-2 p-5 mb-6 ${rec.cls}`}
        >
          <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-2">✔️ ¿Es buena idea tenerlo en casa?</p>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">{rec.emoji}</span>
            <span className={`font-bold text-sm px-3 py-1 rounded-full ${rec.badge}`}>{rec.label}</span>
          </div>
          {details?.recommendation_reason && (
            <p className="text-sm text-gray-600 mt-2 ml-1">{details.recommendation_reason}</p>
          )}
        </motion.div>

        {/* Legal warning */}
        {(!species.is_legal || species.safety_level === 'danger') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6">
            <WarningBanner
              level="danger"
              title="⚠️ Puede no ser adecuado o legal tener esto en casa"
              message={details?.legal_notes || species.legal_notes || 'Esta especie puede estar protegida o tener restricciones legales en muchos países. Consulta la legislación local antes de tenerla.'}
            />
          </motion.div>
        )}

        {/* Loading rich details */}
        {loadingDetails && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center gap-2 text-sm text-brand-600 mb-4">
              <div className="w-4 h-4 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
              Cargando información detallada con IA...
            </div>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </motion.div>
        )}

        {details && (
          <>
            {/* 🧬 Identificación básica */}
            <SectionCard title="🧬 Identificación básica" icon={<BookOpen className="w-4 h-4" />} delay={0.1} color="bg-purple-100 text-purple-600">
              <InfoRow label="Clasificación" value={details.classification} />
              <InfoRow label="Familia biológica" value={details.biological_family} />
              <InfoRow label="Subespecie" value={details.subspecies} />
              <InfoRow label="Razas / Variedades" value={details.known_varieties} />
              <InfoRow label="Origen geográfico" value={details.geographic_origin} />
            </SectionCard>

            {/* 🌍 Hábitat */}
            <SectionCard title="🌍 Hábitat y entorno" icon={<Globe className="w-4 h-4" />} delay={0.15} color="bg-blue-100 text-blue-600">
              <InfoRow label="Hábitat natural" value={details.natural_habitat} />
              <InfoRow label="Continente" value={details.continent} />
              <InfoRow label="Países de origen" value={details.native_countries} />
              <InfoRow label="Clima ideal" value={details.ideal_climate} />
              <InfoRow label="Temperatura" value={details.ideal_temperature} />
              <InfoRow label="Ecosistema" value={details.ecosystem} />
            </SectionCard>

            {/* 🥗 Alimentación */}
            <SectionCard title="🥗 Alimentación" icon={<Utensils className="w-4 h-4" />} delay={0.2} color="bg-orange-100 text-orange-600">
              <InfoRow label="Tipo de dieta" value={details.diet} />
              <InfoRow label="Qué come" value={details.specific_foods} />
              <InfoRow label="Frecuencia" value={details.feeding_frequency} />
              <InfoRow label="Alimentos prohibidos" value={details.forbidden_foods} />
              <InfoRow label="Necesidad de agua" value={details.water_needs} />
            </SectionCard>

            {/* ⏳ Ciclo de vida */}
            <SectionCard title="⏳ Ciclo de vida" icon={<Clock className="w-4 h-4" />} delay={0.25} color="bg-teal-100 text-teal-600">
              <InfoRow label="Esperanza de vida" value={details.lifespan} />
              <InfoRow label="Edad de madurez" value={details.maturity_age} />
              <InfoRow label="Etapas de vida" value={details.life_stages} />
              <InfoRow label="Reproducción" value={details.reproduction_season} />
            </SectionCard>

            {/* 🏠 Cuidados en casa */}
            <SectionCard title="🏠 Cuidados en casa" icon={<Home className="w-4 h-4" />} delay={0.3} color="bg-pink-100 text-pink-600">
              <InfoRow label="Dificultad" value={details.care_difficulty} />
              <InfoRow label="Espacio mínimo" value={details.min_space} />
              <InfoRow label="Necesidad de sol" value={details.sun_needs} />
              <InfoRow label="Humedad" value={details.humidity_needs} />
              <InfoRow label="Limpieza" value={details.cleaning_frequency} />
              <InfoRow label="Necesidades especiales" value={details.special_needs} />
              {details.care_notes && (
                <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600">{details.care_notes}</p>
                </div>
              )}
            </SectionCard>

            {/* 🐾 Comportamiento — solo animales */}
            {species.type === 'animal' && (details.temperament || details.activity_level) && (
              <SectionCard title="🐾 Comportamiento" icon={<PawPrint className="w-4 h-4" />} delay={0.35} color="bg-amber-100 text-amber-600">
                <InfoRow label="Temperamento" value={details.temperament} />
                <InfoRow label="Nivel de actividad" value={details.activity_level} />
                <InfoRow label="Con humanos" value={details.human_compatibility} />
                <InfoRow label="Con niños" value={details.children_compatibility} />
                <InfoRow label="Con otras mascotas" value={details.other_pets_compatibility} />
                <InfoRow label="Nivel de ruido" value={details.noise_level} />
              </SectionCard>
            )}

            {/* 🌿 Cuidados de planta — solo plantas */}
            {species.type === 'plant' && (details.watering_frequency || details.soil_type) && (
              <SectionCard title="🌿 Cuidados de planta" icon={<Leaf className="w-4 h-4" />} delay={0.35} color="bg-green-100 text-green-600">
                <InfoRow label="Frecuencia de riego" value={details.watering_frequency} />
                <InfoRow label="Tipo de suelo" value={details.soil_type} />
                <InfoRow label="Fertilizante" value={details.fertilizer_needs} />
                <InfoRow label="Tipo de maceta" value={details.pot_type} />
                <InfoRow label="Crecimiento anual" value={details.annual_growth} />
                <InfoRow label="Florece" value={details.blooms} />
              </SectionCard>
            )}

            {/* ⚠️ Seguridad y legalidad */}
            <SectionCard title="⚠️ Seguridad y legalidad" icon={<Shield className="w-4 h-4" />} delay={0.4} color="bg-red-100 text-red-600">
              <InfoRow label="Tóxico / Venenoso" value={details.is_toxic} />
              <InfoRow label="Requiere permiso" value={details.requires_permit} />
              <InfoRow label="Especie protegida" value={details.is_protected_species} />
              <InfoRow label="Estado de conservación" value={details.threat_level} />
              {details.legal_notes && (
                <div className="mt-3 p-3 bg-red-50 rounded-xl">
                  <p className="text-sm text-red-700">{details.legal_notes}</p>
                </div>
              )}
            </SectionCard>

            {/* 💡 Datos curiosos */}
            {(details.fun_facts?.length > 0 || details.special_adaptations || details.cultural_history) && (
              <SectionCard title="💡 Datos curiosos" icon={<Star className="w-4 h-4" />} delay={0.45} color="bg-yellow-100 text-yellow-600">
                {details.fun_facts?.length > 0 && (
                  <ul className="space-y-2 mb-3">
                    {details.fun_facts.map((fact, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-yellow-500 shrink-0 mt-0.5">⭐</span>
                        {fact}
                      </li>
                    ))}
                  </ul>
                )}
                <InfoRow label="Adaptaciones" value={details.special_adaptations} />
                <InfoRow label="Historia cultural" value={details.cultural_history} />
              </SectionCard>
            )}
          </>
        )}

        {/* 🌟 Crear mascota virtual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: details ? 0.5 : 0.2 }}
          className="card bg-gradient-to-r from-brand-50 to-earth-50 border border-brand-100"
        >
          <div className="flex items-start gap-4">
            <div className="text-5xl">🌟</div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-xl text-gray-900 mb-1">
                Crea tu mini compañero virtual
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Basado en {species.common_name}, la IA generará recordatorios de cuidado personalizados.
              </p>
              {user ? (
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={creatingPet || petCreated}
                  className="btn-primary flex items-center gap-2"
                >
                  {petCreated ? (
                    <><CheckCircle className="w-4 h-4" /> Mascota creada</>
                  ) : creatingPet ? (
                    <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creando...</>
                  ) : (
                    <><Plus className="w-4 h-4" /> Crear mascota virtual</>
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-white/70 rounded-2xl border border-brand-200">
                  <Lock className="w-4 h-4 text-brand-500 shrink-0" />
                  <p className="text-sm text-gray-600 flex-1">Necesitas una cuenta para crear mascotas virtuales</p>
                  <Link href="/auth" className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1 shrink-0">
                    <Sparkles className="w-3.5 h-3.5" /> Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Confirmation Modal ── */}
      {showConfirmModal && species && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="card max-w-sm w-full text-center shadow-2xl"
          >
            <div className="text-6xl mb-3">🌟</div>
            <h2 className="font-display font-bold text-xl text-gray-900 mb-2">Crear compañero virtual</h2>
            <p className="text-gray-500 text-sm mb-1">
              Crearemos un pequeño compañero basado en
            </p>
            <p className="font-semibold text-brand-600 mb-3">{species.common_name}</p>
            <p className="text-gray-400 text-xs mb-6">
              La IA generará un nombre, personalidad y recordatorios de cuidado personalizados para ti.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="btn-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreatePet}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Crear compañero
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
