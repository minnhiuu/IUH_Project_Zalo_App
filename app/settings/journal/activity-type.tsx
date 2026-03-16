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

type JournalActivityType = 'ALL' | 'LOGIN' | 'PASSWORD_CHANGE' | 'NEW_FRIEND'

interface ActivityTypeOption {
  value: JournalActivityType
  labelKey: string
}

const ACTIVITY_TYPE_OPTIONS: ActivityTypeOption[] = [
  { value: 'ALL', labelKey: 'settings.journal.all' },
  { value: 'LOGIN', labelKey: 'settings.journal.login' },
  { value: 'PASSWORD_CHANGE', labelKey: 'settings.journal.passwordChange' },
  { value: 'NEW_FRIEND', labelKey: 'settings.journal.newFriend' }
]

export default function JournalActivityTypeScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { colors } = useTheme()

  const { data: journalSettings, isLoading } = useJournalSettingsQuery()
  const updateJournalSettings = useUpdateJournalSettingsMutation()

  const selectedActivityType = journalSettings?.filterActivityType

  const onSelectActivityType = (filterActivityType: JournalActivityType) => {
    if (filterActivityType === selectedActivityType || updateJournalSettings.isPending) return

    updateJournalSettings.mutate(
      { filterActivityType },
      {
        onSuccess: () => {
          router.back()
        }
      }
    )
  }

  return (
    <SettingsSelectionScreen title={t('settings.journal.activityType')}>
      <SettingsCard marginTop={0}>
        {isLoading ? (
          <View className='py-6 items-center justify-center'>
            <ActivityIndicator size='small' color={colors.tint} />
          </View>
        ) : (
          ACTIVITY_TYPE_OPTIONS.map((option, index) => (
            <React.Fragment key={option.value}>
              <SelectionOptionRow
                label={t(option.labelKey)}
                selected={selectedActivityType === option.value}
                onPress={() => onSelectActivityType(option.value)}
              />
              {index < ACTIVITY_TYPE_OPTIONS.length - 1 && <SettingsDivider inset={16} />}
            </React.Fragment>
          ))
        )}
      </SettingsCard>

      <View className='h-8' />
    </SettingsSelectionScreen>
  )
}
