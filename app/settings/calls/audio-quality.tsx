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
  type AudioQuality
} from '@/features/settings'
import { useTheme } from '@/context'

interface AudioQualityOption {
  value: AudioQuality
  labelKey: string
}

const AUDIO_QUALITY_OPTIONS: AudioQualityOption[] = [
  { value: 'LOW', labelKey: 'settings.calls.low' },
  { value: 'HIGH', labelKey: 'settings.calls.high' },
  { value: 'AUTOMATIC', labelKey: 'settings.calls.automatic' }
]

export default function AudioQualityScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { colors } = useTheme()

  const { data: callSettings, isLoading } = useCallSettingsQuery()
  const updateCallSettings = useUpdateCallSettingsMutation()

  const selectedAudioQuality = callSettings?.audioQuality

  const onSelectAudioQuality = (audioQuality: AudioQuality) => {
    if (audioQuality === selectedAudioQuality || updateCallSettings.isPending) return

    updateCallSettings.mutate(
      { audioQuality },
      {
        onSuccess: () => {
          router.back()
        }
      }
    )
  }

  return (
    <SettingsSelectionScreen title={t('settings.calls.audioQuality')}>
      <SettingsCard marginTop={0}>
        {isLoading ? (
          <View className='py-6 items-center justify-center'>
            <ActivityIndicator size='small' color={colors.tint} />
          </View>
        ) : (
          AUDIO_QUALITY_OPTIONS.map((option, index) => (
            <React.Fragment key={option.value}>
              <SelectionOptionRow
                label={t(option.labelKey)}
                selected={selectedAudioQuality === option.value}
                onPress={() => onSelectAudioQuality(option.value)}
              />
              {index < AUDIO_QUALITY_OPTIONS.length - 1 && <SettingsDivider inset={16} />}
            </React.Fragment>
          ))
        )}
      </SettingsCard>

      <View className='h-8' />
    </SettingsSelectionScreen>
  )
}
