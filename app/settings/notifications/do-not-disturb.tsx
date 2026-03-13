import React, { useMemo, useState } from 'react'
import { Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import {
  ActionRow,
  SettingsCard,
  SettingsDivider,
  SettingsSelectionScreen,
  TimeInputBottomSheet,
  ToggleRow,
  useNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  type NotificationSettings
} from '@/features/settings'

type DndTimeKey = 'dndStartTime' | 'dndEndTime'

const parseTime = (time: string): { hour: number; minute: number } => {
  const [hourPart, minutePart] = time.split(':')
  const parsedHour = Number(hourPart)
  const parsedMinute = Number(minutePart)

  const hour = Number.isFinite(parsedHour) && parsedHour >= 1 && parsedHour <= 24 ? parsedHour : 1
  const minute = Number.isFinite(parsedMinute) && parsedMinute >= 0 && parsedMinute <= 59 ? parsedMinute : 0

  return { hour, minute }
}

export default function DoNotDisturbScreen() {
  const { t } = useTranslation()
  const { data: notifSettings, isLoading } = useNotificationSettingsQuery()
  const updateNotification = useUpdateNotificationSettingsMutation()

  const [activeTimeKey, setActiveTimeKey] = useState<DndTimeKey | null>(null)
  const [selectedHour, setSelectedHour] = useState(1)
  const [selectedMinute, setSelectedMinute] = useState(0)

  const dndEnabled = notifSettings?.doNotDisturb?.dndEnabled ?? false
  const dndStartTime = notifSettings?.doNotDisturb?.dndStartTime ?? '22:00'
  const dndEndTime = notifSettings?.doNotDisturb?.dndEndTime ?? '07:00'

  const activeTitleKey = useMemo(() => {
    if (activeTimeKey === 'dndStartTime') return 'settings.notifications.dndStartTime'
    if (activeTimeKey === 'dndEndTime') return 'settings.notifications.dndEndTime'
    return ''
  }, [activeTimeKey])

  const updateDoNotDisturb = (patch: Partial<NotificationSettings['doNotDisturb']>, onSuccess?: () => void) => {
    updateNotification.mutate(
      {
        doNotDisturb: {
          dndEnabled,
          dndStartTime,
          dndEndTime,
          ...patch
        }
      } as Partial<NotificationSettings>,
      {
        onSuccess
      }
    )
  }

  const handleToggleEnabled = (nextValue: boolean) => {
    if (isLoading || updateNotification.isPending) return
    updateDoNotDisturb({ dndEnabled: nextValue })
  }

  const openTimeSheet = (key: DndTimeKey) => {
    if (isLoading || updateNotification.isPending) return

    setActiveTimeKey(key)
    const currentTime = key === 'dndStartTime' ? dndStartTime : dndEndTime
    const { hour, minute } = parseTime(currentTime)
    setSelectedHour(hour)
    setSelectedMinute(minute)
  }

  const closeTimeSheet = () => {
    if (updateNotification.isPending) return
    setActiveTimeKey(null)
  }

  const handleSaveTime = () => {
    if (!activeTimeKey || updateNotification.isPending) return

    const nextTime = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`
    updateDoNotDisturb({ [activeTimeKey]: nextTime }, () => {
      setActiveTimeKey(null)
    })
  }

  return (
    <SettingsSelectionScreen title={t('settings.notifications.doNotDisturb')}>
      <SettingsCard marginTop={0}>
        <ToggleRow
          icon='moon-outline'
          title={t('settings.notifications.dndEnabled')}
          value={dndEnabled}
          onValueChange={handleToggleEnabled}
          disabled={isLoading || updateNotification.isPending}
        />
        <SettingsDivider inset={56} />
        <ActionRow
          icon='time-outline'
          title={t('settings.notifications.dndStartTime')}
          rightComponent={
            <View className='flex-row items-center gap-1'>
              <Text className='text-sm text-muted-foreground'>{dndStartTime}</Text>
              <Ionicons name='chevron-forward' size={20} className='text-icon-secondary' />
            </View>
          }
          onPress={() => openTimeSheet('dndStartTime')}
        />
        <SettingsDivider inset={56} />
        <ActionRow
          icon='alarm-outline'
          title={t('settings.notifications.dndEndTime')}
          rightComponent={
            <View className='flex-row items-center gap-1'>
              <Text className='text-sm text-muted-foreground'>{dndEndTime}</Text>
              <Ionicons name='chevron-forward' size={20} className='text-icon-secondary' />
            </View>
          }
          onPress={() => openTimeSheet('dndEndTime')}
        />
      </SettingsCard>

      <View className='h-8' />

      <TimeInputBottomSheet
        visible={Boolean(activeTimeKey)}
        title={activeTitleKey ? t(activeTitleKey) : ''}
        hour={selectedHour}
        minute={selectedMinute}
        isSaving={updateNotification.isPending}
        onChangeHour={setSelectedHour}
        onChangeMinute={setSelectedMinute}
        onClose={closeTimeSheet}
        onSave={handleSaveTime}
      />
    </SettingsSelectionScreen>
  )
}
