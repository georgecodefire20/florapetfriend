import { NextRequest, NextResponse } from 'next/server'
import { generateVirtualPetName, generateCareReminders } from '@/lib/ollama'
import { supabase } from '@/lib/supabase'
import { getSeason } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const {
      species_id,
      species_name,
      species_type = 'animal',
      species_scientific,
      user_id,
      country = 'MX',
    } = await req.json()

    if (!user_id) {
      return NextResponse.json({ error: 'user_id es requerido' }, { status: 400 })
    }
    if (!species_name) {
      return NextResponse.json({ error: 'species_name es requerido' }, { status: 400 })
    }

    // Build the species ID — prefer the one from the identify flow, fallback to slug
    const finalId: string = species_id ||
      species_name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    // Try to read existing species from DB
    const { data: dbSpecies } = await supabase
      .from('species')
      .select('common_name, type')
      .eq('id', finalId)
      .single()

    const finalName: string = dbSpecies?.common_name ?? species_name
    const finalType: 'animal' | 'plant' = (dbSpecies?.type as 'animal' | 'plant') ?? species_type

    // Ensure species exists so the FK constraint passes.
    // ignoreDuplicates:true → INSERT...ON CONFLICT DO NOTHING (only needs INSERT policy, not UPDATE)
    const { error: upsertErr } = await supabase.from('species').upsert({
      id: finalId,
      common_name: finalName,
      scientific_name: species_scientific || finalName,
      type: finalType,
      safety_level: 'safe',
      is_legal: true,
      is_domestic: finalType === 'animal',
      short_desc: `${finalName} — creado desde ficha educativa`,
    }, { onConflict: 'id', ignoreDuplicates: true })
    if (upsertErr) console.error('[virtual-pet] species upsert:', upsertErr.message)

    const petData = await generateVirtualPetName(finalName, finalType)
    const season = getSeason(country)

    const { data: pet, error: petError } = await supabase
      .from('virtual_pets')
      .insert({
        user_id,
        species_id: finalId,
        name: petData.name,
        personality: petData.personality,
        message: petData.message,
        level: 1,
        happiness: 80,
      })
      .select()
      .single()

    if (petError || !pet) {
      console.error('[virtual-pet] insert error:', petError)
      return NextResponse.json({ error: `Error guardando compañero: ${petError?.message ?? 'desconocido'}` }, { status: 500 })
    }

    const reminderTemplates = await generateCareReminders(
      finalName,
      finalType,
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

    return NextResponse.json({ pet: { ...pet, species_name: finalName }, reminders: remindersToInsert })
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
      .select('*, species(*), reminders(*)')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ pets: data })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { pet_id, avatar_url } = await req.json()
    if (!pet_id) return NextResponse.json({ error: 'pet_id requerido' }, { status: 400 })

    const { error } = await supabase
      .from('virtual_pets')
      .update({ avatar_url })
      .eq('id', pet_id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
