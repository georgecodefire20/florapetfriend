import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getSeason(country: string): string {
  const month = new Date().getMonth() + 1
  const southernHemisphere = ['AR', 'CL', 'BR', 'AU', 'NZ', 'ZA', 'PE', 'BO', 'UY', 'PY']
  const isSouthern = southernHemisphere.includes(country.toUpperCase())

  if (isSouthern) {
    if (month >= 12 || month <= 2) return 'verano'
    if (month >= 3 && month <= 5) return 'otoño'
    if (month >= 6 && month <= 8) return 'invierno'
    return 'primavera'
  } else {
    if (month >= 12 || month <= 2) return 'invierno'
    if (month >= 3 && month <= 5) return 'primavera'
    if (month >= 6 && month <= 8) return 'verano'
    return 'otoño'
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export const ILLEGAL_KEYWORDS = [
  'tigre', 'lion', 'leopard', 'jirafa', 'elefante', 'gorila', 'chimpancé',
  'marihuana', 'cannabis', 'coca', 'amapola', 'opio',
  'cocodrilo', 'caimán', 'anaconda', 'pitón', 'boa',
  'lobo', 'oso', 'puma', 'jaguar',
]

export function checkLegalWarning(name: string): boolean {
  const lower = name.toLowerCase()
  return ILLEGAL_KEYWORDS.some(kw => lower.includes(kw))
}
