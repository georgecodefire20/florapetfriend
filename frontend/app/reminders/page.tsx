'use client'

export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RemindersPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/pets') }, [router])
  return null
}
