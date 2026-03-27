'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Upload, Search, X, Image, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

type Mode = 'image' | 'text'

export default function IdentifyForm() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('image')
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    maxSize: 10_000_000,
  })

  const clearImage = () => {
    setFile(null)
    setPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'image' && !file) {
      toast.error('Por favor sube una imagen')
      return
    }
    if (mode === 'text' && !text.trim()) {
      toast.error('Por favor escribe el nombre del animal o planta')
      return
    }

    setLoading(true)
    try {
      let body: FormData | string
      let headers: Record<string, string> = {}

      if (mode === 'image' && file) {
        const fd = new FormData()
        fd.append('image', file)
        body = fd
      } else {
        body = JSON.stringify({ query: text.trim() })
        headers['Content-Type'] = 'application/json'
      }

      const res = await fetch('/api/identify', {
        method: 'POST',
        headers,
        body: body as BodyInit,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al identificar')
      }

      const data = await res.json()
      if (data.results?.length) {
        sessionStorage.setItem('identify_results', JSON.stringify(data.results))
      }
      const ids = data.results?.map((r: { id: string }) => r.id).join(',')
      router.push(`/identify/results?ids=${ids}&mode=${mode}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card w-full max-w-2xl mx-auto">
      {/* Mode tabs */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-2xl">
        <button
          onClick={() => setMode('image')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            mode === 'image' ? 'bg-white shadow-sm text-brand-700' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Image className="w-4 h-4" />
          Subir imagen
        </button>
        <button
          onClick={() => setMode('text')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            mode === 'text' ? 'bg-white shadow-sm text-brand-700' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Search className="w-4 h-4" />
          Escribir nombre
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {mode === 'image' ? (
          <div className="mb-6">
            {preview ? (
              <div className="relative rounded-2xl overflow-hidden">
                <img src={preview} alt="Preview" className="w-full h-56 object-cover rounded-2xl" />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5 shadow-md hover:bg-white transition-colors"
                >
                  <X className="w-4 h-4 text-gray-700" />
                </button>
                <div className="absolute bottom-3 left-3 bg-white/90 rounded-xl px-3 py-1 text-xs font-medium text-gray-700">
                  {file?.name}
                </div>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? 'border-brand-400 bg-brand-50'
                    : 'border-gray-200 hover:border-brand-300 hover:bg-brand-50/50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-10 h-10 text-brand-400 mx-auto mb-3" />
                <p className="font-semibold text-gray-700 mb-1">
                  {isDragActive ? 'Suelta la imagen aquí' : 'Arrastra o haz clic para subir'}
                </p>
                <p className="text-sm text-gray-400">JPG, PNG, WEBP — máx 10MB</p>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-6">
            <input
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Ej: gato siamés, cactus, jirafa, orquídea..."
              className="input-field text-base"
              autoFocus
            />
            <p className="text-xs text-gray-400 mt-2 ml-1">
              Escribe el nombre en cualquier idioma
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full text-base flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>
                Identificando
                <span className="loading-dots">
                  <span>.</span><span>.</span><span>.</span>
                </span>
              </span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Identificar especie
            </>
          )}
        </button>
      </form>
    </div>
  )
}
