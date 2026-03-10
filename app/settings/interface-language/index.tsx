import React, { useState } from 'react'
import {
  View,
  Text as RNText,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  TouchableOpacity
} from 'react-native'
import SettingsDetailScreen from '@/components/settings-detail-screen'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { useTheme } from '@/context'

import { Ionicons } from '@expo/vector-icons'
import { Box, HStack } from '@/components/ui'
import {
  SectionLabel,
  ActionRow,
  SettingsCard,
  SettingsDivider,
  useLanguageAndInterfaceSettingsQuery,
  useUpdateLanguageAndInterfaceMutation,
  toAppLanguage
} from '@/features/settings'
import { ThemeCard } from '@/features/settings/interface-language'
import { secureStorage } from '@/utils/storageUtils'
import i18n, { type LanguageCode } from '@/i18n'
import Toast from 'react-native-toast-message'

const LANGUAGE_OPTIONS: { code: LanguageCode; flag: string; labelKey: string }[] = [
  { code: 'vi', flag: '🇻🇳', labelKey: 'settings.interfaceLanguage.vietnamese' },
  { code: 'en', flag: '🇺🇸', labelKey: 'settings.interfaceLanguage.english' }
]

export default function InterfaceLanguageScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { isDark, themeMode, setThemeMode, colors } = useTheme()
  const { data: languageAndInterfaceSettings } = useLanguageAndInterfaceSettingsQuery()

  const currentLang = i18n.language as LanguageCode
  const currentOption = LANGUAGE_OPTIONS.find((o) => o.code === currentLang) ?? LANGUAGE_OPTIONS[0]

  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false)
  const updateLanguageAndInterface = useUpdateLanguageAndInterfaceMutation()
  const isSaving = updateLanguageAndInterface.isPending
  const fontScale = languageAndInterfaceSettings?.fontScale ?? 1

  const fontSizeSubtitle =
    fontScale < 0.95
      ? t('settings.interfaceLanguage.fontSizeSmall')
      : fontScale > 1.05
        ? t('settings.interfaceLanguage.fontSizeLarge')
        : t('settings.interfaceLanguage.fontSizeMedium')

  const handleChangeLanguage = async (code: LanguageCode) => {
    if (code === currentLang || isSaving) return

    updateLanguageAndInterface.mutate(
      { language: toAppLanguage(code) },
      {
        onSuccess: async () => {
          await secureStorage.setAcceptLanguage(code)
          await i18n.changeLanguage(code)
          Toast.show({
            type: 'success',
            text1: t('settings.interfaceLanguage.languageChangedSuccess')
          })
        },
        onError: () => {
          Toast.show({
            type: 'error',
            text1: t('common.error')
          })
        }
      }
    )
  }

  const openLanguagePicker = () => {
    setIsLanguageModalVisible(true)
  }

  return (
    <SettingsDetailScreen title={t('settings.menu.interfaceLanguage.title')}>
      {/* ── Appearance Section ── */}
      <SectionLabel blue title={t('settings.interfaceLanguage.appearance')} />
      <SettingsCard marginTop={0}>
        {/* Theme Cards */}
        <HStack style={{ paddingHorizontal: 16, paddingVertical: 16, justifyContent: 'space-between' }}>
          <ThemeCard
            mode='light'
            label={t('settings.interfaceLanguage.light')}
            isSelected={themeMode === 'light'}
            onPress={() => setThemeMode('light')}
            isDark={isDark}
          />
          <ThemeCard
            mode='dark'
            label={t('settings.interfaceLanguage.dark')}
            isSelected={themeMode === 'dark'}
            onPress={() => setThemeMode('dark')}
            isDark={isDark}
          />
          <ThemeCard
            mode='system'
            label={t('settings.interfaceLanguage.system')}
            isSelected={themeMode === 'system'}
            onPress={() => setThemeMode('system')}
            isDark={isDark}
          />
        </HStack>

        <SettingsDivider />

        {/* Change Font Size */}
        <ActionRow
          icon='text-outline'
          title={t('settings.interfaceLanguage.changeFontSize')}
          subtitle={fontSizeSubtitle}
          onPress={() => router.push('/settings/interface-language/font-size' as any)}
        />
      </SettingsCard>

      {/* ── Language Section ── */}
      <SectionLabel blue title={t('settings.interfaceLanguage.languageSection')} />
      <SettingsCard marginTop={0}>
        <ActionRow
          icon='globe-outline'
          title={t('settings.interfaceLanguage.changeLanguage')}
          rightComponent={
            isSaving ? (
              <ActivityIndicator size='small' color={colors.tint} />
            ) : (
              <View className='flex-row items-center gap-1.5'>
                <RNText className='text-lg text-foreground'>{currentOption.flag}</RNText>
                <RNText className='text-sm text-muted-foreground'>{t(currentOption.labelKey)}</RNText>
              </View>
            )
          }
          onPress={openLanguagePicker}
        />
      </SettingsCard>

      <Box style={{ height: 32 }} />
      <Box style={{ height: 32 }} />

      <Modal
        transparent
        visible={isLanguageModalVisible}
        animationType='fade'
        onRequestClose={() => setIsLanguageModalVisible(false)}
      >
        <View className='flex-1 items-center justify-center px-6' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <TouchableWithoutFeedback onPress={() => setIsLanguageModalVisible(false)}>
            <View className='absolute inset-0' />
          </TouchableWithoutFeedback>

          <View className='w-full max-w-[340px] rounded-[24px] bg-background p-6 shadow-lg border border-border'>
            <RNText className='text-[19px] font-bold text-foreground mb-4 text-center'>
              {t('settings.interfaceLanguage.selectLanguage')}
            </RNText>

            <View className='gap-2'>
              {LANGUAGE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.code}
                  activeOpacity={0.7}
                  className={`flex-row items-center py-3.5 px-4 rounded-xl border ${
                    currentLang === option.code ? 'border-primary bg-primary/10' : 'border-border bg-background'
                  }`}
                  onPress={() => {
                    setIsLanguageModalVisible(false)
                    handleChangeLanguage(option.code)
                  }}
                >
                  <RNText className='text-xl mr-3'>{option.flag}</RNText>
                  <RNText
                    className={`text-[15px] font-medium flex-1 ${
                      currentLang === option.code ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    {t(option.labelKey)}
                  </RNText>
                  {currentLang === option.code && <Ionicons name='checkmark-circle' size={20} color={colors.tint} />}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              className='mt-4 py-3.5 rounded-xl bg-secondary items-center justify-center'
              onPress={() => setIsLanguageModalVisible(false)}
            >
              <RNText className='text-[15px] font-semibold text-foreground'>{t('common.cancel')}</RNText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SettingsDetailScreen>
  )
}
