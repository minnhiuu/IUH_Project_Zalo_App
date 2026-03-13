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
  type SettingScope
} from '@/features/settings'
import { useTheme } from '@/context'

interface ScopeOption {
  value: SettingScope
  labelKey: string
}

const SCOPE_OPTIONS: ScopeOption[] = [
  { value: 'EVERYONE', labelKey: 'settings.privacy.everyone' },
  { value: 'FRIENDS', labelKey: 'settings.privacy.friends' },
  { value: 'FRIENDS_AND_CONTACTED', labelKey: 'settings.privacy.friendsAndContacted' },
  { value: 'ONLY_ME', labelKey: 'settings.privacy.onlyMe' }
]

export default function AllowMessagingScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { colors } = useTheme()

  const { data: privacySettings, isLoading } = usePrivacySettingsQuery()
  const updatePrivacySettings = useUpdatePrivacySettingsMutation()

  const selectedScope = privacySettings?.allowMessaging

  const onSelectScope = (scope: SettingScope) => {
    if (scope === selectedScope || updatePrivacySettings.isPending) return

    updatePrivacySettings.mutate(
      { allowMessaging: scope },
      {
        onSuccess: () => {
          router.back()
        }
      }
    )
  }

  return (
    <SettingsSelectionScreen title={t('settings.privacy.allowMessaging')}>
      <SettingsCard marginTop={0}>
        {isLoading ? (
          <View className='py-6 items-center justify-center'>
            <ActivityIndicator size='small' color={colors.tint} />
          </View>
        ) : (
          SCOPE_OPTIONS.map((option, index) => (
            <React.Fragment key={option.value}>
              <SelectionOptionRow
                label={t(option.labelKey)}
                selected={selectedScope === option.value}
                onPress={() => onSelectScope(option.value)}
              />
              {index < SCOPE_OPTIONS.length - 1 && <SettingsDivider inset={16} />}
            </React.Fragment>
          ))
        )}
      </SettingsCard>

      <View className='h-8' />
    </SettingsSelectionScreen>
  )
}
