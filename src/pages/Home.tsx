import { useTranslation } from 'react-i18next'
export default function Home() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">{t('app.title')}</h1>
        <p className="text-gray-600 mt-2">{t('home.welcome')}</p>
      </div>
    </div>
  )
}
