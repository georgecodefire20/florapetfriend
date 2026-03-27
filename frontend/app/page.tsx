'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Leaf, PawPrint, Sparkles, Camera, Search, ArrowRight, Shield, Clock, Globe } from 'lucide-react'
import Link from 'next/link'
import IdentifyForm from '@/components/IdentifyForm'

const features = [
  {
    icon: <Camera className="w-6 h-6" />,
    title: 'Identificación Visual',
    desc: 'Sube una foto y nuestra IA identifica la especie en segundos.',
    color: 'bg-brand-50 text-brand-600',
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'Mascota Virtual',
    desc: 'Genera una caricatura única de tu animal o planta con IA.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: 'Recordatorios',
    desc: 'Recibe alertas automáticas de comida, riego y cuidados.',
    color: 'bg-earth-50 text-earth-600',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Control Legal',
    desc: 'Sabe si un animal o planta es legal de tener en tu país.',
    color: 'bg-red-50 text-red-600',
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Adaptado a tu Clima',
    desc: 'Recomendaciones según tu estación del año y ubicación.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: <Search className="w-6 h-6" />,
    title: 'Base de Conocimiento',
    desc: 'Información detallada generada por IA sobre cada especie.',
    color: 'bg-yellow-50 text-yellow-600',
  },
]

const steps = [
  { num: '01', title: 'Sube una imagen o escribe el nombre', icon: '📸' },
  { num: '02', title: 'La IA identifica la especie', icon: '🤖' },
  { num: '03', title: 'Explora la ficha completa', icon: '📋' },
  { num: '04', title: 'Crea tu mini compañero virtual', icon: '🌟' },
  { num: '05', title: 'Recibe recordatorios automáticos', icon: '⏰' },
]

export default function HomePage() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-16 pb-24 text-center">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-earth-200/20 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex justify-center gap-3 mb-6">
            <span className="animate-float text-5xl">🌿</span>
            <span className="animate-float text-5xl" style={{ animationDelay: '0.5s' }}>🐾</span>
            <span className="animate-float text-5xl" style={{ animationDelay: '1s' }}>🌸</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold text-gray-900 mb-6 leading-tight">
            Flora<span className="gradient-text">Pet</span>Friend
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-2xl mx-auto">
            Identifica cualquier animal o planta con IA y conviértelo en tu compañero virtual educativo.
          </p>

          <p className="text-base text-gray-500 mb-10 max-w-xl mx-auto">
            Recibe cuidados personalizados, recordatorios automáticos y sabe si es legal tenerlo en tu país.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary text-lg flex items-center gap-2 justify-center"
            >
              <Sparkles className="w-5 h-5" />
              Pruébalo ahora
            </button>
            <Link href="/auth" className="btn-secondary text-lg flex items-center gap-2 justify-center">
              Crear cuenta gratis
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>

        {/* Identify Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 max-w-2xl mx-auto"
          >
            <IdentifyForm />
          </motion.div>
        )}

        {!showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12 max-w-2xl mx-auto"
          >
            <IdentifyForm />
          </motion.div>
        )}
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-white/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="section-title text-center mb-4">¿Cómo funciona?</h2>
          <p className="text-center text-gray-500 mb-12">Cinco pasos simples hacia el cuidado inteligente</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card text-center"
              >
                <div className="text-4xl mb-3">{step.icon}</div>
                <div className="text-xs font-bold text-brand-400 mb-2">{step.num}</div>
                <p className="text-sm font-semibold text-gray-700">{step.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="section-title text-center mb-4">Todo lo que necesitas</h2>
          <p className="text-center text-gray-500 mb-12">Potenciado por IA, pensado para ti</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-hover"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${f.color}`}>
                  {f.icon}
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="card bg-gradient-to-br from-brand-500 to-brand-600 text-white mb-6">
            <div className="text-5xl mb-4">🐾🌿</div>
            <h2 className="text-3xl font-display font-bold mb-4">¿Listo para descubrir el mundo animal y vegetal?</h2>
            <p className="text-brand-100 mb-8 text-lg">
              Crea tu cuenta gratis y empieza a identificar, aprender y cuidar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth" className="bg-white text-brand-600 font-bold py-3 px-6 rounded-2xl hover:bg-brand-50 transition-colors flex items-center gap-2 justify-center">
                <Sparkles className="w-5 h-5" />
                Crear cuenta gratis
              </Link>
              <Link href="/identify" className="border-2 border-white/40 text-white font-bold py-3 px-6 rounded-2xl hover:bg-white/10 transition-colors flex items-center gap-2 justify-center">
                <Leaf className="w-5 h-5" />
                Probar sin cuenta
              </Link>
            </div>
          </div>
          <p className="text-xs text-gray-400">Acceso rápido demo: <strong>demo@florapetfriend.site</strong> / <strong>demo1234</strong></p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-sm text-gray-400 border-t border-gray-100">
        <div className="flex justify-center items-center gap-2 mb-2">
          <PawPrint className="w-4 h-4 text-brand-400" />
          <span className="font-semibold text-gray-600">FloraPetFriend</span>
        </div>
        <p>© {new Date().getFullYear()} florapetfriend.site — Hecho con ❤️ e IA</p>
      </footer>
    </div>
  )
}
