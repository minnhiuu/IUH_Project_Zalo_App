import React from 'react'
import { Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import SettingsDetailScreen from '@/components/settings-detail-screen'
import { SettingsCard } from '@/features/settings'

export default function ArchivedMessagesScreen() {
  const { t } = useTranslation()

  return (
    <SettingsDetailScreen title={t('settings.messages.archivedMessages')}>
      <SettingsCard marginTop={0}>
        <View className='px-4 py-5'>
          <Text className='text-base text-foreground'>{t('settings.messages.archivedMessages')}</Text>
          <Text className='text-sm text-muted-foreground mt-1'>
            {t('settings.messages.archivedMessagesPlaceholder')}
          </Text>
        </View>
      </SettingsCard>

      <View className='h-8' />
    </SettingsDetailScreen>
  )
}
