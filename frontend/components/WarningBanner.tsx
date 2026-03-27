'use client'

import { AlertTriangle, XCircle, Info } from 'lucide-react'
import { motion } from 'framer-motion'

type WarningLevel = 'info' | 'caution' | 'danger'

interface WarningBannerProps {
  level: WarningLevel
  title: string
  message: string
  examples?: string[]
}

const config: Record<WarningLevel, { bg: string; border: string; icon: React.ReactNode; textColor: string }> = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    icon: <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />,
    textColor: 'text-blue-800',
  },
  caution: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    icon: <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />,
    textColor: 'text-yellow-800',
  },
  danger: {
    bg: 'bg-red-50',
    border: 'border-red-400',
    icon: <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />,
    textColor: 'text-red-800',
  },
}

export default function WarningBanner({ level, title, message, examples }: WarningBannerProps) {
  const c = config[level]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${c.bg} border-2 ${c.border} rounded-2xl p-4 flex gap-3`}
    >
      {c.icon}
      <div className={c.textColor}>
        <p className="font-semibold mb-1">{title}</p>
        <p className="text-sm">{message}</p>
        {examples && examples.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {examples.map(ex => (
              <span key={ex} className="bg-white/60 rounded-lg px-2 py-0.5 text-xs font-medium">
                {ex}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
