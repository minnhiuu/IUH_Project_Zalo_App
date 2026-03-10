import React, { useMemo, useState } from 'react'
import { Text, View } from 'react-native'
import SettingsDetailScreen from '@/components/settings-detail-screen'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import {
  SectionLabel,
  ActionRow,
  ToggleRow,
  SwitchBottomSheet,
  SettingsDivider,
  SettingsCard,
  useNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  type NotificationSettings
} from '@/features/settings'

type NotificationTypeKey = 'notifMessages' | 'notifGroups' | 'notifFriendRequests'

const NOTIFICATION_TYPE_ITEMS: { key: NotificationTypeKey; icon: string; titleKey: string; subtitleKey: string }[] = [
  {
    key: 'notifMessages',
    icon: 'chatbubble-outline',
    titleKey: 'settings.notifications.messagesNotif',
    subtitleKey: 'settings.notifications.messagesNotifSubtitle'
  },
  {
    key: 'notifGroups',
    icon: 'people-outline',
    titleKey: 'settings.notifications.groupsNotif',
    subtitleKey: 'settings.notifications.groupsNotifSubtitle'
  },
  {
    key: 'notifFriendRequests',
    icon: 'person-add-outline',
    titleKey: 'settings.notifications.friendRequests',
    subtitleKey: 'settings.notifications.friendRequestsSubtitle'
  }
]

export default function NotificationsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { data: notifSettings, isLoading } = useNotificationSettingsQuery()
  const updateNotification = useUpdateNotificationSettingsMutation()
  const [activeTypeKey, setActiveTypeKey] = useState<NotificationTypeKey | null>(null)

  const allowNotifications = notifSettings?.allowNotifications ?? true
  const sound = notifSettings?.notifSound ?? true
  const vibration = notifSettings?.notifVibration ?? true

  const toggle = (field: string, value: boolean) => {
    updateNotification.mutate({ [field]: value })
  }

  const activeTypeConfig = useMemo(() => {
    if (!activeTypeKey) return null
    return NOTIFICATION_TYPE_ITEMS.find((item) => item.key === activeTypeKey) ?? null
  }, [activeTypeKey])

  const activeTypeValue = activeTypeKey ? Boolean(notifSettings?.[activeTypeKey]) : false

  const handleToggleNotificationType = (nextValue: boolean) => {
    if (!activeTypeKey || updateNotification.isPending || !allowNotifications) return

    updateNotification.mutate({ [activeTypeKey]: nextValue } as Partial<NotificationSettings>, {
      onSuccess: () => {
        setActiveTypeKey(null)
      }
    })
  }

  return (
    <SettingsDetailScreen title={t('settings.menu.notifications.title')}>
      <SectionLabel blue title={t('settings.sections.general')} />
      <SettingsCard>
        <ToggleRow
          icon='notifications-outline'
          title={t('settings.notifications.allowNotifications')}
          subtitle={t('settings.notifications.allowNotificationsSubtitle')}
          value={allowNotifications}
          onValueChange={(v) => toggle('allowNotifications', v)}
          disabled={isLoading || updateNotification.isPending}
        />
        <SettingsDivider />
        <ToggleRow
          icon='volume-high-outline'
          title={t('settings.notifications.sound')}
          subtitle={t('settings.notifications.soundSubtitle')}
          value={sound}
          onValueChange={(v) => toggle('notifSound', v)}
          disabled={isLoading || updateNotification.isPending || !allowNotifications}
        />
        <SettingsDivider />
        <ToggleRow
          icon='phone-portrait-outline'
          title={t('settings.notifications.vibration')}
          subtitle={t('settings.notifications.vibrationSubtitle')}
          value={vibration}
          onValueChange={(v) => toggle('notifVibration', v)}
          disabled={isLoading || updateNotification.isPending || !allowNotifications}
        />
      </SettingsCard>

      <SectionLabel blue title={t('settings.sections.notificationTypes')} />
      <SettingsCard>
        {NOTIFICATION_TYPE_ITEMS.map((item, index) => {
          const isOn = Boolean(notifSettings?.[item.key])

          return (
            <React.Fragment key={item.key}>
              <ActionRow
                icon={item.icon}
                title={t(item.titleKey)}
                subtitle={t(item.subtitleKey)}
                rightComponent={
                  <View className='flex-row items-center gap-1'>
                    <Text className='text-sm text-muted-foreground'>
                      {t(isOn ? 'settings.privacy.on' : 'settings.privacy.off')}
                    </Text>
                    <Ionicons name='chevron-forward' size={20} className='text-icon-secondary' />
                  </View>
                }
                onPress={() => {
                  if (isLoading || updateNotification.isPending || !allowNotifications) return
                  setActiveTypeKey(item.key)
                }}
              />
              {index < NOTIFICATION_TYPE_ITEMS.length - 1 && <SettingsDivider />}
            </React.Fragment>
          )
        })}
      </SettingsCard>

      <SectionLabel blue title={t('settings.sections.doNotDisturb') || 'Do Not Disturb'} />
      <SettingsCard>
        <ActionRow
          icon='moon-outline'
          title={t('settings.notifications.doNotDisturb')}
          subtitle={t('settings.notifications.doNotDisturbSubtitle')}
          onPress={() => router.push('/settings/notifications/do-not-disturb' as any)}
        />
      </SettingsCard>

      <View className='h-8' />

      <SwitchBottomSheet
        visible={Boolean(activeTypeKey && activeTypeConfig)}
        title={activeTypeConfig ? t(activeTypeConfig.titleKey) : ''}
        value={activeTypeValue}
        onClose={() => setActiveTypeKey(null)}
        onValueChange={handleToggleNotificationType}
        isSaving={updateNotification.isPending}
      />
    </SettingsDetailScreen>
  )
}
