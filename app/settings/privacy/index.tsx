import React from 'react'
import { View, Text } from 'react-native'
import SettingsDetailScreen from '@/components/settings-detail-screen'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import {
  SectionLabel,
  SettingsDivider,
  SettingsCard,
  ActionRow,
  usePrivacySettingsQuery,
  mapPrivacySettingsToScreenValueKeys,
  mapBlockedAndHideCount,
  mapFriendSourcesEnabledCount,
  mapUtilityPermissionsCount
} from '@/features/settings'

export default function PrivacyScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { data: privacySettings } = usePrivacySettingsQuery()
  const valueKeys = mapPrivacySettingsToScreenValueKeys(privacySettings)

  const blockedCount = mapBlockedAndHideCount(privacySettings)
  const friendSourcesCount = mapFriendSourcesEnabledCount(privacySettings)
  const utilityPermissionsCount = mapUtilityPermissionsCount(privacySettings)

  return (
    <SettingsDetailScreen title={t('settings.menu.privacy.title')}>
      <SectionLabel blue title={t('settings.privacy.sections.personal')} />
      <SettingsCard marginTop={0}>
        <ActionRow
          icon='calendar-outline'
          title={t('settings.privacy.birthday')}
          rightComponent={
            <View className='flex-row items-center gap-1'>
              <Text className='text-sm text-muted-foreground'>{t(valueKeys.birthday)}</Text>
              <Ionicons name='chevron-forward' size={20} className='text-icon-secondary' />
            </View>
          }
          onPress={() => router.push('/settings/privacy/birthday' as any)}
        />
        <SettingsDivider inset={56} />
        <ActionRow
          icon='person-outline'
          title={t('settings.privacy.showAccessStatus')}
          rightComponent={
            <View className='flex-row items-center gap-1'>
              <Text className='text-sm text-muted-foreground'>{t(valueKeys.showAccessStatus)}</Text>
              <Ionicons name='chevron-forward' size={20} className='text-icon-secondary' />
            </View>
          }
          onPress={() => { }}
        />
      </SettingsCard>

      <SectionLabel blue title={t('settings.privacy.sections.messagesAndCalls')} />
      <SettingsCard marginTop={0}>
        <ActionRow
          icon='checkmark-done-outline'
          title={t('settings.privacy.showSeenStatus')}
          rightComponent={
            <View className='flex-row items-center gap-1'>
              <Text className='text-sm text-muted-foreground'>{t(valueKeys.showSeenStatus)}</Text>
              <Ionicons name='chevron-forward' size={20} className='text-icon-secondary' />
            </View>
          }
          onPress={() => { }}
        />
        <SettingsDivider inset={56} />
        <ActionRow
          icon='chatbubble-outline'
          title={t('settings.privacy.allowMessaging')}
          rightComponent={
            <View className='flex-row items-center gap-1'>
              <Text className='text-sm text-muted-foreground'>{t(valueKeys.allowMessaging)}</Text>
              <Ionicons name='chevron-forward' size={20} className='text-icon-secondary' />
            </View>
          }
          onPress={() => router.push('/settings/privacy/allow-messaging' as any)}
        />
        <SettingsDivider inset={56} />
        <ActionRow
          icon='call-outline'
          title={t('settings.privacy.allowCalls')}
          rightComponent={
            <View className='flex-row items-center gap-1'>
              <Text className='text-sm text-muted-foreground'>{t(valueKeys.allowCalls)}</Text>
              <Ionicons name='chevron-forward' size={20} className='text-icon-secondary' />
            </View>
          }
          onPress={() => router.push('/settings/privacy/allow-calls' as any)}
        />
      </SettingsCard>

      <SectionLabel blue title={t('settings.privacy.sections.journal')} />
      <SettingsCard marginTop={0}>
        <ActionRow
          icon='create-outline'
          title={t('settings.privacy.allowViewAndComment')}
          rightComponent={
            <View className='flex-row items-center gap-1'>
              <Text className='text-sm text-muted-foreground'>{t(valueKeys.allowViewAndComment)}</Text>
              <Ionicons name='chevron-forward' size={20} className='text-icon-secondary' />
            </View>
          }
          onPress={() => { }}
        />
        <SettingsDivider inset={56} />
        <ActionRow
          icon='ban-outline'
          title={t('settings.privacy.blockAndHide')}
          rightComponent={
            <View className='flex-row items-center gap-1'>
              <Text className='text-sm text-muted-foreground'>{blockedCount}</Text>
              <Ionicons name='chevron-forward' size={20} className='text-icon-secondary' />
            </View>
          }
          onPress={() => router.push('/settings/privacy/blocked-users' as any)}
        />
      </SettingsCard>

      <SectionLabel blue title={t('settings.privacy.sections.searchAndFriend')} />
      <SettingsCard marginTop={0}>
        <ActionRow
          icon='people-outline'
          title={t('settings.privacy.manageFriendSources')}
          rightComponent={
            <View className='flex-row items-center gap-1'>
              <Text className='text-sm text-muted-foreground'>{friendSourcesCount}</Text>
              <Ionicons name='chevron-forward' size={20} className='text-icon-secondary' />
            </View>
          }
          onPress={() => router.push('/settings/privacy/friend-sources' as any)}
        />
      </SettingsCard>

      <SectionLabel blue title={t('settings.privacy.sections.utilities')} />
      <SettingsCard marginTop={0}>
        <ActionRow
          icon='apps-outline'
          title={t('settings.privacy.utilities')}
          rightComponent={
            <View className='flex-row items-center gap-1'>
              <Text className='text-sm text-muted-foreground'>{utilityPermissionsCount}</Text>
              <Ionicons name='chevron-forward' size={20} className='text-icon-secondary' />
            </View>
          }
          onPress={() => { }}
        />
      </SettingsCard>

      <View className='h-8' />
    </SettingsDetailScreen>
  )
}
