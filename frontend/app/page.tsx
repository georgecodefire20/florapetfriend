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
  {
    num: '01',
    title: 'Identifica al instante',
    desc: 'Sube una foto o escribe el nombre. Nuestra IA analiza la especie en segundos y genera una ficha completa con hábitat, dieta, legalidad y cuidados.',
    icon: '📸',
    gradient: 'from-brand-500 to-teal-400',
    bg: 'bg-brand-50',
    accent: 'text-brand-600',
    visual: [
      { label: '🐆 Leopardo', sub: 'Panthera pardus', badge: '94% match', color: 'bg-amber-50 border-amber-200' },
      { label: '🌵 Cactus Saguaro', sub: 'Carnegiea gigantea', badge: '89% match', color: 'bg-green-50 border-green-200' },
    ],
  },
  {
    num: '02',
    title: 'Crea tu compañero virtual',
    desc: 'Con un clic genera un avatar único con IA, ponle nombre y personalidad. Tu mascota virtual crece contigo y refleja el estado real de sus cuidados.',
    icon: '🌟',
    gradient: 'from-purple-500 to-pink-400',
    bg: 'bg-purple-50',
    accent: 'text-purple-600',
    visual: [
      { label: '🦁 León — Nivel 3', sub: 'Personalidad: valiente y curioso', badge: '😊 98%', color: 'bg-purple-50 border-purple-200' },
      { label: '🌿 Monstera — Nivel 2', sub: 'Personalidad: tranquila y resiliente', badge: '😊 85%', color: 'bg-pink-50 border-pink-200' },
    ],
  },
  {
    num: '03',
    title: 'Cuida y recibe alertas',
    desc: 'Activa recordatorios automáticos de alimentación, riego y limpieza. Consulta si la especie es legal en tu país y recibe consejos según tu clima.',
    icon: '⏰',
    gradient: 'from-earth-500 to-amber-400',
    bg: 'bg-earth-50',
    accent: 'text-earth-600',
    visual: [
      { label: '🍽️ Alimentación', sub: 'Cada día · 08:00 AM', badge: '✓ Hecho', color: 'bg-green-50 border-green-200' },
      { label: '💧 Riego', sub: 'Cada 3 días · 07:00 AM', badge: '⏳ Pendiente', color: 'bg-blue-50 border-blue-200' },
    ],
  },
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
      <section className="py-20 px-4 bg-gradient-to-b from-white/50 to-gray-50/80">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-block bg-brand-100 text-brand-600 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4 badge-glow">¿Cómo funciona?</span>
            <h2 className="text-4xl font-display font-bold mb-3">
              <span className="animated-title">Tres pasos hacia el cuidado inteligente</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">De la foto a la ficha completa en segundos. Sin complicaciones, solo resultados.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative flex flex-col rounded-3xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-shadow duration-300"
              >
                {/* Step number accent bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r shimmer-bar ${step.gradient}`} />

                {/* Visual mockup area */}
                <div className={`${step.bg} px-5 pt-5 pb-3`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold uppercase tracking-widest ${step.accent}`}>{step.num}</span>
                    <span className="text-2xl animate-float inline-block">{step.icon}</span>
                  </div>
                  {/* Mock UI cards inside container */}
                  <div className="space-y-2">
                    {step.visual.map((v, vi) => (
                      <div key={vi} className={`flex items-center justify-between rounded-xl border px-3 py-2 bg-white/80 ${v.color}`}>
                        <div>
                          <p className="text-xs font-semibold text-gray-800 leading-tight">{v.label}</p>
                          <p className="text-xs text-gray-400">{v.sub}</p>
                        </div>
                        <span className="text-xs font-bold text-gray-600 bg-white rounded-full px-2 py-0.5 shadow-sm border border-gray-100 whitespace-nowrap ml-2">{v.badge}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Text content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-display font-bold text-lg mb-2">
                    <span className="animated-title">{step.title}</span>
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>

                {/* Connecting arrow — hidden on last */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-100 rounded-full shadow items-center justify-center text-gray-400 text-sm">
                    →
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="section-title text-center mb-4">
            <span className="animated-title">Todo lo que necesitas</span>
          </h2>
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
