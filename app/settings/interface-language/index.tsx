import React, { useState } from 'react'
import { ActionSheetIOS, Alert, Platform, ActivityIndicator } from 'react-native'
import SettingsDetailScreen from '@/components/settings-detail-screen'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/context'
import { BRAND } from '@/constants/theme'
import { Box, HStack, Text, Divider, MenuItem } from '@/components/ui'
import { ThemeCard } from '@/features/settings/interface-language'
import { generalSettingsApi } from '@/features/settings/general/api/general-settings.api'
import { secureStorage } from '@/utils/storageUtils'
import i18n, { type LanguageCode } from '@/i18n'
import Toast from 'react-native-toast-message'

const LANGUAGE_OPTIONS: { code: LanguageCode; flag: string; labelKey: string }[] = [
    { code: 'vi', flag: '🇻🇳', labelKey: 'settings.interfaceLanguage.vietnamese' },
    { code: 'en', flag: '🇺🇸', labelKey: 'settings.interfaceLanguage.english' },
]

export default function InterfaceLanguageScreen() {
    const { t } = useTranslation()
    const { isDark, themeMode, setThemeMode, colors } = useTheme()

    const currentLang = i18n.language as LanguageCode
    const currentOption = LANGUAGE_OPTIONS.find((o) => o.code === currentLang) ?? LANGUAGE_OPTIONS[0]

    const [isSaving, setIsSaving] = useState(false)

    const handleChangeLanguage = async (code: LanguageCode) => {
        if (code === currentLang || isSaving) return
        setIsSaving(true)
        try {
            // 1. Fetch current settings so we can preserve all @NotNull fields (showAllFriends + languageEn)
            //    The backend record requires BOTH fields — sending only one causes a 400.
            const current = await generalSettingsApi.getGeneralSettings()
            const currentShowAllFriends = current?.data?.data?.showAllFriends ?? false

            // 2. PUT with both required fields
            await generalSettingsApi.updateGeneralSettings({
                showAllFriends: currentShowAllFriends,
                languageEn: code === 'en',
            })

            // 3. Write to SecureStore (so interceptors pick it up immediately)
            await secureStorage.setAcceptLanguage(code)

            // 4. Update i18n locale (re-renders all translated text)
            await i18n.changeLanguage(code)

            Toast.show({
                type: 'success',
                text1: t('settings.interfaceLanguage.languageChangedSuccess'),
            })
        } catch (err) {
            console.error('[InterfaceLanguageScreen] language change failed:', err)
            Toast.show({
                type: 'error',
                text1: t('common.error'),
            })
        } finally {
            setIsSaving(false)
        }
    }

    const openLanguagePicker = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    title: t('settings.interfaceLanguage.selectLanguage'),
                    options: [
                        t('common.cancel'),
                        ...LANGUAGE_OPTIONS.map((o) => `${o.flag}  ${t(o.labelKey)}`),
                    ],
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex > 0) {
                        handleChangeLanguage(LANGUAGE_OPTIONS[buttonIndex - 1].code)
                    }
                }
            )
        } else {
            // Android: simple Alert dialog with buttons
            Alert.alert(
                t('settings.interfaceLanguage.selectLanguage'),
                undefined,
                [
                    ...LANGUAGE_OPTIONS.map((o) => ({
                        text: `${o.flag}  ${t(o.labelKey)}`,
                        onPress: () => handleChangeLanguage(o.code),
                        style: (o.code === currentLang ? 'default' : 'default') as 'default',
                    })),
                    { text: t('common.cancel'), style: 'cancel' },
                ],
                { cancelable: true }
            )
        }
    }

    return (
        <SettingsDetailScreen title={t('settings.menu.interfaceLanguage.title')}>
            {/* ── Appearance Section ── */}
            <Box style={{ backgroundColor: colors.background, marginTop: 8 }}>
                <Box style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 }}>
                    <Text size="sm" style={{ color: BRAND.blue, fontWeight: '600' }}>
                        {t('settings.interfaceLanguage.appearance')}
                    </Text>
                </Box>

                {/* Theme Cards */}
                <HStack style={{ paddingHorizontal: 16, paddingVertical: 16, justifyContent: 'space-between' }}>
                    <ThemeCard
                        mode="light"
                        label={t('settings.interfaceLanguage.light')}
                        isSelected={themeMode === 'light'}
                        onPress={() => setThemeMode('light')}
                        isDark={isDark}
                    />
                    <ThemeCard
                        mode="dark"
                        label={t('settings.interfaceLanguage.dark')}
                        isSelected={themeMode === 'dark'}
                        onPress={() => setThemeMode('dark')}
                        isDark={isDark}
                    />
                    <ThemeCard
                        mode="system"
                        label={t('settings.interfaceLanguage.system')}
                        isSelected={themeMode === 'system'}
                        onPress={() => setThemeMode('system')}
                        isDark={isDark}
                    />
                </HStack>

                <Divider style={{ backgroundColor: colors.divider }} />

                {/* Change Font Size */}
                <MenuItem
                    icon="text-outline"
                    iconColor="#2196F3"
                    title={t('settings.interfaceLanguage.changeFontSize')}
                    onPress={() => { }}
                />
            </Box>

            {/* ── Language Section ── */}
            <Box style={{ backgroundColor: colors.background, marginTop: 16, marginBottom: 32 }}>
                <Box style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 }}>
                    <Text size="sm" style={{ color: BRAND.blue, fontWeight: '600' }}>
                        {t('settings.interfaceLanguage.languageSection')}
                    </Text>
                </Box>

                <MenuItem
                    icon="globe-outline"
                    iconColor="#0068FF"
                    title={t('settings.interfaceLanguage.changeLanguage')}
                    rightComponent={
                        isSaving ? (
                            <ActivityIndicator size="small" color={BRAND.blue} />
                        ) : (
                            <HStack style={{ alignItems: 'center', gap: 6 }}>
                                <Text style={{ fontSize: 18 }}>{currentOption.flag}</Text>
                                <Text size="sm" className="text-muted-foreground">
                                    {t(currentOption.labelKey)}
                                </Text>
                            </HStack>
                        )
                    }
                    onPress={openLanguagePicker}
                />
            </Box>
        </SettingsDetailScreen>
    )
}
