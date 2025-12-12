import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from './AuthProvider'
import { supabase } from '../lib/supabase'

export default function DisplayNameForm() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [name, setName] = useState<string>(user?.user_metadata?.display_name || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    
    setSaving(true)
    setMessage(null)
    setError(null)
    
    try {
      const { error } = await (supabase.auth as any).updateUser({
        data: { display_name: name },
      })
      if (error) throw error
      setMessage('Saved')
      setTimeout(() => setMessage(null), 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const trimmed = name.trim()
  const tooLong = trimmed.length > 50
  const empty = trimmed.length === 0
  const invalid = tooLong || empty

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{t('profile.display_title')}</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={64}
        aria-invalid={invalid}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 shadow-sm focus:outline-none focus:ring-2 ${invalid ? 'border-red-300 focus:ring-red-100 focus:border-red-400' : 'border-gray-200 focus:ring-black/10 focus:border-black/30'}`}
        placeholder="Your name"
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{t('profile.display_hint')}</p>
        <span className={`text-xs ${tooLong ? 'text-red-600' : 'text-gray-500'}`}>{trimmed.length}/50</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving || invalid}
          className="inline-flex items-center rounded-lg bg-black text-white px-4 py-2.5 text-sm font-medium shadow-sm hover:opacity-90 active:opacity-80 disabled:opacity-50"
        >
          {saving ? t('profile.saving') : t('profile.save')}
        </button>
        {message && <span className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 border border-green-200">{message}</span>}
        {error && <span className="text-xs px-2 py-1 rounded bg-red-50 text-red-700 border border-red-200">{error}</span>}
      </div>
    </form>
  )
}
