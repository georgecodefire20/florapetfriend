'use client'

import { motion } from 'framer-motion'
import { Clock, Sun, Droplets, Utensils, Scissors, Check } from 'lucide-react'
import { useState } from 'react'

export type ReminderType = 'food' | 'sun' | 'water' | 'cleaning' | 'other'

export interface Reminder {
  id: string
  type: ReminderType
  label: string
  time: string
  frequency: string
  active?: boolean
  done?: boolean
  pet_name?: string
}

const iconMap: Record<ReminderType, { icon: React.ReactNode; color: string; bg: string }> = {
  food: { icon: <Utensils className="w-5 h-5" />, color: 'text-earth-600', bg: 'bg-earth-50' },
  sun: { icon: <Sun className="w-5 h-5" />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  water: { icon: <Droplets className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50' },
  cleaning: { icon: <Scissors className="w-5 h-5" />, color: 'text-purple-600', bg: 'bg-purple-50' },
  other: { icon: <Clock className="w-5 h-5" />, color: 'text-gray-600', bg: 'bg-gray-50' },
}

interface ReminderCardProps {
  reminder: Reminder
  onToggle?: (id: string) => void
  index?: number
}

export default function ReminderCard({ reminder, onToggle, index = 0 }: ReminderCardProps) {
  const [done, setDone] = useState(reminder.done ?? !(reminder.active ?? true))
  const ic = iconMap[reminder.type]

  const handleToggle = () => {
    setDone(prev => !prev)
    onToggle?.(reminder.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`card flex items-center gap-4 transition-all duration-200 ${done ? 'opacity-60' : ''}`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${ic.bg} ${ic.color}`}>
        {ic.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className={`font-semibold text-gray-800 ${done ? 'line-through' : ''}`}>{reminder.label}</p>
          {reminder.pet_name && (
            <span className="badge bg-brand-50 text-brand-600 text-xs">{reminder.pet_name}</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {reminder.time}
          </span>
          <span>{reminder.frequency}</span>
        </div>
      </div>

      <button
        onClick={handleToggle}
        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 shrink-0 ${
          done
            ? 'bg-brand-500 border-brand-500 text-white'
            : 'border-gray-200 hover:border-brand-400 text-transparent hover:text-brand-400'
        }`}
      >
        <Check className="w-4 h-4" />
      </button>
    </motion.div>
  )
}
