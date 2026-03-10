import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import SettingsDetailScreen from '@/components/settings-detail-screen'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { SectionLabel, SettingsCard, ActionRow, SettingsDivider } from '@/features/settings'
import { StorageBar } from '@/features/settings/data-on-device'

export default function DataOnDeviceScreen() {
  const { t } = useTranslation()

  return (
    <SettingsDetailScreen title={t('settings.menu.dataOnDevice.title')}>
      {/* Storage Overview */}
      <SettingsCard marginTop={8}>
        <View className="px-4 py-4">
          <StorageBar />
          <View className="flex-row items-baseline mt-4 gap-2">
            <Text className="text-3xl font-bold text-foreground">3.82 GB</Text>
            <Text className="text-sm text-muted-foreground">
              {t('settings.dataOnDevice.percentOfPhone', { percent: '6.41' })}
            </Text>
          </View>
          <Text className="text-sm text-icon-muted mt-1">
            {t('settings.dataOnDevice.zaloData')}
          </Text>
        </View>
      </SettingsCard>

      {/* zCloud Promo */}
      <View className="mx-4 mt-3 rounded-xl p-4 bg-primary/10">
        <View className="flex-row items-center gap-2">
          <Ionicons name="cloud-outline" size={20} className="text-primary" />
          <Text className="text-sm font-semibold text-primary">zCloud</Text>
        </View>
        <Text className="text-sm text-muted-foreground mt-1.5 leading-5">
          {t('settings.dataOnDevice.zCloudDescription')}
        </Text>
        <TouchableOpacity className="mt-2">
          <Text className="text-sm font-medium text-primary">
            {t('settings.dataOnDevice.learnMore')} →
          </Text>
        </TouchableOpacity>
      </View>

      {/* Data breakdown */}
      <SectionLabel blue title={t('settings.sections.storage') || 'Storage'} />
      <SettingsCard marginTop={0}>
        <ActionRow
          icon="layers-outline"
          title={t('settings.dataOnDevice.cache')}
          onPress={() => { }}
          rightComponent={
            <View className="flex-row items-center gap-3">
              <Text className="text-sm text-muted-foreground">63.9 MB</Text>
              <TouchableOpacity onPress={() => { }} className="px-3 py-1 rounded-full bg-secondary">
                <Text className="text-sm font-medium text-primary">{t('common.cleanup', 'Dọn dẹp')}</Text>
              </TouchableOpacity>
            </View>
          }
        />
        <SettingsDivider inset={56} />
        <ActionRow
          icon="images-outline"
          title={t('settings.dataOnDevice.mediaLargeFiles')}
          onPress={() => { }}
          rightComponent={
            <View className="flex-row items-center gap-3">
              <Text className="text-sm text-muted-foreground">34.3 MB</Text>
              <TouchableOpacity onPress={() => { }} className="px-3 py-1 rounded-full bg-secondary">
                <Text className="text-sm font-medium text-primary">{t('common.cleanup', 'Dọn dẹp')}</Text>
              </TouchableOpacity>
            </View>
          }
        />
        <SettingsDivider inset={56} />
        <ActionRow
          icon="chatbubbles-outline"
          title={t('settings.dataOnDevice.chatData')}
          onPress={() => { }}
          rightComponent={
            <View className="flex-row items-center gap-3">
              <Text className="text-sm text-muted-foreground">866.5 MB</Text>
              <TouchableOpacity onPress={() => { }} className="px-3 py-1 rounded-full bg-secondary">
                <Text className="text-sm font-medium text-primary">{t('common.cleanup', 'Dọn dẹp')}</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </SettingsCard>

      <View className="h-8" />
    </SettingsDetailScreen>
  )
}
