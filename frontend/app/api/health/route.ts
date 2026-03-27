import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '(no configurada)'
  const hasAnonKey = !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const hasGroqKey = !!(process.env.GROQ_API_KEY)

  // Test Supabase connectivity
  let dbStatus = 'unknown'
  let dbError = ''
  try {
    const { data, error } = await supabase.from('species').select('id').limit(1)
    if (error) { dbStatus = 'error'; dbError = error.message }
    else { dbStatus = 'ok'; }
  } catch (e: unknown) {
    dbStatus = 'fetch_failed'
    dbError = e instanceof Error ? e.message : String(e)
  }

  return NextResponse.json({
    supabase_url: supabaseUrl,
    has_anon_key: hasAnonKey,
    has_groq_key: hasGroqKey,
    db_status: dbStatus,
    db_error: dbError || null,
  })
}
