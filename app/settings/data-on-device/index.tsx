import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { Box, VStack, HStack, Text } from '@/components/ui'
import { useTranslation } from 'react-i18next'

// Storage bar segment
const StorageBar = () => (
  <View style={{ height: 8, borderRadius: 4, flexDirection: 'row', overflow: 'hidden', backgroundColor: '#E5E7EB', marginTop: 16 }}>
    <View style={{ flex: 0.35, backgroundColor: '#0068FF' }} />
    <View style={{ flex: 0.25, backgroundColor: '#34D399' }} />
    <View style={{ flex: 0.15, backgroundColor: '#FBBF24' }} />
    <View style={{ flex: 0.25, backgroundColor: '#E5E7EB' }} />
  </View>
)

// Data row with cleanup button
const DataRow = ({
  icon,
  iconColor,
  title,
  size,
  onCleanup,
}: {
  icon: string
  iconColor: string
  title: string
  size: string
  onCleanup?: () => void
}) => (
  <HStack
    style={{
      paddingHorizontal: 16,
      paddingVertical: 14,
      alignItems: 'center',
      borderBottomWidth: 0.5,
      borderBottomColor: '#f0f0f0',
    }}
  >
    <Ionicons name={icon as any} size={24} color={iconColor} />
    <VStack style={{ flex: 1, marginLeft: 12 }}>
      <Text style={{ fontSize: 16, color: '#1f2937' }}>{title}</Text>
    </VStack>
    <HStack style={{ alignItems: 'center', gap: 12 }}>
      <Text style={{ fontSize: 14, color: '#6b7280' }}>{size}</Text>
      {onCleanup && (
        <TouchableOpacity
          onPress={onCleanup}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 16,
            backgroundColor: '#F3F4F6',
          }}
        >
          <Text style={{ fontSize: 13, color: '#0068FF', fontWeight: '500' }}>
            Dọn dẹp
          </Text>
        </TouchableOpacity>
      )}
    </HStack>
  </HStack>
)

export default function DataOnDeviceScreen() {
  const { t } = useTranslation()

  return (
    <SettingsDetailScreen title={t('settings.menu.dataOnDevice.title')}>
      {/* Storage Overview */}
      <VStack style={{ backgroundColor: '#fff', padding: 16, marginTop: 2 }}>
        <StorageBar />

        <HStack style={{ marginTop: 16, alignItems: 'baseline' }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#1f2937' }}>
            3.82 GB
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280', marginLeft: 8 }}>
            {t('settings.dataOnDevice.percentOfPhone', { percent: '6.41' })}
          </Text>
        </HStack>

        <Text style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>
          {t('settings.dataOnDevice.zaloData')}
        </Text>
      </VStack>

      {/* zCloud Promo Card */}
      <VStack
        style={{
          backgroundColor: '#EFF6FF',
          marginHorizontal: 16,
          marginTop: 12,
          borderRadius: 12,
          padding: 16,
        }}
      >
        <HStack style={{ alignItems: 'center', gap: 8 }}>
          <Ionicons name="cloud-outline" size={20} color="#0068FF" />
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#0068FF' }}>
            zCloud
          </Text>
        </HStack>
        <Text style={{ fontSize: 13, color: '#4B5563', marginTop: 6, lineHeight: 18 }}>
          {t('settings.dataOnDevice.zCloudDescription')}
        </Text>
        <TouchableOpacity style={{ marginTop: 8 }}>
          <Text style={{ fontSize: 13, color: '#0068FF', fontWeight: '500' }}>
            {t('settings.dataOnDevice.learnMore')} →
          </Text>
        </TouchableOpacity>
      </VStack>

      {/* Data Sections */}
      <VStack style={{ backgroundColor: '#fff', marginTop: 16 }}>
        <DataRow
          icon="layers-outline"
          iconColor="#0068FF"
          title={t('settings.dataOnDevice.cache')}
          size="63.9 MB"
          onCleanup={() => {}}
        />
        <DataRow
          icon="images-outline"
          iconColor="#34D399"
          title={t('settings.dataOnDevice.mediaLargeFiles')}
          size="34.3 MB"
          onCleanup={() => {}}
        />
        <DataRow
          icon="chatbubbles-outline"
          iconColor="#FBBF24"
          title={t('settings.dataOnDevice.chatData')}
          size="866.5 MB"
          onCleanup={() => {}}
        />
      </VStack>

      <Box style={{ height: 32 }} />
    </SettingsDetailScreen>
  )
}
