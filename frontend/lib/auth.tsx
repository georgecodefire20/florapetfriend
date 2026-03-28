'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { User, Session } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey)

export type Role = 'user' | 'admin'

interface AuthContextType {
  user: User | null
  session: Session | null
  role: Role | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, name: string, country: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

async function fetchRole(userId: string): Promise<Role> {
  const { data } = await supabaseBrowser
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  return (data?.role as Role) ?? 'user'
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        const r = await fetchRole(session.user.id)
        setRole(r)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchRole(session.user.id).then(setRole)
      else setRole(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signUp = async (email: string, password: string, name: string, country: string) => {
    const { error, data } = await supabaseBrowser.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, country } },
    })
    if (!error && data.user) {
      await supabaseBrowser.from('profiles').upsert({
        id: data.user.id,
        username: email,
        full_name: name,
        country,
        role: 'user',
      }, { onConflict: 'id', ignoreDuplicates: true })
    }
    return { error: error?.message ?? null }
  }

  const signOut = async () => {
    await supabaseBrowser.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, role, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
