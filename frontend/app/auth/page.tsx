'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Mail, Lock, User, Globe, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import toast from 'react-hot-toast'

const DEMO_USER = { email: 'demo@florapetfriend.site', password: 'demo1234', label: 'Usuario Demo' }
const DEMO_ADMIN = { email: 'admin@florapetfriend.site', password: 'admin1234', label: 'Administrador' }

export default function AuthPage() {
  const router = useRouter()
  const { signIn, signUp } = useAuth()

  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [country, setCountry] = useState('MX')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) { toast.error(error); return }
    toast.success('¡Bienvenido de vuelta!')
    router.push('/identify')
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast.error('Ingresa tu nombre'); return }
    setLoading(true)
    const { error } = await signUp(email, password, name, country)
    setLoading(false)
    if (error) { toast.error(error); return }
    toast.success('¡Cuenta creada! Revisa tu email para confirmar.')
    setTab('login')
  }

  const quickLogin = async (creds: typeof DEMO_USER) => {
    setLoading(true)
    let { error } = await signIn(creds.email, creds.password)
    if (error && error.toLowerCase().includes('invalid')) {
      const name = creds.email.includes('admin') ? 'Administrador' : 'Usuario Demo'
      const { error: signUpError } = await signUp(creds.email, creds.password, name, 'MX')
      if (signUpError) { setLoading(false); toast.error(signUpError); return }
      const { error: loginError } = await signIn(creds.email, creds.password)
      error = loginError
    }
    setLoading(false)
    if (error) { toast.error(error); return }
    toast.success(`Sesión iniciada como ${creds.label}`)
    router.push(creds.email.includes('admin') ? '/admin' : '/identify')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-brand-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-earth-200/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-display font-bold text-2xl">
            <div className="w-10 h-10 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="gradient-text">FloraPetFriend</span>
          </Link>
          <p className="text-gray-500 mt-2 text-sm">Tu compañero inteligente para animales y plantas</p>
        </div>

        {/* Quick access demo */}
        <div className="card mb-6 bg-gradient-to-br from-brand-50 to-earth-50 border border-brand-100">
          <p className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-3">⚡ Acceso rápido para demo</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => quickLogin(DEMO_USER)}
              disabled={loading}
              className="flex flex-col items-center gap-1 p-3 bg-white rounded-2xl border-2 border-brand-100 hover:border-brand-400 transition-all hover:shadow-md text-left"
            >
              <span className="text-2xl">👤</span>
              <span className="text-xs font-bold text-gray-700">Usuario Demo</span>
              <span className="text-xs text-gray-400">demo@florapetfriend.site</span>
            </button>
            <button
              onClick={() => quickLogin(DEMO_ADMIN)}
              disabled={loading}
              className="flex flex-col items-center gap-1 p-3 bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-400 transition-all hover:shadow-md text-left"
            >
              <span className="text-2xl">👑</span>
              <span className="text-xs font-bold text-gray-700">Administrador</span>
              <span className="text-xs text-gray-400">admin@florapetfriend.site</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                  tab === t ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                  {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <>Entrar <ArrowRight className="w-4 h-4" /></>}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Nombre completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text" required value={name} onChange={e => setName(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPass ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Mín. 8 caracteres"
                      minLength={8}
                      className="w-full pl-10 pr-10 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">País</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select value={country} onChange={e => setCountry(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm appearance-none bg-white"
                    >
                      <option value="MX">🇲🇽 México</option>
                      <option value="ES">🇪🇸 España</option>
                      <option value="AR">🇦🇷 Argentina</option>
                      <option value="CO">🇨🇴 Colombia</option>
                      <option value="CL">🇨🇱 Chile</option>
                      <option value="PE">🇵🇪 Perú</option>
                      <option value="US">🇺🇸 Estados Unidos</option>
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                  {loading ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <><Sparkles className="w-4 h-4" /> Crear cuenta</>}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Al registrarte aceptas nuestros términos de uso. © {new Date().getFullYear()} FloraPetFriend
        </p>
      </motion.div>
    </div>
  )
}
