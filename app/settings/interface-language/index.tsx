import React from 'react'
import { View } from 'react-native'
import SettingsDetailScreen from '@/components/settings-detail-screen'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/context'
import { BRAND } from '@/constants/theme'
import { Box, HStack, Text, Divider, MenuItem } from '@/components/ui'
import { ThemeCard } from '@/features/settings/interface-language'

export default function InterfaceLanguageScreen() {
    const { t } = useTranslation()
    const { isDark, themeMode, setThemeMode, colors } = useTheme()

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
                        <HStack style={{ alignItems: 'center', gap: 6 }}>
                            <Text style={{ fontSize: 18 }}>🇻🇳</Text>
                            <Text size="sm" className="text-muted-foreground">
                                {t('settings.interfaceLanguage.vietnamese')}
                            </Text>
                        </HStack>
                    }
                    onPress={() => { }}
                />
            </Box>
        </SettingsDetailScreen>
    )
}
