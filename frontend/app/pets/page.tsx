'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { PawPrint, Plus, Leaf } from 'lucide-react'
import Link from 'next/link'
import VirtualPet, { type VirtualPetData } from '@/components/VirtualPet'

export default function PetsPage() {
  const [pets, setPets] = useState<VirtualPetData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/virtual-pet?user_id=anonymous')
      .then(r => r.json())
      .then(data => { setPets(data.pets || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 flex items-center gap-2">
              <PawPrint className="w-8 h-8 text-brand-500" />
              Mis Mascotas Virtuales
            </h1>
            <p className="text-gray-500 mt-1">{pets.length} compañero(s) creado(s)</p>
          </div>
          <Link href="/identify" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nueva mascota
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-12 h-12 border-4 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
          </div>
        ) : pets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card text-center py-16"
          >
            <div className="text-6xl mb-4">🐣</div>
            <h2 className="text-xl font-display font-bold text-gray-800 mb-2">
              Aún no tienes mascotas virtuales
            </h2>
            <p className="text-gray-500 mb-6">
              Identifica un animal o planta para crear tu primer compañero virtual educativo.
            </p>
            <Link href="/identify" className="btn-primary inline-flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              Identificar mi primera especie
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet, i) => (
              <motion.div
                key={pet.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <VirtualPet pet={pet} compact={false} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
