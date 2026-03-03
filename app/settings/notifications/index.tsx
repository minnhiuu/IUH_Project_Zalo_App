import React from 'react'
import { View, Text, Switch, TouchableOpacity } from 'react-native'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'

function SectionLabel({ title }: { title: string }) {
  return (
    <View className="px-4 pt-5 pb-2">
      <Text className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{title}</Text>
    </View>
  )
}

function Divider() {
  return <View className="h-px bg-gray-100 ml-16" />
}

function ToggleRow({ icon, iconBg, iconColor, title, subtitle, value, onValueChange }: {
  icon: string; iconBg: string; iconColor: string
  title: string; subtitle: string; value: boolean; onValueChange: (v: boolean) => void
}) {
  return (
    <View className="flex-row items-center px-4 py-3 gap-3 bg-white">
      <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: iconBg }}>
        <Ionicons name={icon as any} size={22} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-base text-gray-900">{title}</Text>
        <Text className="text-sm text-gray-500 mt-0.5">{subtitle}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: '#0068FF' }} />
    </View>
  )
}

function ActionRow({ icon, iconBg, iconColor, title, subtitle, onPress }: {
  icon: string; iconBg: string; iconColor: string
  title: string; subtitle?: string; onPress: () => void
}) {
  return (
    <TouchableOpacity className="flex-row items-center px-4 py-3 gap-3 bg-white active:bg-gray-50" onPress={onPress}>
      <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: iconBg }}>
        <Ionicons name={icon as any} size={22} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-base text-gray-900">{title}</Text>
        {subtitle && <Text className="text-sm text-gray-500 mt-0.5">{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
    </TouchableOpacity>
  )
}

export default function NotificationsScreen() {
  const { t } = useTranslation()
  const [allowNotifications, setAllowNotifications] = React.useState(true)
  const [sound, setSound] = React.useState(true)
  const [vibration, setVibration] = React.useState(true)

  return (
    <SettingsDetailScreen title={t('settings.menu.notifications.title')}>
      <SectionLabel title={t('settings.sections.general')} />
      <View className="bg-white">
        <ToggleRow
          icon="notifications-outline" iconBg="#E8F0FE" iconColor="#0068FF"
          title={t('settings.notifications.allowNotifications')}
          subtitle={t('settings.notifications.allowNotificationsSubtitle')}
          value={allowNotifications} onValueChange={setAllowNotifications}
        />
        <Divider />
        <ToggleRow
          icon="volume-high-outline" iconBg="#E3F2FD" iconColor="#2196F3"
          title={t('settings.notifications.sound')}
          subtitle={t('settings.notifications.soundSubtitle')}
          value={sound} onValueChange={setSound}
        />
        <Divider />
        <ToggleRow
          icon="phone-portrait-outline" iconBg="#F3E5F5" iconColor="#9C27B0"
          title={t('settings.notifications.vibration')}
          subtitle={t('settings.notifications.vibrationSubtitle')}
          value={vibration} onValueChange={setVibration}
        />
      </View>

      <SectionLabel title={t('settings.sections.notificationTypes')} />
      <View className="bg-white">
        <ActionRow
          icon="chatbubble-outline" iconBg="#E8F5E9" iconColor="#4CAF50"
          title={t('settings.notifications.messagesNotif')}
          subtitle={t('settings.notifications.messagesNotifSubtitle')}
          onPress={() => { }}
        />
        <Divider />
        <ActionRow
          icon="people-outline" iconBg="#FFF3E0" iconColor="#FF9800"
          title={t('settings.notifications.groupsNotif')}
          subtitle={t('settings.notifications.groupsNotifSubtitle')}
          onPress={() => { }}
        />
        <Divider />
        <ActionRow
          icon="person-add-outline" iconBg="#E3F2FD" iconColor="#2196F3"
          title={t('settings.notifications.friendRequests')}
          subtitle={t('settings.notifications.friendRequestsSubtitle')}
          onPress={() => { }}
        />
      </View>

      <SectionLabel title={t('settings.sections.doNotDisturb') || 'Do Not Disturb'} />
      <View className="bg-white">
        <ActionRow
          icon="moon-outline" iconBg="#ECEFF1" iconColor="#607D8B"
          title={t('settings.notifications.doNotDisturb')}
          subtitle={t('settings.notifications.doNotDisturbSubtitle')}
          onPress={() => { }}
        />
      </View>

      <View className="h-8" />
    </SettingsDetailScreen>
  )
}
