import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthProvider'

interface Props {
  onUploaded: (url: string) => void
  onDelete?: () => void | Promise<void>
  hasAvatar?: boolean
}

export default function AvatarUploader({ onUploaded, onDelete, hasAvatar }: Props) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setError(null)
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      onUploaded(data.publicUrl)
    } catch (err: any) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-3">
      <label className="inline-flex items-center gap-2 rounded-lg bg-black text-white px-4 py-2 text-sm font-medium shadow-sm hover:opacity-90 active:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 5v14M5 12h14" />
        </svg>
        {uploading ? 'Uploading…' : 'Change avatar'}
      </label>
      {onDelete && (
        <button
          type="button"
          onClick={() => void onDelete()}
          disabled={uploading || !hasAvatar}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 6h18M8 6v14a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" />
          </svg>
          Remove
        </button>
      )}
      {error && <span className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 border border-red-200">{error}</span>}
    </div>
  )
}
