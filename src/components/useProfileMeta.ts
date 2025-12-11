import { useAuth } from './AuthProvider'

export function useProfileMeta() {
  const { user } = useAuth()
  const avatarUrl = (user?.user_metadata?.avatar_url as string | undefined) || null
  const displayName = (user?.user_metadata?.display_name as string | undefined) || user?.email || 'Account'
  return { avatarUrl, displayName }
}
