import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json({ error: 'user_id requerido' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('reminders')
      .select('*, virtual_pets(name, species(common_name))')
      .eq('user_id', user_id)
      .eq('active', true)
      .order('time', { ascending: true })

    if (error) throw error
    return NextResponse.json({ reminders: data })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, active } = await req.json()

    const { error } = await supabase
      .from('reminders')
      .update({ active })
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
