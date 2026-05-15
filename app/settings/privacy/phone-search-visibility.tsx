import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import {
  SelectionOptionRow,
  SettingsCard,
  SettingsDivider,
  SettingsSelectionScreen,
  usePrivacySettingsQuery,
  useUpdatePrivacySettingsMutation,
  type SearchVisibility
} from '@/features/settings'
import { useTheme } from '@/context'

interface SearchVisibilityOption {
  value: SearchVisibility
  labelKey: string
}

const PHONE_SEARCH_VISIBILITY_OPTIONS: SearchVisibilityOption[] = [
  { value: 'PUBLIC', labelKey: 'settings.privacy.searchVisibility.public' },
  { value: 'FRIENDS_OF_FRIENDS', labelKey: 'settings.privacy.searchVisibility.friendsOfFriends' },
  { value: 'FRIENDS_ONLY', labelKey: 'settings.privacy.searchVisibility.friendsOnly' },
  { value: 'NONE', labelKey: 'settings.privacy.searchVisibility.none' }
]

export default function PhoneSearchVisibilityScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { colors } = useTheme()

  const { data: privacySettings, isLoading } = usePrivacySettingsQuery()
  const updatePrivacySettings = useUpdatePrivacySettingsMutation()

  const selectedVisibility = privacySettings?.phoneSearchVisibility

  const onSelectVisibility = (visibility: SearchVisibility) => {
    if (visibility === selectedVisibility || updatePrivacySettings.isPending) return

    updatePrivacySettings.mutate(
      { phoneSearchVisibility: visibility },
      {
        onSuccess: () => {
          router.back()
        }
      }
    )
  }

  return (
    <SettingsSelectionScreen title={t('settings.privacy.phoneSearchVisibility')}>
      <SettingsCard marginTop={0}>
        {isLoading ? (
          <View className='py-6 items-center justify-center'>
            <ActivityIndicator size='small' color={colors.tint} />
          </View>
        ) : (
          PHONE_SEARCH_VISIBILITY_OPTIONS.map((option, index) => (
            <React.Fragment key={option.value}>
              <SelectionOptionRow
                label={t(option.labelKey)}
                selected={selectedVisibility === option.value}
                onPress={() => onSelectVisibility(option.value)}
              />
              {index < PHONE_SEARCH_VISIBILITY_OPTIONS.length - 1 && <SettingsDivider inset={16} />}
            </React.Fragment>
          ))
        )}
      </SettingsCard>

      <View className='h-8' />
    </SettingsSelectionScreen>
  )
}
