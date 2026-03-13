import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import {
  SelectionOptionRow,
  SettingsCard,
  SettingsDivider,
  SettingsSelectionScreen,
  useJournalSettingsQuery,
  useUpdateJournalSettingsMutation
} from '@/features/settings'
import { useTheme } from '@/context'

type JournalTimeRange = 'ALL_TIME' | 'LAST_7_DAYS' | 'LAST_30_DAYS'

interface TimeRangeOption {
  value: JournalTimeRange
  labelKey: string
}

const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { value: 'ALL_TIME', labelKey: 'settings.journal.allTime' },
  { value: 'LAST_7_DAYS', labelKey: 'settings.journal.last7Days' },
  { value: 'LAST_30_DAYS', labelKey: 'settings.journal.last30Days' }
]

export default function JournalTimeRangeScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { colors } = useTheme()

  const { data: journalSettings, isLoading } = useJournalSettingsQuery()
  const updateJournalSettings = useUpdateJournalSettingsMutation()

  const selectedTimeRange = journalSettings?.filterTimeRange

  const onSelectTimeRange = (filterTimeRange: JournalTimeRange) => {
    if (filterTimeRange === selectedTimeRange || updateJournalSettings.isPending) return

    updateJournalSettings.mutate(
      { filterTimeRange },
      {
        onSuccess: () => {
          router.back()
        }
      }
    )
  }

  return (
    <SettingsSelectionScreen title={t('settings.journal.timeRange')}>
      <SettingsCard marginTop={0}>
        {isLoading ? (
          <View className='py-6 items-center justify-center'>
            <ActivityIndicator size='small' color={colors.tint} />
          </View>
        ) : (
          TIME_RANGE_OPTIONS.map((option, index) => (
            <React.Fragment key={option.value}>
              <SelectionOptionRow
                label={t(option.labelKey)}
                selected={selectedTimeRange === option.value}
                onPress={() => onSelectTimeRange(option.value)}
              />
              {index < TIME_RANGE_OPTIONS.length - 1 && <SettingsDivider inset={16} />}
            </React.Fragment>
          ))
        )}
      </SettingsCard>

      <View className='h-8' />
    </SettingsSelectionScreen>
  )
}
