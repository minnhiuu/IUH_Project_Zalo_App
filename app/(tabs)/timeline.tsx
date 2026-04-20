import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { Header } from '@/components/ui'
import { SocialFeedPage } from '@/features/social-feed'

export default function TimelineScreen() {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <View style={{ flex: 1 }}>
      <Header
        showSearch
        searchPlaceholder={t('timeline.search')}
        showQRButton
        onQRPress={() => router.push('/qr' as any)}
        showAddButton
        showBellButton
        onBellPress={() => {}}
      />
      <SocialFeedPage />
    </View>
  )
}
