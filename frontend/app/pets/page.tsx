'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Bell, Star, Heart, MessageCircle, Search, Lock, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'

interface Reminder {
  id: string
  type: string
  label: string
  time: string
  frequency: string
}

interface CompanionData {
  id: string
  name: string
  personality: string
  message: string
  level: number
  happiness: number
  avatar_url?: string
  species?: { common_name: string; type: string; image_url?: string }
  reminders?: Reminder[]
}

const typeEmoji: Record<string, string> = {
  animal: '🐾',
  plant: '🌿',
}

const reminderIcon: Record<string, string> = {
  food: '🍽️',
  water: '💧',
  sun: '☀️',
  cleaning: '🧹',
  other: '📋',
}

export default function PetsPage() {
  const { user, loading: authLoading } = useAuth()
  const [companions, setCompanions] = useState<CompanionData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { setLoading(false); return }
    fetch(`/api/virtual-pet?user_id=${user.id}`)
      .then(r => r.json())
      .then(data => { setCompanions(data.pets || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user, authLoading])

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card max-w-md w-full text-center py-12">
          <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-brand-600" />
          </div>
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Área privada</h2>
          <p className="text-gray-500 mb-6">Necesitas una cuenta para ver tus compañeros virtuales y recordatorios de cuidado.</p>
          <div className="flex flex-col gap-3">
            <Link href="/auth" className="btn-primary flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" /> Crear cuenta gratis
            </Link>
            <Link href="/auth" className="btn-secondary text-sm">Ya tengo cuenta — Iniciar sesión</Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 flex items-center gap-2">
              <span className="text-3xl">🌟</span>
              Mi Compañero Virtual
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              {companions.length === 0 ? 'Ningún compañero aún' : `${companions.length} compañero${companions.length > 1 ? 's' : ''} activo${companions.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <Link href="/identify" className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            Nuevo
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-12 h-12 border-4 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Cargando compañeros...</p>
          </div>
        ) : companions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card text-center py-16"
          >
            <div className="text-7xl mb-4">🐣</div>
            <h2 className="text-xl font-display font-bold text-gray-800 mb-2">
              Aún no tienes compañero virtual
            </h2>
            <p className="text-gray-500 mb-6 max-w-xs mx-auto text-sm">
              Identifica un animal o planta y crea tu primer compañero educativo con recordatorios personalizados.
            </p>
            <Link href="/identify" className="btn-primary inline-flex items-center gap-2">
              <Search className="w-4 h-4" />
              Identificar mi primera especie
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-6">
            {companions.map((companion, i) => (
              <motion.div
                key={companion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card"
              >
                {/* Top: Avatar + Name + Species */}
                <div className="flex items-center gap-5 mb-5">
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative"
                  >
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-100 to-earth-100 border-2 border-white shadow-glow flex items-center justify-center text-5xl">
                      {companion.avatar_url
                        ? <img src={companion.avatar_url} alt={companion.name} className="w-full h-full object-cover rounded-2xl" />
                        : typeEmoji[companion.species?.type ?? 'animal']}
                    </div>
                    <div className="absolute -top-2 -right-2 bg-brand-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                      {companion.level}
                    </div>
                  </motion.div>

                  <div className="flex-1">
                    <h2 className="text-2xl font-display font-bold text-gray-900">{companion.name}</h2>
                    <p className="text-sm text-gray-400 italic">{companion.species?.common_name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs text-gray-500">{companion.personality}</span>
                    </div>
                  </div>
                </div>

                {/* Happiness bar */}
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="w-4 h-4 text-red-400 shrink-0" />
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${companion.happiness}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-red-400 to-brand-400 rounded-full"
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-8 text-right">{companion.happiness}%</span>
                </div>

                {/* Speech bubble */}
                <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 mb-4 flex gap-3">
                  <MessageCircle className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-brand-800 italic">"{companion.message}"</p>
                </div>

                {/* Reminders preview */}
                {companion.reminders && companion.reminders.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">Recordatorios de cuidado</p>
                    <div className="space-y-2">
                      {companion.reminders.slice(0, 3).map(r => (
                        <div key={r.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl">
                          <span className="text-lg">{reminderIcon[r.type] ?? '📋'}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700">{r.label}</p>
                            <p className="text-xs text-gray-400">{r.time} · {r.frequency}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/reminders"
                    className="btn-secondary flex items-center justify-center gap-2 text-sm"
                  >
                    <Bell className="w-4 h-4" />
                    Recordatorios
                  </Link>
                  <Link
                    href="/identify"
                    className="btn-secondary flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo compañero
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
