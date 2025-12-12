import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enCommon from './locales/en/common.json'
import arCommon from './locales/ar/common.json'

const STORAGE_KEY = 'i18n_lang'

const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
const initialLng = saved || 'en'

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon },
      ar: { common: arCommon },
    },
    lng: initialLng,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    ns: ['common'],
    defaultNS: 'common',
    react: { useSuspense: false },
  })
const applyDir = (lng: string) => {
  const dir = lng === 'ar' ? 'rtl' : 'ltr'
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('dir', dir)
    document.documentElement.setAttribute('lang', lng)
  }
}

applyDir(i18n.language)

i18n.on('languageChanged', (lng) => {
  try { localStorage.setItem(STORAGE_KEY, lng) } catch {}
  applyDir(lng)
})

export default i18n
