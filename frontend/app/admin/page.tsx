'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, Leaf, BarChart2, LogOut, Shield, Trash2, UserCheck, UserX } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth, supabaseBrowser } from '@/lib/auth'
import toast from 'react-hot-toast'

interface Profile { id: string; username: string; full_name: string; country: string; role: string; created_at: string }
interface SearchEntry { id: string; user_id: string; query: string; result_type: string; created_at: string }
interface SpeciesRow { id: string; common_name: string; type: string; safety_level: string; created_at: string }

export default function AdminPage() {
  const { user, role, loading, signOut } = useAuth()
  const router = useRouter()

  const [tab, setTab] = useState<'dashboard' | 'users' | 'searches' | 'species'>('dashboard')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [searches, setSearches] = useState<SearchEntry[]>([])
  const [species, setSpecies] = useState<SpeciesRow[]>([])
  const [stats, setStats] = useState({ users: 0, searches: 0, species: 0, pets: 0 })
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading && (!user || role !== 'admin')) {
      toast.error('Acceso restringido a administradores')
      router.push('/auth')
    }
  }, [user, role, loading, router])

  useEffect(() => {
    if (role !== 'admin') return
    const load = async () => {
      setDataLoading(true)
      const [p, s, sp, pets] = await Promise.all([
        supabaseBrowser.from('profiles').select('*').order('created_at', { ascending: false }),
        supabaseBrowser.from('search_history').select('*').order('created_at', { ascending: false }).limit(100),
        supabaseBrowser.from('species').select('id, common_name, type, safety_level, created_at').order('created_at', { ascending: false }),
        supabaseBrowser.from('virtual_pets').select('id', { count: 'exact', head: true }),
      ])
      setProfiles((p.data ?? []) as Profile[])
      setSearches((s.data ?? []) as SearchEntry[])
      setSpecies((sp.data ?? []) as SpeciesRow[])
      setStats({
        users: p.data?.length ?? 0,
        searches: s.data?.length ?? 0,
        species: sp.data?.length ?? 0,
        pets: (pets.count ?? 0),
      })
      setDataLoading(false)
    }
    load()
  }, [role])

  const setUserRole = async (id: string, newRole: string) => {
    const { error } = await supabaseBrowser.from('profiles').update({ role: newRole }).eq('id', id)
    if (error) { toast.error(error.message); return }
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, role: newRole } : p))
    toast.success(`Rol actualizado a ${newRole}`)
  }

  const deleteUser = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este usuario?')) return
    await supabaseBrowser.from('profiles').delete().eq('id', id)
    setProfiles(prev => prev.filter(p => p.id !== id))
    toast.success('Usuario eliminado')
  }

  if (loading || (!user && !loading)) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
    </div>
  )

  const statCards = [
    { label: 'Usuarios', value: stats.users, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Búsquedas', value: stats.searches, icon: Search, color: 'bg-green-50 text-green-600' },
    { label: 'Especies', value: stats.species, icon: Leaf, color: 'bg-brand-50 text-brand-600' },
    { label: 'Mascotas virtuales', value: stats.pets, icon: BarChart2, color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-gray-900">Panel Admin</h1>
            <p className="text-xs text-gray-500">FloraPetFriend</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 hidden sm:block">{user?.email}</span>
          <button onClick={async () => { await signOut(); router.push('/') }} className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors">
            <LogOut className="w-4 h-4" /> Salir
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-52 min-h-screen bg-white border-r border-gray-200 p-4 hidden md:block">
          <nav className="space-y-1">
            {([
              { key: 'dashboard', label: 'Dashboard', icon: BarChart2 },
              { key: 'users', label: 'Usuarios', icon: Users },
              { key: 'searches', label: 'Búsquedas', icon: Search },
              { key: 'species', label: 'Especies', icon: Leaf },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  tab === key ? 'bg-brand-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6">
          {dataLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {tab === 'dashboard' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-display font-bold text-gray-900 mb-6">Dashboard</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {statCards.map((s, i) => (
                      <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                          <s.icon className="w-5 h-5" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                        <div className="text-sm text-gray-500">{s.label}</div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="bg-white rounded-2xl border border-gray-200 p-5">
                    <h3 className="font-semibold text-gray-700 mb-3">Búsquedas recientes</h3>
                    <div className="space-y-2">
                      {searches.slice(0, 8).map(s => (
                        <div key={s.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50">
                          <span className="text-gray-700 font-medium">{s.query || '(imagen)'}</span>
                          <span className="text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString('es')}</span>
                        </div>
                      ))}
                      {searches.length === 0 && <p className="text-gray-400 text-sm">Sin búsquedas aún</p>}
                    </div>
                  </div>
                </motion.div>
              )}

              {tab === 'users' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-display font-bold text-gray-900 mb-6">Usuarios ({profiles.length})</h2>
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          {['Nombre', 'Email', 'País', 'Rol', 'Fecha', 'Acciones'].map(h => (
                            <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {profiles.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{p.full_name || '—'}</td>
                            <td className="px-4 py-3 text-gray-600">{p.username}</td>
                            <td className="px-4 py-3 text-gray-600">{p.country || '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                {p.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-400">{new Date(p.created_at).toLocaleDateString('es')}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {p.role === 'user' ? (
                                  <button onClick={() => setUserRole(p.id, 'admin')} title="Hacer admin" className="p-1 hover:text-purple-600 text-gray-400 transition-colors"><UserCheck className="w-4 h-4" /></button>
                                ) : (
                                  <button onClick={() => setUserRole(p.id, 'user')} title="Quitar admin" className="p-1 hover:text-gray-700 text-purple-500 transition-colors"><UserX className="w-4 h-4" /></button>
                                )}
                                <button onClick={() => deleteUser(p.id)} title="Eliminar" className="p-1 hover:text-red-600 text-gray-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {profiles.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Sin usuarios registrados</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {tab === 'searches' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-display font-bold text-gray-900 mb-6">Búsquedas ({searches.length})</h2>
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          {['Consulta', 'Tipo', 'Fecha'].map(h => (
                            <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {searches.map(s => (
                          <tr key={s.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{s.query || '(imagen)'}</td>
                            <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.result_type === 'animal' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>{s.result_type || '—'}</span></td>
                            <td className="px-4 py-3 text-gray-400">{new Date(s.created_at).toLocaleDateString('es')}</td>
                          </tr>
                        ))}
                        {searches.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">Sin búsquedas aún</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {tab === 'species' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-display font-bold text-gray-900 mb-6">Especies ({species.length})</h2>
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          {['ID', 'Nombre', 'Tipo', 'Nivel seguridad', 'Fecha'].map(h => (
                            <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {species.map(s => (
                          <tr key={s.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-400 font-mono text-xs">{s.id}</td>
                            <td className="px-4 py-3 font-medium text-gray-900">{s.common_name}</td>
                            <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.type === 'animal' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>{s.type}</span></td>
                            <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.safety_level === 'safe' ? 'bg-green-100 text-green-700' : s.safety_level === 'caution' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{s.safety_level}</span></td>
                            <td className="px-4 py-3 text-gray-400">{new Date(s.created_at).toLocaleDateString('es')}</td>
                          </tr>
                        ))}
                        {species.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Sin especies aún</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
