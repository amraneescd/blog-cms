import { useTranslation } from 'react-i18next'
import AuthOnly from '../components/AuthOnly'
import AvatarUploader from '../components/AvatarUploader'
import DisplayNameForm from '../components/DisplayNameForm'
import { supabase } from '../lib/supabase'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card'
import { useProfileMeta } from '../components/useProfileMeta'

export default function ProfileSettings() {
  return (
    <AuthOnly>
      <Content />
    </AuthOnly>
  )
}

function Content() {
  const { t, i18n } = useTranslation()
  const { avatarUrl: initialAvatarUrl, displayName } = useProfileMeta()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl)
  const [avatarError, setAvatarError] = useState<string | null>(null)

  async function handleAvatarUploaded(url: string) {
    setAvatarUrl(url)
    await (supabase.auth as any).updateUser({ data: { avatar_url: url } })
  }

  function getPathFromPublicUrl(publicUrl: string): string | null {
    // Expected format contains "/avatars/" then the storage path
    const marker = '/avatars/'
    const idx = publicUrl.indexOf(marker)
    if (idx === -1) return null
    return publicUrl.substring(idx + marker.length)
  }

  async function handleAvatarDelete() {
    setAvatarError(null)
    try {
      if (!avatarUrl) return
      const path = getPathFromPublicUrl(avatarUrl)
      if (!path) throw new Error('Could not determine avatar path to delete')
      const { error: delErr } = await supabase.storage.from('avatars').remove([path])
      if (delErr) throw delErr
      await (supabase.auth as any).updateUser({ data: { avatar_url: null } })
      setAvatarUrl(null)
    } catch (err: any) {
      setAvatarError(err.message || 'Failed to remove avatar')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-10 py-8 px-4 sm:px-6">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">{t('profile.settings_title')}</h1>
        <p className="text-gray-600 mt-2 leading-relaxed">{t('profile.settings_desc')}</p>
      </div>

      <Card className="border-gray-200 shadow-sm overflow-hidden rounded-xl">
        <CardHeader className="p-6 bg-gradient-to-b from-gray-50 to-white">
          <CardTitle>{t('profile.image_title')}</CardTitle>
          <CardDescription>{t('profile.image_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center md:grid md:grid-cols-[auto,1fr] md:items-center md:text-left gap-6 md:gap-8">
            <div className="relative group mx-auto md:mx-0">
              <img
                src={avatarUrl || 'https://placehold.co/144x144?text=Avatar'}
                alt={t('profile.avatar_alt')}
                className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover ring-2 ring-gray-200 ring-offset-2 ring-offset-white shadow transition-transform duration-200 group-hover:scale-105"
              />
            </div>
            <div className="space-y-3">
              <div className={i18n.dir() === 'rtl' ? 'text-right' : ''}>
                <p className="text-xl font-medium leading-tight">{displayName}</p>
                <p className="text-sm text-gray-500">{t('profile.public_note')}</p>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <AvatarUploader onUploaded={handleAvatarUploaded} onDelete={handleAvatarDelete} hasAvatar={!!avatarUrl} />
              </div>
              {avatarError && <p className="text-xs text-red-600">{avatarError}</p>}
              <p className={`text-xs text-gray-500 ${i18n.dir() === 'rtl' ? 'text-center' : ''}`}>{t('profile.hint_formats')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm overflow-hidden rounded-xl">
        <CardHeader className="p-6 bg-gradient-to-b from-gray-50 to-white">
          <CardTitle>{t('profile.display_title')}</CardTitle>
          <CardDescription>{t('profile.display_desc')}</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <DisplayNameForm />
        </CardContent>
      </Card>
    </div>
  )
}
