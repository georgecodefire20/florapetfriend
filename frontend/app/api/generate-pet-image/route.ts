import { NextRequest, NextResponse } from 'next/server'

const FORBIDDEN = [
  'human', 'person', 'people', 'man', 'woman', 'boy', 'girl', 'child', 'baby',
  'body', 'nude', 'naked', 'nsfw', 'sex', 'adult', 'porn',
  'weapon', 'gun', 'knife', 'sword', 'bomb', 'drug', 'blood',
  'death', 'dead', 'skull', 'skeleton', 'gore', 'kill', 'murder', 'violence',
  'face', 'portrait', 'selfie', 'realistic human',
]

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'prompt requerido' }, { status: 400 })
    }

    const lower = prompt.toLowerCase()
    const blocked = FORBIDDEN.find(w => lower.includes(w))
    if (blocked) {
      return NextResponse.json(
        { error: `Contenido no permitido detectado. Solo se permiten animales y plantas.` },
        { status: 400 }
      )
    }

    const safePrompt = [
      'cute chibi kawaii cartoon style, expressive big eyes, animated, colorful, child-friendly, safe for work',
      prompt.trim(),
      'animals or plants only, no humans, no violence, soft pastel colors, sticker art style',
    ].join(', ')

    const encoded = encodeURIComponent(safePrompt)
    const seed = Math.floor(Math.random() * 99999)
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&nologo=true&model=flux-schnell&seed=${seed}`

    // Fetch the image server-side to avoid browser CORS/loading issues
    const imgRes = await fetch(pollinationsUrl, { signal: AbortSignal.timeout(30_000) })
    if (!imgRes.ok) {
      return NextResponse.json({ error: 'No se pudo generar la imagen. Intenta de nuevo.' }, { status: 502 })
    }
    const contentType = imgRes.headers.get('content-type') || 'image/jpeg'
    const arrayBuffer = await imgRes.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const imageUrl = `data:${contentType};base64,${base64}`

    return NextResponse.json({ imageUrl })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
