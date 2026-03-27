'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Info, ArrowRight, Leaf, PawPrint } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export type SafetyLevel = 'safe' | 'caution' | 'danger'

export interface SpeciesResult {
  id: string
  common_name: string
  scientific_name: string
  type: 'animal' | 'plant'
  image_url?: string
  safety_level: SafetyLevel
  confidence: number
  short_desc: string
  is_legal: boolean
  is_domestic: boolean
}

const safetyConfig: Record<SafetyLevel, { label: string; color: string; icon: React.ReactNode }> = {
  safe: {
    label: 'Seguro',
    color: 'badge-safe',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  caution: {
    label: 'Precaución',
    color: 'badge-warning',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  danger: {
    label: 'No recomendado',
    color: 'badge-danger',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
}

interface SpeciesCardProps {
  species: SpeciesResult
  index?: number
}

export default function SpeciesCard({ species, index = 0 }: SpeciesCardProps) {
  const safety = safetyConfig[species.safety_level] ?? safetyConfig['safe']

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card-hover flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-4 bg-gray-100">
        {species.image_url ? (
          <Image
            src={species.image_url}
            alt={species.common_name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {species.type === 'animal' ? '🐾' : '🌿'}
          </div>
        )}

        {/* Confidence badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-bold text-gray-700">
          {Math.round((species.confidence ?? 0.8) * 100)}% match
        </div>

        {/* Type badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 text-xs font-medium text-gray-700">
          {species.type === 'animal' ? <PawPrint className="w-3 h-3" /> : <Leaf className="w-3 h-3" />}
          {species.type === 'animal' ? 'Animal' : 'Planta'}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-display font-semibold text-gray-900 text-lg leading-tight">
              {species.common_name}
            </h3>
            <p className="text-xs text-gray-400 italic">{species.scientific_name}</p>
          </div>
          <span className={`badge ${safety.color} shrink-0 mt-0.5`}>
            {safety.icon}
            {safety.label}
          </span>
        </div>

        <p className="text-sm text-gray-500 flex-1 mb-4 line-clamp-2">{species.short_desc}</p>

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {species.is_domestic && (
            <span className="badge bg-blue-50 text-blue-600">
              🏠 Doméstico
            </span>
          )}
          {!species.is_legal && (
            <span className="badge badge-danger">
              ⚠️ Restricciones legales
            </span>
          )}
        </div>

        <Link
          href={`/species/${species.id}`}
          className="btn-primary text-sm w-full flex items-center justify-center gap-2"
        >
          Ver ficha completa
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  )
}
