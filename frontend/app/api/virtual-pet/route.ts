import { NextRequest, NextResponse } from 'next/server'
import { generateVirtualPetName, generateCareReminders } from '@/lib/ollama'
import { supabase } from '@/lib/supabase'
import { getSeason } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const { species_id, user_id, country = 'ES' } = await req.json()

    if (!species_id || !user_id) {
      return NextResponse.json({ error: 'species_id y user_id son requeridos' }, { status: 400 })
    }

    const { data: species, error: speciesError } = await supabase
      .from('species')
      .select('*')
      .eq('id', species_id)
      .single()

    if (speciesError || !species) {
      return NextResponse.json({ error: 'Especie no encontrada' }, { status: 404 })
    }

    const petData = await generateVirtualPetName(species.common_name, species.type)
    const season = getSeason(country)

    const { data: pet, error: petError } = await supabase
      .from('virtual_pets')
      .insert({
        user_id,
        species_id,
        name: petData.name,
        personality: petData.personality,
        message: petData.message,
        level: 1,
        happiness: 80,
      })
      .select()
      .single()

    if (petError || !pet) {
      return NextResponse.json({ error: 'Error creando mascota virtual' }, { status: 500 })
    }

    const reminderTemplates = await generateCareReminders(
      species.common_name,
      species.type,
      country,
      season
    )

    const remindersToInsert = reminderTemplates.map(r => ({
      user_id,
      pet_id: pet.id,
      type: r.type as 'food' | 'sun' | 'water' | 'cleaning' | 'other',
      label: r.label,
      time: r.time,
      frequency: r.frequency,
      active: true,
    }))

    if (remindersToInsert.length > 0) {
      await supabase.from('reminders').insert(remindersToInsert)
    }

    return NextResponse.json({ pet, reminders: remindersToInsert })
  } catch (err: unknown) {
    console.error('[virtual-pet]', err)
    const msg = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json({ error: 'user_id requerido' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('virtual_pets')
      .select('*, species(*)')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ pets: data })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
