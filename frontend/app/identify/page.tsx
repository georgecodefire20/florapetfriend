'use client'

export const dynamic = 'force-dynamic'

import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import IdentifyForm from '@/components/IdentifyForm'

export default function IdentifyPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 bg-brand-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-brand-600" />
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-3">
            Identifica tu especie
          </h1>
          <p className="text-gray-500 text-lg">
            Sube una foto o escribe el nombre de cualquier animal o planta y nuestra IA lo identificará al instante.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <IdentifyForm />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-3 gap-4 text-center"
        >
          {[
            { emoji: '🐕', label: 'Perros' },
            { emoji: '🌵', label: 'Cactus' },
            { emoji: '🐠', label: 'Peces' },
            { emoji: '🌺', label: 'Flores' },
            { emoji: '🦜', label: 'Aves' },
            { emoji: '🐢', label: 'Reptiles' },
          ].map(item => (
            <div key={item.label} className="card p-3 text-center">
              <div className="text-3xl mb-1">{item.emoji}</div>
              <p className="text-xs text-gray-500 font-medium">{item.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
