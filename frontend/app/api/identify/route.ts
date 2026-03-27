import { NextRequest, NextResponse } from 'next/server'
import { identifyFromImage, identifyFromText } from '@/lib/ollama'
import { supabase } from '@/lib/supabase'
import { slugify } from '@/lib/utils'

async function fetchWikipediaImage(scientificName: string, commonName: string): Promise<string | null> {
  const tryRestSummary = async (title: string) => {
    try {
      const slug = encodeURIComponent(title.trim().replace(/ /g, '_'))
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`, {
        headers: { 'User-Agent': 'FloraPetFriend/1.0' },
      })
      if (!res.ok) return null
      const data = await res.json()
      return (data?.thumbnail?.source as string) ?? null
    } catch {
      return null
    }
  }

  const trySearch = async (query: string) => {
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=1&format=json&origin=*`
      const res = await fetch(url)
      if (!res.ok) return null
      const data = await res.json()
      const title: string | undefined = data?.query?.search?.[0]?.title
      if (!title) return null
      return tryRestSummary(title)
    } catch {
      return null
    }
  }

  return (
    (await tryRestSummary(scientificName)) ??
    (await trySearch(scientificName)) ??
    (await trySearch(commonName))
  )
}

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
      const image_url = await fetchWikipediaImage(r.scientific_name, r.common_name)

      await supabase.from('species').upsert({
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
        ...(image_url ? { image_url } : {}),
      })

      savedResults.push({ ...r, id, image_url })
    }

    return NextResponse.json({ results: savedResults })
  } catch (err: unknown) {
    console.error('[identify]', err)
    const msg = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
