import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getSpeciesDetails } from '@/lib/ollama'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const url = new URL(req.url)
    let common_name = url.searchParams.get('name') || ''
    let scientific_name = url.searchParams.get('scientific') || ''
    let type = (url.searchParams.get('type') || 'animal') as 'animal' | 'plant'

    if (!common_name) {
      const { data } = await supabase
        .from('species')
        .select('common_name, scientific_name, type')
        .eq('id', params.id)
        .single()

      if (data) {
        common_name = data.common_name
        scientific_name = data.scientific_name
        type = data.type
      }
    }

    if (!common_name) {
      return NextResponse.json({ error: 'Especie no encontrada' }, { status: 404 })
    }

    const details = await getSpeciesDetails(common_name, scientific_name, type)
    return NextResponse.json(details)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
