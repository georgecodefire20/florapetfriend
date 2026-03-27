'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Plus } from 'lucide-react'
import Link from 'next/link'
import ReminderCard, { type Reminder } from '@/components/ReminderCard'

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reminders?user_id=anonymous')
      .then(r => r.json())
      .then(data => {
        setReminders(data.reminders || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleToggle = async (id: string) => {
    const reminder = reminders.find(r => r.id === id)
    if (!reminder) return
    await fetch('/api/reminders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, active: !reminder.done }),
    })
  }

  const grouped = reminders.reduce<Record<string, Reminder[]>>((acc, r) => {
    const key = r.pet_name || 'Sin mascota'
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {})

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-7 h-7 text-brand-500" />
              Recordatorios
            </h1>
            <p className="text-gray-500 mt-1">{reminders.length} recordatorio(s) activo(s)</p>
          </div>
          <Link href="/identify" className="btn-secondary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" />
            Nueva mascota
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-12 h-12 border-4 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : reminders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card text-center py-16"
          >
            <div className="text-6xl mb-4">⏰</div>
            <h2 className="text-xl font-display font-bold text-gray-800 mb-2">
              No tienes recordatorios
            </h2>
            <p className="text-gray-500 mb-6">
              Crea una mascota virtual y los recordatorios se generarán automáticamente.
            </p>
            <Link href="/identify" className="btn-primary inline-flex items-center gap-2">
              Empezar ahora
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([petName, petReminders]) => (
              <div key={petName}>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">
                  {petName}
                </h2>
                <div className="space-y-3">
                  {petReminders.map((reminder, i) => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      onToggle={handleToggle}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
