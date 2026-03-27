'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Leaf, PawPrint, Clock, MapPin, Utensils, Heart,
  ShieldAlert, Plus, CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import WarningBanner from '@/components/WarningBanner'
import toast from 'react-hot-toast'

interface Species {
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

export default function SpeciesDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [species, setSpecies] = useState<Species | null>(null)
  const [loading, setLoading] = useState(true)
  const [creatingPet, setCreatingPet] = useState(false)
  const [petCreated, setPetCreated] = useState(false)

  useEffect(() => {
    fetch(`/api/species/${id}`)
      .then(r => r.json())
      .then(data => { setSpecies(data); setLoading(false) })
      .catch(() => router.push('/identify'))
  }, [id])

  const handleCreatePet = async () => {
    if (!species) return
    setCreatingPet(true)
    try {
      const res = await fetch('/api/virtual-pet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          species_id: species.id,
          user_id: 'anonymous',
          country: navigator.language?.split('-')[1] || 'ES',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`¡${data.pet.name} ha sido creado! 🎉`)
      setPetCreated(true)
      setTimeout(() => router.push('/pets'), 1500)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error creando mascota')
    } finally {
      setCreatingPet(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-14 h-14 border-4 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!species) return null

  const infoCards = [
    { icon: <Utensils className="w-5 h-5" />, label: 'Alimentación', value: species.diet, color: 'bg-earth-50 text-earth-600' },
    { icon: <Clock className="w-5 h-5" />, label: 'Esperanza de vida', value: species.lifespan, color: 'bg-blue-50 text-blue-600' },
    { icon: <MapPin className="w-5 h-5" />, label: 'Hábitat', value: species.habitat, color: 'bg-brand-50 text-brand-600' },
    { icon: <Heart className="w-5 h-5" />, label: 'Cuidados', value: species.care_notes, color: 'bg-pink-50 text-pink-600' },
  ]

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/identify" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>

        {/* Header card */}
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
                <h1 className="text-3xl font-display font-bold text-gray-900">{species.common_name}</h1>
                <p className="text-gray-400 italic text-sm mt-1">{species.scientific_name}</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`badge ${species.type === 'animal' ? 'bg-purple-50 text-purple-700' : 'bg-brand-50 text-brand-700'}`}>
                  {species.type === 'animal' ? <PawPrint className="w-3 h-3" /> : <Leaf className="w-3 h-3" />}
                  {species.type === 'animal' ? 'Animal' : 'Planta'}
                </span>
                {species.is_domestic && (
                  <span className="badge bg-blue-50 text-blue-600">🏠 Doméstico</span>
                )}
              </div>
            </div>
            <p className="text-gray-600">{species.short_desc}</p>
          </div>
        </motion.div>

        {/* Legal warning */}
        {(!species.is_legal || species.safety_level === 'danger') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <WarningBanner
              level="danger"
              title="⚠️ Puede no ser adecuado o legal tener esto en casa"
              message={species.legal_notes || 'Esta especie puede estar protegida o tener restricciones legales en muchos países. Consulta la legislación local antes de tenerla.'}
            />
          </motion.div>
        )}

        {/* Info grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
        >
          {infoCards.map(card => card.value ? (
            <div key={card.label} className="card">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.color}`}>
                  {card.icon}
                </div>
                <span className="font-semibold text-sm text-gray-700">{card.label}</span>
              </div>
              <p className="text-sm text-gray-600">{card.value}</p>
            </div>
          ) : null)}
        </motion.div>

        {/* Create pet CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card bg-gradient-to-r from-brand-50 to-earth-50 border border-brand-100"
        >
          <div className="flex items-start gap-4">
            <div className="text-5xl">🌟</div>
            <div className="flex-1">
              <h3 className="font-display font-bold text-xl text-gray-900 mb-1">
                Crea tu mini compañero virtual
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Basado en {species.common_name}, la IA generará una caricatura única con recordatorios de cuidado personalizados.
              </p>
              <button
                onClick={handleCreatePet}
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
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
