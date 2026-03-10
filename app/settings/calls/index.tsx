import React from 'react'
import { View } from 'react-native'
import SettingsDetailScreen from '@/components/settings-detail-screen'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import {
  SectionLabel,
  ActionRow,
  ToggleRow,
  SettingsDivider,
  SettingsCard,
  type AudioQuality,
  type VideoQuality,
  useCallSettingsQuery,
  useUpdateCallSettingsMutation
} from '@/features/settings'

export default function CallsScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { data: callSettings, isLoading } = useCallSettingsQuery()
  const updateCall = useUpdateCallSettingsMutation()

  const allowCalls = callSettings?.allowCalls ?? true
  const allowVideoCalls = callSettings?.allowVideoCalls ?? true
  const keepCallHistory = callSettings?.keepCallHistory ?? true
  const audioQuality = callSettings?.audioQuality ?? 'AUTOMATIC'
  const videoQuality = callSettings?.videoQuality ?? 'HD'

  const toggle = (field: 'allowCalls' | 'allowVideoCalls' | 'keepCallHistory', value: boolean) => {
    updateCall.mutate({ [field]: value })
  }

  const audioQualitySubtitle =
    {
      LOW: t('settings.calls.low'),
      HIGH: t('settings.calls.high'),
      AUTOMATIC: t('settings.calls.automatic')
    }[audioQuality as AudioQuality] ?? t('settings.calls.automatic')

  const videoQualitySubtitle =
    {
      SD: t('settings.calls.sd'),
      HD: t('settings.calls.hd')
    }[videoQuality as VideoQuality] ?? t('settings.calls.hd')

  return (
    <SettingsDetailScreen title={t('settings.menu.calls.title')}>
      <SectionLabel blue title={t('settings.sections.callSettings')} />
      <SettingsCard>
        <ToggleRow
          icon='call-outline'
          title={t('settings.calls.allowCalls')}
          subtitle={t('settings.calls.allowCallsSubtitle')}
          value={allowCalls}
          onValueChange={(v) => toggle('allowCalls', v)}
          disabled={isLoading || updateCall.isPending}
        />
        <SettingsDivider />
        <ToggleRow
          icon='videocam-outline'
          title={t('settings.calls.allowVideoCalls')}
          subtitle={t('settings.calls.allowVideoCallsSubtitle')}
          value={allowVideoCalls}
          onValueChange={(v) => toggle('allowVideoCalls', v)}
          disabled={isLoading || updateCall.isPending}
        />
      </SettingsCard>

      <SectionLabel blue title={t('settings.sections.quality')} />
      <SettingsCard>
        <ActionRow
          icon='musical-notes-outline'
          title={t('settings.calls.audioQuality')}
          subtitle={audioQualitySubtitle}
          onPress={() => router.push('/settings/calls/audio-quality' as any)}
        />
        <SettingsDivider />
        <ActionRow
          icon='videocam-outline'
          title={t('settings.calls.videoQuality')}
          subtitle={videoQualitySubtitle}
          onPress={() => router.push('/settings/calls/video-quality' as any)}
        />
      </SettingsCard>

      <SectionLabel blue title={t('settings.sections.other') || 'Other'} />
      <SettingsCard>
        <ActionRow
          icon='musical-note-outline'
          title={t('settings.calls.ringtone')}
          subtitle={t('settings.calls.ringtoneSubtitle')}
          onPress={() => {}}
        />
        <SettingsDivider />
        <ToggleRow
          icon='time-outline'
          title={t('settings.calls.callHistory')}
          subtitle={t('settings.calls.callHistorySubtitle')}
          value={keepCallHistory}
          onValueChange={(v) => toggle('keepCallHistory', v)}
          disabled={isLoading || updateCall.isPending}
        />
      </SettingsCard>

      <View className='h-8' />
    </SettingsDetailScreen>
  )
}
