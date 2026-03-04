import React from 'react'
import { View } from 'react-native'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { Box, VStack, HStack, Text, MenuItem } from '@/components/ui'
import { useTranslation } from 'react-i18next'

// Section header - blue text like Zalo
const SectionHeader = ({ title }: { title: string }) => (
  <Box style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8, backgroundColor: '#f5f5f5' }}>
    <Text style={{ fontSize: 14, fontWeight: '600', color: '#0068FF' }}>
      {title}
    </Text>
  </Box>
)

export default function PrivacyScreen() {
  const { t } = useTranslation()

  return (
    <SettingsDetailScreen title={t('settings.menu.privacy.title')}>
      {/* Cá nhân */}
      <SectionHeader title={t('settings.privacy.sections.personal')} />

      <VStack style={{ backgroundColor: '#ffffff' }}>
        <MenuItem
          icon="calendar-outline"
          iconColor="#555"
          title={t('settings.privacy.birthday')}
          onPress={() => {}}
        />
        <MenuItem
          icon="person-outline"
          iconColor="#555"
          title={t('settings.privacy.showAccessStatus')}
          rightComponent={
            <HStack style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>
                {t('settings.privacy.on')}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </HStack>
          }
          onPress={() => {}}
        />
      </VStack>

      {/* Tin nhắn và cuộc gọi */}
      <SectionHeader title={t('settings.privacy.sections.messagesAndCalls')} />

      <VStack style={{ backgroundColor: '#ffffff' }}>
        <MenuItem
          icon="checkmark-done-outline"
          iconColor="#555"
          title={t('settings.privacy.showSeenStatus')}
          rightComponent={
            <HStack style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>
                {t('settings.privacy.off')}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </HStack>
          }
          onPress={() => {}}
        />
        <MenuItem
          icon="chatbubble-outline"
          iconColor="#555"
          title={t('settings.privacy.allowMessaging')}
          rightComponent={
            <HStack style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>
                {t('settings.privacy.everyone')}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </HStack>
          }
          onPress={() => {}}
        />
        <MenuItem
          icon="call-outline"
          iconColor="#555"
          title={t('settings.privacy.allowCalls')}
          rightComponent={
            <HStack style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 14, color: '#6b7280', maxWidth: 150, textAlign: 'right' }}>
                {t('settings.privacy.friendsAndContacted')}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </HStack>
          }
          onPress={() => {}}
        />
      </VStack>

      {/* Nhật ký */}
      <SectionHeader title={t('settings.privacy.sections.journal')} />

      <VStack style={{ backgroundColor: '#ffffff' }}>
        <MenuItem
          icon="create-outline"
          iconColor="#555"
          title={t('settings.privacy.allowViewAndComment')}
          onPress={() => {}}
        />
        <MenuItem
          icon="ban-outline"
          iconColor="#555"
          title={t('settings.privacy.blockAndHide')}
          onPress={() => {}}
        />
      </VStack>

      {/* Nguồn tìm kiếm và kết bạn */}
      <SectionHeader title={t('settings.privacy.sections.searchAndFriend')} />

      <VStack style={{ backgroundColor: '#ffffff' }}>
        <MenuItem
          icon="people-outline"
          iconColor="#555"
          title={t('settings.privacy.manageFriendSources')}
          onPress={() => {}}
        />
      </VStack>

      {/* Quyền của tiện ích */}
      <SectionHeader title={t('settings.privacy.sections.utilities')} />

      <VStack style={{ backgroundColor: '#ffffff' }}>
        <MenuItem
          icon="apps-outline"
          iconColor="#555"
          title={t('settings.privacy.utilities')}
          onPress={() => {}}
        />
      </VStack>

      <Box style={{ height: 32 }} />
    </SettingsDetailScreen>
  )
}
