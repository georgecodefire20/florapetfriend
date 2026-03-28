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
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encoded}?width=400&height=400&seed=${seed}&model=flux&enhance=false`

    // Fetch server-side with manual AbortController (Node 14+ compatible)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 35_000)
    let imgRes: Response
    try {
      imgRes = await fetch(pollinationsUrl, {
        signal: controller.signal,
        headers: {
          'Referer': 'https://florapetfriend.site',
          'Origin': 'https://florapetfriend.site',
          'User-Agent': 'Mozilla/5.0 (compatible; FloraPetFriend/1.0)',
        },
      })
    } catch (fetchErr: unknown) {
      clearTimeout(timer)
      const msg = fetchErr instanceof Error && fetchErr.name === 'AbortError'
        ? 'La generación tardó demasiado. Intenta de nuevo.'
        : 'No se pudo conectar al generador de imágenes.'
      return NextResponse.json({ error: msg }, { status: 500 })
    }
    clearTimeout(timer)

    if (!imgRes.ok) {
      return NextResponse.json(
        { error: `Error al generar imagen (código ${imgRes.status}). Intenta con otro prompt.` },
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
