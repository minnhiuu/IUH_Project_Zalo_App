import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import {
  SelectionOptionRow,
  SettingsCard,
  SettingsDivider,
  SettingsSelectionScreen,
  useCallSettingsQuery,
  useUpdateCallSettingsMutation,
  type VideoQuality
} from '@/features/settings'
import { useTheme } from '@/context'

interface VideoQualityOption {
  value: VideoQuality
  labelKey: string
}

const VIDEO_QUALITY_OPTIONS: VideoQualityOption[] = [
  { value: 'SD', labelKey: 'settings.calls.sd' },
  { value: 'HD', labelKey: 'settings.calls.hd' }
]

export default function VideoQualityScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { colors } = useTheme()

  const { data: callSettings, isLoading } = useCallSettingsQuery()
  const updateCallSettings = useUpdateCallSettingsMutation()

  const selectedVideoQuality = callSettings?.videoQuality

  const onSelectVideoQuality = (videoQuality: VideoQuality) => {
    if (videoQuality === selectedVideoQuality || updateCallSettings.isPending) return

    updateCallSettings.mutate(
      { videoQuality },
      {
        onSuccess: () => {
          router.back()
        }
      }
    )
  }

  return (
    <SettingsSelectionScreen title={t('settings.calls.videoQuality')}>
      <SettingsCard marginTop={0}>
        {isLoading ? (
          <View className='py-6 items-center justify-center'>
            <ActivityIndicator size='small' color={colors.tint} />
          </View>
        ) : (
          VIDEO_QUALITY_OPTIONS.map((option, index) => (
            <React.Fragment key={option.value}>
              <SelectionOptionRow
                label={t(option.labelKey)}
                selected={selectedVideoQuality === option.value}
                onPress={() => onSelectVideoQuality(option.value)}
              />
              {index < VIDEO_QUALITY_OPTIONS.length - 1 && <SettingsDivider inset={16} />}
            </React.Fragment>
          ))
        )}
      </SettingsCard>

      <View className='h-8' />
    </SettingsSelectionScreen>
  )
}
