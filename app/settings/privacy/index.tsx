import React from 'react'
import { View } from 'react-native'
import SettingsDetailScreen from '@/components/settings-detail-screen'
import { useTranslation } from 'react-i18next'
import { SectionLabel, SettingsDivider, SettingsCard } from '@/features/settings'
import { PrivacyActionRow } from '@/features/settings/privacy'

export default function PrivacyScreen() {
  const { t } = useTranslation()

  return (
    <SettingsDetailScreen title={t('settings.menu.privacy.title')}>
      <SectionLabel blue title={t('settings.privacy.sections.personal')} />
      <SettingsCard marginTop={0}>
        <PrivacyActionRow icon="calendar-outline" title={t('settings.privacy.birthday')} onPress={() => { }} />
        <SettingsDivider inset={56} />
        <PrivacyActionRow icon="person-outline" title={t('settings.privacy.showAccessStatus')} value={t('settings.privacy.on')} onPress={() => { }} />
      </SettingsCard>

      <SectionLabel blue title={t('settings.privacy.sections.messagesAndCalls')} />
      <SettingsCard marginTop={0}>
        <PrivacyActionRow icon="checkmark-done-outline" title={t('settings.privacy.showSeenStatus')} value={t('settings.privacy.off')} onPress={() => { }} />
        <SettingsDivider inset={56} />
        <PrivacyActionRow icon="chatbubble-outline" title={t('settings.privacy.allowMessaging')} value={t('settings.privacy.everyone')} onPress={() => { }} />
        <SettingsDivider inset={56} />
        <PrivacyActionRow icon="call-outline" title={t('settings.privacy.allowCalls')} value={t('settings.privacy.friendsAndContacted')} onPress={() => { }} />
      </SettingsCard>

      <SectionLabel blue title={t('settings.privacy.sections.journal')} />
      <SettingsCard marginTop={0}>
        <PrivacyActionRow icon="create-outline" title={t('settings.privacy.allowViewAndComment')} onPress={() => { }} />
        <SettingsDivider inset={56} />
        <PrivacyActionRow icon="ban-outline" title={t('settings.privacy.blockAndHide')} onPress={() => { }} />
      </SettingsCard>

      <SectionLabel blue title={t('settings.privacy.sections.searchAndFriend')} />
      <SettingsCard marginTop={0}>
        <PrivacyActionRow icon="people-outline" title={t('settings.privacy.manageFriendSources')} onPress={() => { }} />
      </SettingsCard>

      <SectionLabel blue title={t('settings.privacy.sections.utilities')} />
      <SettingsCard marginTop={0}>
        <PrivacyActionRow icon="apps-outline" title={t('settings.privacy.utilities')} onPress={() => { }} />
      </SettingsCard>

      <View className="h-8" />
    </SettingsDetailScreen>
  )
}
