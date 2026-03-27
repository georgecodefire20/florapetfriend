import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('photo') as File
    const pet_id = formData.get('pet_id') as string
    const user_id = formData.get('user_id') as string
    const caption = formData.get('caption') as string | null

    if (!file || !pet_id || !user_id) {
      return NextResponse.json({ error: 'photo, pet_id y user_id son requeridos' }, { status: 400 })
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const allowed = ['jpg', 'jpeg', 'png', 'webp']
    if (!allowed.includes(ext)) {
      return NextResponse.json({ error: 'Formato no permitido' }, { status: 400 })
    }

    const objectName = `${pet_id}/${Date.now()}.${ext}`
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const minioEndpoint = process.env.MINIO_ENDPOINT || 'fpf-minio'
    const minioPort = process.env.MINIO_PORT || '9000'
    const bucket = 'pet-photos'
    const uploadUrl = `http://${minioEndpoint}:${minioPort}/${bucket}/${objectName}`

    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'image/jpeg' },
      body: buffer,
    })

    if (!uploadRes.ok) {
      throw new Error('Error subiendo foto a MinIO')
    }

    const photo_url = uploadUrl
    const { data, error } = await supabase
      .from('pet_photos')
      .insert({ user_id, pet_id, photo_url, caption })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ photo: data })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const pet_id = searchParams.get('pet_id')

    if (!pet_id) {
      return NextResponse.json({ error: 'pet_id requerido' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('pet_photos')
      .select('*')
      .eq('pet_id', pet_id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ photos: data })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
