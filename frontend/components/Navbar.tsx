'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { PawPrint, Menu, X, Leaf, Home, Search, Star, Bell, Shield, LogOut, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth'

const navLinks = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/identify', label: 'Identificar', icon: Search },
  { href: '/pets', label: 'Mi Compañero', icon: PawPrint },
  { href: '/reminders', label: 'Recordatorios', icon: Bell },
  { href: '/explore', label: 'Explorar', icon: Star },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, role, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl">
          <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center shadow-sm">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <span className="gradient-text">FloraPetFriend</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                pathname === href ? 'bg-brand-500 text-white shadow-sm' : 'text-gray-600 hover:bg-brand-50 hover:text-brand-700'
              }`}
            >{label}</Link>
          ))}
          {role === 'admin' && (
            <Link href="/admin"
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                pathname === '/admin' ? 'bg-purple-600 text-white shadow-sm' : 'text-purple-600 hover:bg-purple-50'
              }`}
            ><Shield className="w-3.5 h-3.5" />Admin</Link>
          )}
        </nav>

        {/* Auth + Mobile toggle */}
        <div className="flex items-center gap-2">
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-xl text-sm text-gray-700">
                <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
                <span className="max-w-[120px] truncate">{user.email?.split('@')[0]}</span>
              </div>
              <button onClick={handleSignOut} className="p-2 rounded-xl hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors" title="Cerrar sesión">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link href="/auth" className="hidden md:flex btn-primary py-2 px-4 text-sm items-center gap-1">
              <User className="w-4 h-4" />
              Entrar
            </Link>
          )}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-xl hover:bg-brand-50 text-gray-600 transition-colors" aria-label="Toggle menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/40 bg-white/90 backdrop-blur-md"
          >
            <nav className="px-4 py-3 flex flex-col gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === href ? 'bg-brand-500 text-white' : 'text-gray-700 hover:bg-brand-50'}`}
                ><Icon className="w-4 h-4" />{label}</Link>
              ))}
              {role === 'admin' && (
                <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-purple-600 hover:bg-purple-50">
                  <Shield className="w-4 h-4" />Panel Admin
                </Link>
              )}
              {user ? (
                <button onClick={() => { handleSignOut(); setOpen(false) }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">
                  <LogOut className="w-4 h-4" />Cerrar sesión
                </button>
              ) : (
                <Link href="/auth" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-brand-500 text-white">
                  <User className="w-4 h-4" />Iniciar sesión
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
