import React from 'react'
import { View } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/ui'
import { BlockedUsersSection } from '@/features/users/components/blocked-users-section'

export default function BlockedUsersScreen() {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <Header
        title={t('settings.privacy.blockAndHide')}
        showBackButton={true}
        onBackPress={() => router.back()}
      />
      <View style={{ flex: 1 }}>
        <BlockedUsersSection />
      </View>
    </View>
  )
}
