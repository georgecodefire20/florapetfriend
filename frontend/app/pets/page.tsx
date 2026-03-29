'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Lock, Sparkles, Camera, Upload,
  X, CheckCircle, XCircle, ChevronDown, ChevronUp, Loader2,
  Pencil, PawPrint, Leaf, ExternalLink, Trash2,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useAuth } from '@/lib/auth'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Reminder {
  id: string
  pet_id: string
  type: string
  label: string
  time: string
  frequency: string
  active: boolean
  completed: boolean
  completed_at: string | null
}

interface Pet {
  id: string
  species_id: string
  name: string
  personality: string
  message: string
  level: number
  happiness: number
  avatar_url: string | null
  created_at: string
  last_tended_at: string | null
  species: { common_name: string; type: string; image_url: string | null }
  reminders: Reminder[]
}

interface Health {
  emoji: string
  grey: number
  lost: boolean
  isNew: boolean
  label: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeHealth(pet: Pet): Health {
  const active = (pet.reminders || []).filter(r => r.active)
  const completed = active.filter(r => r.completed)
  const pending = active.length - completed.length

  if (!pet.last_tended_at && completed.length === 0) {
    return { emoji: '🌱', grey: 0, lost: false, isNew: true, label: '¡Nuevo compañero! Empieza a cuidarlo.' }
  }

  const refDate = pet.last_tended_at ?? pet.created_at
  const daysSince = (Date.now() - new Date(refDate).getTime()) / 86_400_000

  if (daysSince >= 7 && pending >= 3) {
    return { emoji: '💀', grey: 100, lost: true, isNew: false, label: 'Su compañero virtual ha perdido esta batalla.' }
  }

  const total = active.length
  const ratio = total > 0 ? completed.length / total : 1

  if (ratio >= 0.75) return { emoji: '😊', grey: 0,  lost: false, isNew: false, label: '¡Se siente muy bien cuidado!' }
  if (ratio >= 0.50) return { emoji: '😕', grey: 20, lost: false, isNew: false, label: 'Necesita un poco más de atención.' }
  if (ratio >= 0.25) return { emoji: '😢', grey: 45, lost: false, isNew: false, label: 'Se siente un poco descuidado.' }
  return               { emoji: '😭', grey: 70, lost: false, isNew: false, label: '¡Está muy triste! Atiende sus recordatorios.' }
}

function freqCat(freq: string): 'daily' | 'weekly' | 'monthly' {
  const f = (freq || '').toLowerCase()
  if (f.includes('seman') || f.includes('week')) return 'weekly'
  if (f.includes('mes') || f.includes('month') || f.includes('mensual')) return 'monthly'
  return 'daily'
}

async function resizeImage(file: File, size = 400): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const scale = Math.min(size / img.width, size / img.height, 1)
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.75))
      }
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(file)
  })
}

const TYPE_EMOJI: Record<string, string> = { animal: '🐾', plant: '🌿' }
const REM_ICON: Record<string, string> = { food: '🍽️', water: '💧', sun: '☀️', cleaning: '🧹', other: '📋' }
const FREQ_LABELS = { daily: 'Diario', weekly: 'Semanal', monthly: 'Mensual' } as const

// ─── Delete Confirm Modal ────────────────────────────────────────────────────

function DeleteConfirmModal({ petName, onConfirm, onCancel, deleting }: {
  petName: string
  onConfirm: () => void
  onCancel: () => void
  deleting: boolean
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-1">
            <Trash2 className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="font-display font-bold text-xl text-gray-900">¿Eliminar compañero?</h3>
          <p className="text-sm text-gray-500">
            ¿Realmente deseas eliminar a{' '}
            <span className="font-semibold text-gray-700">{petName}</span>?
            {' '}Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3 w-full mt-2">
            <button onClick={onCancel} disabled={deleting}
              className="flex-1 py-2.5 rounded-2xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button onClick={onConfirm} disabled={deleting}
              className="flex-1 py-2.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {deleting
                ? <><Loader2 className="w-4 h-4 animate-spin" />Eliminando...</>
                : <><Trash2 className="w-4 h-4" />Eliminar</>}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── DiceBear Styles ─────────────────────────────────────────────────────────

const DICEBEAR_STYLES = [
  { id: 'thumbs',       label: '😊 Kawaii' },
  { id: 'fun-emoji',    label: '🎉 Emoji' },
  { id: 'adventurer',   label: '🧑 Aventura' },
  { id: 'bottts',       label: '🤖 Robot' },
  { id: 'pixel-art',    label: '👾 Pixel' },
  { id: 'lorelei',      label: '✨ Lorelei' },
]

function dicebearUrl(style: string, seed: string) {
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}&size=200`
}

// ─── Image Modal ──────────────────────────────────────────────────────────────

function ImageModal({ pet, onClose, onSaved }: {
  pet: Pet
  onClose: () => void
  onSaved: (url: string) => void
}) {
  const [tab, setTab] = useState<'avatar' | 'upload'>('avatar')
  const [selectedStyle, setSelectedStyle] = useState(DICEBEAR_STYLES[0].id)
  const [seed, setSeed] = useState(pet.name)
  const [preview, setPreview] = useState<string | null>(pet.avatar_url)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (tab === 'avatar') {
      setPreview(dicebearUrl(selectedStyle, seed || pet.name))
    }
  }, [selectedStyle, seed, tab])

  const handleFile = async (e: { target: HTMLInputElement }) => {
    const file = e.target.files?.[0]
    if (!file) return
    const resized = await resizeImage(file)
    setPreview(resized)
  }

  const handleSave = async () => {
    if (!preview) return
    setSaving(true)
    try {
      const res = await fetch('/api/virtual-pet', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pet_id: pet.id, avatar_url: preview }),
      })
      if (!res.ok) throw new Error()
      toast.success('¡Imagen actualizada!')
      onSaved(preview)
      onClose()
    } catch {
      toast.error('Error guardando imagen')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-xl text-gray-900">Cambiar imagen — {pet.name}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex bg-gray-100 rounded-2xl p-1 mb-5">
          {(['avatar', 'upload'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${tab === t ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500'}`}
            >
              {t === 'avatar' ? <><Sparkles className="w-3.5 h-3.5" />Elegir avatar</> : <><Upload className="w-3.5 h-3.5" />Subir foto</>}
            </button>
          ))}
        </div>

        {preview && (
          <div className="mb-4 rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center h-48">
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-contain"
              onError={() => { setPreview(null); toast.error('No se pudo cargar la imagen.') }}
            />
          </div>
        )}

        {tab === 'avatar' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {DICEBEAR_STYLES.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStyle(s.id)}
                  className={`p-2 rounded-xl text-xs font-semibold transition-all border-2 ${selectedStyle === s.id ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}
                >
                  <img
                    src={dicebearUrl(s.id, seed || pet.name)}
                    alt={s.label}
                    className="w-12 h-12 mx-auto mb-1 rounded-lg"
                  />
                  {s.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={seed}
              onChange={e => setSeed(e.target.value)}
              placeholder="Semilla (nombre o palabra)"
              className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm"
            />
            <p className="text-xs text-gray-400 text-center">Cambia la semilla para generar variaciones únicas</p>
          </div>
        )}

        {tab === 'upload' && (
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            <button onClick={() => fileRef.current?.click()}
              className="w-full h-24 border-2 border-dashed border-brand-200 rounded-2xl hover:border-brand-400 hover:bg-brand-50 transition-all flex items-center justify-center gap-3 text-gray-500 hover:text-brand-600"
            >
              <Camera className="w-6 h-6" /><span className="text-sm font-medium">Seleccionar foto</span>
            </button>
          </div>
        )}

        {preview && (
          <button onClick={handleSave} disabled={saving}
            className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</> : <><CheckCircle className="w-4 h-4" />Guardar imagen</>}
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}

// ─── Reminder Item ────────────────────────────────────────────────────────────

function ReminderItem({ reminder, onToggle }: {
  reminder: Reminder
  onToggle: (id: string, completed: boolean) => void
}) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${reminder.completed ? 'bg-gray-50' : 'bg-white border border-gray-100 shadow-sm'}`}>
      <button
        onClick={() => onToggle(reminder.id, !reminder.completed)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
          reminder.completed ? 'bg-gray-300 border-gray-300' : 'border-brand-400 hover:bg-brand-50'
        }`}
      >
        {reminder.completed && <CheckCircle className="w-4 h-4 text-white" />}
      </button>
      <span className="text-lg leading-none">{REM_ICON[reminder.type] ?? '📋'}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${reminder.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
          {reminder.label}
        </p>
        <p className="text-xs text-gray-400">{reminder.time} · {reminder.frequency}</p>
      </div>
      {reminder.completed && <span className="text-xs text-gray-400 shrink-0">✓ hecho</span>}
    </div>
  )
}

// ─── Pet Card ─────────────────────────────────────────────────────────────────

function PetCard({ pet: init, onDelete }: { pet: Pet; onDelete: (id: string) => void }) {
  const [pet, setPet] = useState(init)
  const [showImgModal, setShowImgModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [freqTab, setFreqTab] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [expanded, setExpanded] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(init.name)

  const saveName = async () => {
    const trimmed = nameInput.trim()
    if (!trimmed) { setNameInput(pet.name); setEditingName(false); return }
    if (trimmed === pet.name) { setEditingName(false); return }
    const res = await fetch('/api/virtual-pet', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pet_id: pet.id, name: trimmed }),
    })
    if (res.ok) {
      setPet(prev => ({ ...prev, name: trimmed }))
      toast.success('Nombre actualizado')
    } else {
      toast.error('Error al actualizar nombre')
      setNameInput(pet.name)
    }
    setEditingName(false)
  }

  const health = computeHealth(pet)
  const activeRem = (pet.reminders || []).filter(r => r.active)

  const grouped = {
    daily:   activeRem.filter(r => freqCat(r.frequency) === 'daily'),
    weekly:  activeRem.filter(r => freqCat(r.frequency) === 'weekly'),
    monthly: activeRem.filter(r => freqCat(r.frequency) === 'monthly'),
  }

  const tabReminders = [...(grouped[freqTab])].sort((a, b) => Number(a.completed) - Number(b.completed))

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/virtual-pet?pet_id=${pet.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success(`${pet.name} ha sido eliminado`)
      onDelete(pet.id)
    } catch {
      toast.error('Error al eliminar compañero')
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const handleToggle = async (id: string, completed: boolean) => {
    const now = new Date().toISOString()
    setPet(prev => ({
      ...prev,
      last_tended_at: completed ? now : prev.last_tended_at,
      reminders: prev.reminders.map(r => r.id === id ? { ...r, completed, completed_at: completed ? now : null } : r),
    }))
    await fetch('/api/reminders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, completed }),
    })
  }

  const avatarSrc = pet.avatar_url || pet.species?.image_url || null

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">

        {/* ── Top bar: species link + delete ── */}
        <div className="flex items-center justify-between mb-3">
          {pet.species_id ? (
            <Link
              href={`/species/${pet.species_id}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-xl transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Ver ficha completa
            </Link>
          ) : <span />}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            title="Eliminar compañero"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* ── Pet Header ── */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar with health overlay */}
          <div className="relative flex-shrink-0 group">
            <motion.div
              animate={!health.lost ? { y: [0, -4, 0] } : {}}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-24 h-24 relative"
            >
              <div
                className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white shadow-md"
                style={{ filter: health.grey > 0 ? `grayscale(${health.grey}%)` : undefined }}
              >
                {avatarSrc
                  ? <img src={avatarSrc} alt={pet.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full bg-gradient-to-br from-brand-100 to-earth-100 flex items-center justify-center text-4xl">{TYPE_EMOJI[pet.species?.type ?? 'animal']}</div>
                }
              </div>
              {health.lost && (
                <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-red-500" />
                </div>
              )}
              {activeRem.length > 0 ? (
                activeRem.filter(r => !r.completed).length > 0 ? (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                    {activeRem.filter(r => !r.completed).length}
                  </div>
                ) : (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )
              ) : (
                <div className="absolute -top-2 -right-2 bg-brand-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                  {pet.level}
                </div>
              )}
            </motion.div>

            {/* Edit image on hover */}
            <button
              onClick={() => setShowImgModal(true)}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 opacity-0 group-hover:opacity-100 transition-all bg-brand-500 text-white rounded-full p-1.5 shadow-md z-10"
              title="Cambiar imagen"
            >
              <Camera className="w-3 h-3" />
            </button>

            {/* Health emoji badge */}
            <div className="absolute -bottom-2 -left-1 text-2xl leading-none select-none">{health.emoji}</div>
          </div>

          {/* Name / info / health bar */}
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1 min-w-0">
                  {editingName ? (
                    <input
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      onBlur={saveName}
                      onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setEditingName(false); setNameInput(pet.name) } }}
                      autoFocus
                      maxLength={60}
                      className="text-xl font-display font-bold text-gray-900 border-b-2 border-brand-400 bg-transparent focus:outline-none min-w-0 w-full"
                    />
                  ) : (
                    <>
                      <h2 className="text-xl font-display font-bold text-gray-900 truncate">{pet.name}</h2>
                      <button onClick={() => { setEditingName(true); setNameInput(pet.name) }} className="p-1 text-gray-300 hover:text-brand-500 transition-colors flex-shrink-0" title="Editar nombre">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  {pet.species?.type === 'plant'
                    ? <Leaf className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    : <PawPrint className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                  {pet.species?.common_name}
                </p>
                {pet.personality && <p className="text-xs text-gray-500 italic mt-0.5">{pet.personality}</p>}
              </div>
              <button onClick={() => setExpanded(!expanded)} className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-400 flex-shrink-0">
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(0, 100 - health.grey)}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className={`h-full rounded-full ${health.lost ? 'bg-gray-400' : 'bg-gradient-to-r from-brand-400 to-green-400'}`}
                />
              </div>
              <span className="text-xs text-gray-500 w-8 text-right shrink-0">{Math.max(0, 100 - health.grey)}%</span>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>

              {/* Speech bubble */}
              <div className={`rounded-2xl p-4 mb-4 text-sm ${
                health.lost
                  ? 'bg-red-50 border border-red-200 text-red-700 font-semibold'
                  : 'bg-brand-50 border border-brand-100 text-brand-800 italic'
              }`}>
                {health.lost ? `💀 ${health.label}` : `"${health.label || pet.message}"`}
              </div>

              {/* Reminders */}
              {activeRem.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Recordatorios</p>

                  {/* Frequency tabs */}
                  <div className="flex gap-1.5 mb-3 flex-wrap">
                    {(['daily', 'weekly', 'monthly'] as const).map(f => {
                      const pending = grouped[f].filter(r => !r.completed).length
                      const hasRems = grouped[f].length > 0
                      return (
                        <button key={f} onClick={() => setFreqTab(f)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            freqTab === f ? 'bg-brand-500 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {FREQ_LABELS[f]}
                          {hasRems && (
                            pending > 0 ? (
                              <span className={`text-xs rounded-full px-1.5 py-0.5 font-bold leading-none ${
                                freqTab === f ? 'bg-white/30 text-white' : 'bg-red-100 text-red-600'
                              }`}>
                                {pending}
                              </span>
                            ) : (
                              <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 ${
                                freqTab === f ? 'text-white/80' : 'text-green-500'
                              }`} />
                            )
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {tabReminders.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">Sin recordatorios en esta categoría</p>
                  ) : (
                    <div className="space-y-2">
                      {tabReminders.map(r => (
                        <ReminderItem key={r.id} reminder={r} onToggle={handleToggle} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showImgModal && (
          <ImageModal
            pet={pet}
            onClose={() => setShowImgModal(false)}
            onSaved={url => setPet(prev => ({ ...prev, avatar_url: url }))}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && (
          <DeleteConfirmModal
            petName={pet.name}
            deleting={deleting}
            onConfirm={handleDelete}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PetsPage() {
  const { user, loading: authLoading } = useAuth()
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) { setLoading(false); return }
    fetch(`/api/virtual-pet?user_id=${user.id}`)
      .then(r => r.json())
      .then(data => { setPets(data.pets || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user, authLoading])

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card max-w-md w-full text-center py-12">
          <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-brand-600" />
          </div>
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Área privada</h2>
          <p className="text-gray-500 mb-6">Necesitas una cuenta para ver tus compañeros virtuales.</p>
          <div className="flex flex-col gap-3">
            <Link href="/auth" className="btn-primary flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" /> Crear cuenta gratis
            </Link>
            <Link href="/auth" className="btn-secondary text-sm">Ya tengo cuenta — Iniciar sesión</Link>
          </div>
        </motion.div>
      </div>
    )
  }

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-16 h-16 border-4 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
        <p className="text-gray-500">Cargando compañeros...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gray-900 flex items-center gap-2">
              <span>🌟</span> Mi Compañero Virtual
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              {pets.length === 0 ? 'Aún no tienes compañeros' : `${pets.length} compañero${pets.length > 1 ? 's' : ''} — cuídalos bien`}
            </p>
          </div>
          <Link href="/identify" className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Nuevo
          </Link>
        </div>

        {pets.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card text-center py-16">
            <div className="text-7xl mb-4">🐣</div>
            <h2 className="text-xl font-display font-bold text-gray-800 mb-2">Aún no tienes compañero virtual</h2>
            <p className="text-gray-500 mb-6 max-w-xs mx-auto text-sm">
              Identifica un animal o planta y crea tu primer compañero con recordatorios personalizados.
            </p>
            <Link href="/identify" className="btn-primary inline-flex items-center gap-2">
              <Search className="w-4 h-4" /> Identificar mi primera especie
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-6">
            {pets.map(pet => (
              <PetCard
                key={pet.id}
                pet={pet}
                onDelete={id => setPets(prev => prev.filter(p => p.id !== id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
