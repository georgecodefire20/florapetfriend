'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, RefreshCw, Heart, Star, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

export interface VirtualPetData {
  id: string
  name: string
  species_name: string
  avatar_url?: string
  personality: string
  message: string
  level: number
  happiness: number
}

interface VirtualPetProps {
  pet: VirtualPetData
  onRegenerate?: () => void
  compact?: boolean
}

export default function VirtualPet({ pet, onRegenerate, compact = false }: VirtualPetProps) {
  const [showMessage, setShowMessage] = useState(true)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`card text-center ${compact ? 'p-4' : 'p-8'}`}
    >
      {/* Avatar */}
      <div className="relative inline-block mb-4">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className={`${compact ? 'w-20 h-20' : 'w-32 h-32'} mx-auto rounded-full overflow-hidden bg-gradient-to-br from-brand-100 to-earth-100 border-4 border-white shadow-glow flex items-center justify-center`}
        >
          {pet.avatar_url ? (
            <Image
              src={pet.avatar_url}
              alt={pet.name}
              width={compact ? 80 : 128}
              height={compact ? 80 : 128}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className={`${compact ? 'text-4xl' : 'text-6xl'}`}>🐾</span>
          )}
        </motion.div>

        {/* Level badge */}
        <div className="absolute -top-1 -right-1 bg-brand-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
          {pet.level}
        </div>
      </div>

      {/* Name & Species */}
      <h3 className={`font-display font-bold text-gray-900 ${compact ? 'text-lg' : 'text-2xl'} mb-1`}>
        {pet.name}
      </h3>
      <p className="text-sm text-gray-400 italic mb-3">{pet.species_name}</p>

      {/* Happiness bar */}
      <div className="flex items-center gap-2 justify-center mb-4">
        <Heart className="w-4 h-4 text-red-400" />
        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pet.happiness}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-red-400 to-brand-400 rounded-full"
          />
        </div>
        <span className="text-xs text-gray-500">{pet.happiness}%</span>
      </div>

      {/* Personality tag */}
      <div className="flex items-center justify-center gap-1 mb-4">
        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
        <span className="text-xs text-gray-500">{pet.personality}</span>
      </div>

      {/* Speech bubble */}
      {showMessage && !compact && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-50 border border-brand-200 rounded-2xl p-4 text-sm text-brand-800 italic relative mb-4"
        >
          <MessageCircle className="w-4 h-4 text-brand-400 mb-1 mx-auto" />
          "{pet.message}"
        </motion.div>
      )}

      {/* Actions */}
      {!compact && onRegenerate && (
        <button
          onClick={onRegenerate}
          className="btn-secondary text-sm flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Regenerar avatar
        </button>
      )}

      {compact && (
        <div className="flex items-center justify-center gap-1 text-xs text-brand-600 font-medium">
          <Sparkles className="w-3 h-3" />
          Compañero virtual
        </div>
      )}
    </motion.div>
  )
}
