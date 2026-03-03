import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import SettingsDetailScreen from '@/components/settings-detail-screen'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { SectionLabel, SettingsCard } from '@/features/settings'
import { StorageBar, DataRow } from '@/features/settings/data-on-device'

export default function DataOnDeviceScreen() {
  const { t } = useTranslation()

  return (
    <SettingsDetailScreen title={t('settings.menu.dataOnDevice.title')}>
      {/* Storage Overview */}
      <SettingsCard marginTop={8}>
        <View className="px-4 py-4">
          <StorageBar />
          <View className="flex-row items-baseline mt-4 gap-2">
            <Text className="text-3xl font-bold text-gray-900">3.82 GB</Text>
            <Text className="text-sm text-gray-500">
              {t('settings.dataOnDevice.percentOfPhone', { percent: '6.41' })}
            </Text>
          </View>
          <Text className="text-sm text-gray-400 mt-1">
            {t('settings.dataOnDevice.zaloData')}
          </Text>
        </View>
      </SettingsCard>

      {/* zCloud Promo */}
      <View className="mx-4 mt-3 rounded-xl p-4" style={{ backgroundColor: '#EFF6FF' }}>
        <View className="flex-row items-center gap-2">
          <Ionicons name="cloud-outline" size={20} color="#0068FF" />
          <Text className="text-sm font-semibold" style={{ color: '#0068FF' }}>zCloud</Text>
        </View>
        <Text className="text-sm text-gray-600 mt-1.5 leading-5">
          {t('settings.dataOnDevice.zCloudDescription')}
        </Text>
        <TouchableOpacity className="mt-2">
          <Text className="text-sm font-medium" style={{ color: '#0068FF' }}>
            {t('settings.dataOnDevice.learnMore')} →
          </Text>
        </TouchableOpacity>
      </View>

      {/* Data breakdown */}
      <SectionLabel blue title={t('settings.sections.storage') || 'Storage'} />
      <SettingsCard marginTop={0}>
        <DataRow
          icon="layers-outline" iconColor="#0068FF"
          title={t('settings.dataOnDevice.cache')}
          size="63.9 MB" onCleanup={() => { }}
        />
        <DataRow
          icon="images-outline" iconColor="#34D399"
          title={t('settings.dataOnDevice.mediaLargeFiles')}
          size="34.3 MB" onCleanup={() => { }}
        />
        <DataRow
          icon="chatbubbles-outline" iconColor="#FBBF24"
          title={t('settings.dataOnDevice.chatData')}
          size="866.5 MB" onCleanup={() => { }}
        />
      </SettingsCard>

      <View className="h-8" />
    </SettingsDetailScreen>
  )
}
