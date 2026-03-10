import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import {
  SelectionOptionRow,
  SettingsCard,
  SettingsDivider,
  SettingsSelectionScreen,
  useMessageSettingsQuery,
  useUpdateMessageSettingsMutation,
  type ChatFontSize
} from '@/features/settings'
import { useTheme } from '@/context'

interface FontSizeOption {
  value: ChatFontSize
  labelKey: string
}

const FONT_SIZE_OPTIONS: FontSizeOption[] = [
  { value: 'SMALL', labelKey: 'settings.messages.fontSizeSmall' },
  { value: 'MEDIUM', labelKey: 'settings.messages.fontSizeMedium' },
  { value: 'LARGE', labelKey: 'settings.messages.fontSizeLarge' }
]

export default function MessageFontSizeScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { colors } = useTheme()

  const { data: messageSettings, isLoading } = useMessageSettingsQuery()
  const updateMessageSettings = useUpdateMessageSettingsMutation()

  const selectedFontSize = messageSettings?.fontSize

  const onSelectFontSize = (fontSize: ChatFontSize) => {
    if (fontSize === selectedFontSize || updateMessageSettings.isPending) return

    updateMessageSettings.mutate(
      { fontSize },
      {
        onSuccess: () => {
          router.back()
        }
      }
    )
  }

  return (
    <SettingsSelectionScreen title={t('settings.messages.fontSize')}>
      <SettingsCard marginTop={0}>
        {isLoading ? (
          <View className='py-6 items-center justify-center'>
            <ActivityIndicator size='small' color={colors.tint} />
          </View>
        ) : (
          FONT_SIZE_OPTIONS.map((option, index) => (
            <React.Fragment key={option.value}>
              <SelectionOptionRow
                label={t(option.labelKey)}
                selected={selectedFontSize === option.value}
                onPress={() => onSelectFontSize(option.value)}
              />
              {index < FONT_SIZE_OPTIONS.length - 1 && <SettingsDivider inset={16} />}
            </React.Fragment>
          ))
        )}
      </SettingsCard>

      <View className='h-8' />
    </SettingsSelectionScreen>
  )
}
