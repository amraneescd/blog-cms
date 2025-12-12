import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { useProfileMeta } from './useProfileMeta'

export default function UserMenu() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [imgError, setImgError] = useState(false)

  const { avatarUrl, displayName } = useProfileMeta()
  const { t, i18n } = useTranslation()

  function getInitials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return '??'
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setOpen(false)
    }
  
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('click', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  useEffect(() => {
    // Reset error if avatar url changes
    setImgError(false)
  }, [avatarUrl])

  if (!user) return null

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
      >
        {avatarUrl && !imgError ? (
          <img
            src={avatarUrl}
            alt={displayName}
            onError={() => setImgError(true)}
            className="h-9 w-9 rounded-full object-cover ring-1 ring-gray-200"
          />
        ) : (
          <div
            aria-hidden
            className="h-9 w-9 rounded-full ring-1 ring-gray-200 bg-gray-100 text-gray-700 flex items-center justify-center text-xs font-medium"
            title={displayName}
          >
            {getInitials(displayName)}
          </div>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label={t('menu.aria')}
          className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md z-50"
        >
          <div className="px-4 py-3">
            <p className="text-sm text-gray-500">{t('menu.signed_in_as')}</p>
            <p className="text-sm font-medium truncate">{displayName}</p>
          </div>
          <div className="border-t">
            <Link
              to="/settings/profile"
              role="menuitem"
              className="block px-4 py-2.5 text-sm hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              {t('menu.profile_settings')}
            </Link>
            <button
              role="menuitem"
              className={`w-full ${i18n.dir() === 'rtl' ? 'text-right' : 'text-left'} px-4 py-2.5 text-sm text-red-600 hover:bg-red-50`}
              onClick={() => {
                setOpen(false)
                void signOut()
              }}
            >
              {t('menu.sign_out')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
