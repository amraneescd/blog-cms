import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const lng = i18n.language === 'ar' ? 'ar' : 'en'

  function switchTo(target: 'en' | 'ar') {
    if (target !== lng) i18n.changeLanguage(target)
  }

  return (
    <div className="ml-2 rtl:ml-auto flex items-center gap-1 text-sm">
      <button
        className={`px-2 py-1 rounded ${lng === 'en' ? 'font-semibold underline' : 'opacity-70 hover:opacity-100'}`}
        onClick={() => switchTo('en')}
        aria-pressed={lng === 'en'}
      >{t('lang.en')}</button>
      <span className="opacity-30">|</span>
      <button
        className={`px-2 py-1 rounded ${lng === 'ar' ? 'font-semibold underline' : 'opacity-70 hover:opacity-100'}`}
        onClick={() => switchTo('ar')}
        aria-pressed={lng === 'ar'}
      >{t('lang.ar')}</button>
    </div>
  )
}
