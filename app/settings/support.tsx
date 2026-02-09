import React from 'react'
import { Box, VStack, Divider } from '@gluestack-ui/themed'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { ListItem } from '@/components/ui'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'

export default function SupportScreen() {
  const { t } = useTranslation()

  return (
    <SettingsDetailScreen title={t('settings.menu.support.title')}>
      {/* Support Options */}
      <VStack bg='$white' mt='$2' mb='$8'>
        <ListItem
          title={t('settings.support.faq')}
          subtitle={t('settings.support.faqSubtitle')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='book-outline' size={22} color='#0068FF' />
            </View>
          }
          onPress={() => {}}
        />
        <Divider ml='$16' />

        <ListItem
          title={t('settings.support.chatSupport')}
          subtitle={t('settings.support.chatSupportSubtitle')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='chatbubble-outline' size={22} color='#4CAF50' />
            </View>
          }
          onPress={() => {}}
        />
        <Divider ml='$16' />

        <ListItem
          title={t('settings.support.email')}
          subtitle='support@zalo.me'
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF3E0', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='mail-outline' size={22} color='#FF9800' />
            </View>
          }
          showArrow={false}
        />
        <Divider ml='$16' />

        <ListItem
          title={t('settings.support.hotline')}
          subtitle='1900 1234'
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='call-outline' size={22} color='#2196F3' />
            </View>
          }
          showArrow={false}
        />
      </VStack>
    </SettingsDetailScreen>
  )
}
