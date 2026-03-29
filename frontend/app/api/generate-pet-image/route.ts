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
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encoded}?width=400&height=400&seed=${seed}&nologo=true`

    // Fetch server-side with retry logic
    let imgRes: Response | null = null
    let lastError = ''
    for (let attempt = 0; attempt < 2; attempt++) {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 45_000)
      try {
        imgRes = await fetch(pollinationsUrl, {
          signal: controller.signal,
          redirect: 'follow',
        })
        clearTimeout(timer)
        if (imgRes.ok) break
        lastError = `código ${imgRes.status}`
        imgRes = null
      } catch (fetchErr: unknown) {
        clearTimeout(timer)
        if (fetchErr instanceof Error && fetchErr.name === 'AbortError') {
          lastError = 'La generación tardó demasiado'
        } else {
          lastError = 'No se pudo conectar al generador de imágenes'
        }
        imgRes = null
      }
    }

    if (!imgRes || !imgRes.ok) {
      return NextResponse.json(
        { error: `Error al generar imagen (${lastError}). Intenta con otro prompt.` },
        { status: 500 }
      )
    }

    const contentType = imgRes.headers.get('content-type') || 'image/jpeg'
    // Guard: Pollinations sometimes returns HTML on error even with 200
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'El servicio de IA devolvió un resultado inesperado. Intenta de nuevo.' }, { status: 500 })
    }

    const arrayBuffer = await imgRes.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const imageUrl = `data:${contentType};base64,${base64}`

    return NextResponse.json({ imageUrl })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
