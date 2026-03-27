const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'fpf-minio'
const MINIO_PORT = parseInt(process.env.MINIO_PORT || '9000')
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'fpf_admin'
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'changeme'
const MINIO_USE_SSL = process.env.MINIO_USE_SSL === 'true'
const BUCKET_PETS = process.env.MINIO_BUCKET_PETS || 'pet-photos'
const BUCKET_AVATARS = process.env.MINIO_BUCKET_AVATARS || 'virtual-pets'

export function getMinioPublicUrl(bucket: string, objectName: string): string {
  const proto = MINIO_USE_SSL ? 'https' : 'http'
  return `${proto}://${MINIO_ENDPOINT}:${MINIO_PORT}/${bucket}/${objectName}`
}

export async function uploadToMinio(
  bucket: string,
  objectName: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const url = `http://${MINIO_ENDPOINT}:${MINIO_PORT}/${bucket}/${objectName}`

  const authHeader = buildMinioAuthHeader('PUT', bucket, objectName, contentType)

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
      Authorization: authHeader,
    },
    body: buffer,
  })

  if (!response.ok) {
    throw new Error(`MinIO upload failed: ${response.statusText}`)
  }

  return getMinioPublicUrl(bucket, objectName)
}

function buildMinioAuthHeader(
  _method: string,
  _bucket: string,
  _object: string,
  _contentType: string
): string {
  return `Bearer ${MINIO_ACCESS_KEY}:${MINIO_SECRET_KEY}`
}

export { BUCKET_PETS, BUCKET_AVATARS }
