import { NextRequest, NextResponse } from 'next/server'
import { identifyFromImage, identifyFromText } from '@/lib/ollama'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let results

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const imageFile = formData.get('image') as File
      if (!imageFile) {
        return NextResponse.json({ error: 'No se encontró imagen' }, { status: 400 })
      }

      const arrayBuffer = await imageFile.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      results = await identifyFromImage(base64)
    } else {
      const body = await req.json()
      const { query } = body
      if (!query?.trim()) {
        return NextResponse.json({ error: 'Query vacío' }, { status: 400 })
      }
      results = await identifyFromText(query)
    }

    const savedResults = []
    for (const r of results.slice(0, 3)) {
      const id = slugify(`${r.common_name}-${r.scientific_name}`)

      const { data: existing } = await supabase
        .from('species')
        .select('id')
        .eq('id', id)
        .single()

      if (!existing) {
        await supabase.from('species').insert({
          id,
          common_name: r.common_name,
          scientific_name: r.scientific_name,
          type: r.type,
          safety_level: r.safety_level,
          is_legal: r.is_legal,
          is_domestic: r.is_domestic,
          short_desc: r.short_desc,
          diet: r.diet,
          lifespan: r.lifespan,
          habitat: r.habitat,
          care_notes: r.care_notes,
          legal_notes: r.legal_notes,
        })
      }

      savedResults.push({ ...r, id })
    }

    return NextResponse.json({ results: savedResults })
  } catch (err: unknown) {
    console.error('[identify]', err)
    const msg = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
