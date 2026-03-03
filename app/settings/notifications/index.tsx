import React from 'react'
import { View, Text, Switch, TouchableOpacity } from 'react-native'
import SettingsDetailScreen from '@/components/settings-detail-screen'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { SectionLabel, ActionRow, ToggleRow, SettingsDivider, SettingsCard } from '@/features/settings'

export default function NotificationsScreen() {
  const { t } = useTranslation()
  const [allowNotifications, setAllowNotifications] = React.useState(true)
  const [sound, setSound] = React.useState(true)
  const [vibration, setVibration] = React.useState(true)

  return (
    <SettingsDetailScreen title={t('settings.menu.notifications.title')}>
      <SectionLabel blue title={t('settings.sections.general')} />
      <SettingsCard>
        <ToggleRow
          icon="notifications-outline" iconBg="#E8F0FE" iconColor="#0068FF"
          title={t('settings.notifications.allowNotifications')}
          subtitle={t('settings.notifications.allowNotificationsSubtitle')}
          value={allowNotifications} onValueChange={setAllowNotifications}
        />
        <SettingsDivider />
        <ToggleRow
          icon="volume-high-outline" iconBg="#E3F2FD" iconColor="#2196F3"
          title={t('settings.notifications.sound')}
          subtitle={t('settings.notifications.soundSubtitle')}
          value={sound} onValueChange={setSound}
        />
        <SettingsDivider />
        <ToggleRow
          icon="phone-portrait-outline" iconBg="#F3E5F5" iconColor="#9C27B0"
          title={t('settings.notifications.vibration')}
          subtitle={t('settings.notifications.vibrationSubtitle')}
          value={vibration} onValueChange={setVibration}
        />
      </SettingsCard>

      <SectionLabel blue title={t('settings.sections.notificationTypes')} />
      <SettingsCard>
        <ActionRow
          icon="chatbubble-outline" iconBg="#E8F5E9" iconColor="#4CAF50"
          title={t('settings.notifications.messagesNotif')}
          subtitle={t('settings.notifications.messagesNotifSubtitle')}
          onPress={() => { }}
        />
        <SettingsDivider />
        <ActionRow
          icon="people-outline" iconBg="#FFF3E0" iconColor="#FF9800"
          title={t('settings.notifications.groupsNotif')}
          subtitle={t('settings.notifications.groupsNotifSubtitle')}
          onPress={() => { }}
        />
        <SettingsDivider />
        <ActionRow
          icon="person-add-outline" iconBg="#E3F2FD" iconColor="#2196F3"
          title={t('settings.notifications.friendRequests')}
          subtitle={t('settings.notifications.friendRequestsSubtitle')}
          onPress={() => { }}
        />
      </SettingsCard>

      <SectionLabel blue title={t('settings.sections.doNotDisturb') || 'Do Not Disturb'} />
      <SettingsCard>
        <ActionRow
          icon="moon-outline" iconBg="#ECEFF1" iconColor="#607D8B"
          title={t('settings.notifications.doNotDisturb')}
          subtitle={t('settings.notifications.doNotDisturbSubtitle')}
          onPress={() => { }}
        />
      </SettingsCard>

      <View className="h-8" />
    </SettingsDetailScreen>
  )
}
