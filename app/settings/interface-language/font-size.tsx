import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import {
  SelectionOptionRow,
  SettingsCard,
  SettingsDivider,
  SettingsSelectionScreen,
  useLanguageAndInterfaceSettingsQuery,
  useUpdateLanguageAndInterfaceMutation
} from '@/features/settings'
import { useTheme } from '@/context'

interface FontScaleOption {
  value: number
  labelKey: string
}

const FONT_SCALE_OPTIONS: FontScaleOption[] = [
  { value: 0.9, labelKey: 'settings.interfaceLanguage.fontSizeSmall' },
  { value: 1.0, labelKey: 'settings.interfaceLanguage.fontSizeMedium' },
  { value: 1.1, labelKey: 'settings.interfaceLanguage.fontSizeLarge' }
]

const getClosestFontScale = (value: number) => {
  return FONT_SCALE_OPTIONS.reduce((closest, option) => {
    return Math.abs(option.value - value) < Math.abs(closest.value - value) ? option : closest
  }, FONT_SCALE_OPTIONS[1]).value
}

export default function InterfaceFontSizeScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { colors } = useTheme()

  const { data: languageAndInterfaceSettings, isLoading } = useLanguageAndInterfaceSettingsQuery()
  const updateLanguageAndInterface = useUpdateLanguageAndInterfaceMutation()

  const selectedFontScale = getClosestFontScale(languageAndInterfaceSettings?.fontScale ?? 1)

  const onSelectFontScale = (fontScale: number) => {
    if (fontScale === selectedFontScale || updateLanguageAndInterface.isPending) return

    updateLanguageAndInterface.mutate(
      { fontScale },
      {
        onSuccess: () => {
          router.back()
        }
      }
    )
  }

  return (
    <SettingsSelectionScreen title={t('settings.interfaceLanguage.changeFontSize')}>
      <SettingsCard marginTop={0}>
        {isLoading ? (
          <View className='py-6 items-center justify-center'>
            <ActivityIndicator size='small' color={colors.tint} />
          </View>
        ) : (
          FONT_SCALE_OPTIONS.map((option, index) => (
            <React.Fragment key={option.value}>
              <SelectionOptionRow
                label={t(option.labelKey)}
                selected={selectedFontScale === option.value}
                onPress={() => onSelectFontScale(option.value)}
              />
              {index < FONT_SCALE_OPTIONS.length - 1 && <SettingsDivider inset={16} />}
            </React.Fragment>
          ))
        )}
      </SettingsCard>

      <View className='h-8' />
    </SettingsSelectionScreen>
  )
}
