import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'

function StorageBar() {
  return (
    <View className="h-2 rounded-full flex-row overflow-hidden bg-gray-200 mt-4">
      <View style={{ flex: 0.35, backgroundColor: '#0068FF' }} />
      <View style={{ flex: 0.25, backgroundColor: '#34D399' }} />
      <View style={{ flex: 0.15, backgroundColor: '#FBBF24' }} />
      <View style={{ flex: 0.25, backgroundColor: '#E5E7EB' }} />
    </View>
  )
}

function DataRow({ icon, iconColor, title, size, onCleanup }: {
  icon: string; iconColor: string; title: string; size: string; onCleanup?: () => void
}) {
  return (
    <View className="flex-row items-center px-4 py-3.5 border-b border-gray-100">
      <Ionicons name={icon as any} size={24} color={iconColor} />
      <Text className="flex-1 text-base text-gray-800 ml-3">{title}</Text>
      <View className="flex-row items-center gap-3">
        <Text className="text-sm text-gray-500">{size}</Text>
        {onCleanup && (
          <TouchableOpacity
            onPress={onCleanup}
            className="px-3 py-1 rounded-full bg-gray-100"
          >
            <Text className="text-sm font-medium" style={{ color: '#0068FF' }}>Dọn dẹp</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default function DataOnDeviceScreen() {
  const { t } = useTranslation()

  return (
    <SettingsDetailScreen title={t('settings.menu.dataOnDevice.title')}>
      {/* Storage Overview */}
      <View className="bg-white px-4 py-4 mt-2">
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

      {/* Data Sections */}
      <View className="bg-white mt-4">
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
      </View>

      <View className="h-8" />
    </SettingsDetailScreen>
  )
}
