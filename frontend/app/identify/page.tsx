'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Leaf, Camera, Star } from 'lucide-react'
import IdentifyForm from '@/components/IdentifyForm'

function WelcomeModal({ onClose }: { onClose: () => void }) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="pointer-events-auto w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-brand-100 overflow-hidden"
        >
          <div className="bg-gradient-to-br from-brand-500 to-brand-600 px-5 pt-5 pb-4 relative">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-white font-display font-bold text-lg leading-tight">¡Bienvenido a FloraPetFriend!</h2>
            <p className="text-brand-100 text-xs mt-1">Tu compañero inteligente para animales y plantas 🌿</p>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div className="flex items-start gap-3">
              <Camera className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-600">Sube una foto y la IA identificará cualquier especie al instante.</p>
            </div>
            <div className="flex items-start gap-3">
              <Star className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-600">Guarda tus favoritos, crea recordatorios y explora el catálogo.</p>
            </div>
            <button
              onClick={onClose}
              className="btn-primary w-full py-2.5 text-sm mt-1"
            >
              ¡Empecemos!
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default function IdentifyPage() {
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('fpf_show_welcome') === '1') {
      localStorage.removeItem('fpf_show_welcome')
      setShowWelcome(true)
    }
  }, [])

  return (
    <>
    {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
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
    </>
  )
}
