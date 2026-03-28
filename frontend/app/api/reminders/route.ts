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
      .order('completed', { ascending: true })
      .order('time', { ascending: true })

    if (error) throw error
    const mapped = (data || []).map((r: Record<string, unknown>) => {
      const vp = r.virtual_pets as { name?: string } | null
      return { ...r, pet_name: vp?.name ?? null, virtual_pets: undefined }
    })
    return NextResponse.json({ reminders: mapped })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, completed, active } = await req.json()

    if (completed !== undefined) {
      // Mark reminder as completed (stays visible, turns grey)
      const now = new Date().toISOString()
      const { data: reminder, error: fetchErr } = await supabase
        .from('reminders')
        .update({ completed, completed_at: completed ? now : null })
        .eq('id', id)
        .select('pet_id')
        .single()
      if (fetchErr) throw fetchErr
      // Update pet's last_tended_at
      if (completed && reminder?.pet_id) {
        await supabase.from('virtual_pets').update({ last_tended_at: now }).eq('id', reminder.pet_id)
      }
    } else {
      // Toggle active (legacy)
      const { error } = await supabase.from('reminders').update({ active }).eq('id', id)
      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
