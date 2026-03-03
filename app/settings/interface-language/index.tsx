import React from 'react'
import { View, Pressable } from 'react-native'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { Box, HStack, Text, Divider, MenuItem } from '@/components/ui'
import { useTranslation } from 'react-i18next'
import { useTheme, type ThemeMode } from '@/context'
import { BRAND } from '@/constants/theme'

// ── Theme Preview Card ──────────────────────────────────
interface ThemeCardProps {
    mode: ThemeMode
    label: string
    isSelected: boolean
    onPress: () => void
    isDark: boolean
}

function ThemePreview({ mode }: { mode: ThemeMode }) {
    const isLightPreview = mode === 'light'
    const isDarkPreview = mode === 'dark'
    const isSystemPreview = mode === 'system'

    if (isSystemPreview) {
        // Split preview: left half light, right half dark
        return (
            <View style={{ flex: 1, flexDirection: 'row', overflow: 'hidden' }}>
                {/* Light half */}
                <View style={{ flex: 1 }}>
                    <View style={{ height: 16, backgroundColor: BRAND.blue }} />
                    <View style={{ flex: 1, backgroundColor: '#E8EDF2', padding: 5 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: BRAND.blue, marginRight: 4 }} />
                            <View style={{ height: 4, flex: 1, borderRadius: 2, backgroundColor: '#C7D0DC' }} />
                        </View>
                        <View style={{ height: 10, borderRadius: 3, backgroundColor: '#FFFFFF', marginBottom: 3 }} />
                        <View style={{ height: 10, width: '80%', borderRadius: 3, backgroundColor: '#FFFFFF' }} />
                    </View>
                </View>
                {/* Dark half */}
                <View style={{ flex: 1 }}>
                    <View style={{ height: 16, backgroundColor: '#2C323A' }} />
                    <View style={{ flex: 1, backgroundColor: '#22262B', padding: 5 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: BRAND.blue, marginRight: 4 }} />
                            <View style={{ height: 4, flex: 1, borderRadius: 2, backgroundColor: '#4A5060' }} />
                        </View>
                        <View style={{ height: 10, borderRadius: 3, backgroundColor: '#3E444A', marginBottom: 3 }} />
                        <View style={{ height: 10, width: '80%', borderRadius: 3, backgroundColor: '#3E444A' }} />
                    </View>
                </View>
            </View>
        )
    }

    const headerBg = isLightPreview ? BRAND.blue : '#3E444A'
    const bodyBg = isLightPreview ? '#E8EDF2' : '#22262B'
    const contentBg = isLightPreview ? '#FFFFFF' : '#3E444A'
    const lineBg = isLightPreview ? '#C7D0DC' : '#4A5060'

    return (
        <View style={{ flex: 1 }}>
            <View style={{ height: 16, backgroundColor: headerBg }} />
            <View style={{ flex: 1, backgroundColor: bodyBg, padding: 5 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: BRAND.blue, marginRight: 4 }} />
                    <View style={{ height: 4, flex: 1, borderRadius: 2, backgroundColor: lineBg }} />
                </View>
                <View style={{ height: 10, borderRadius: 3, backgroundColor: contentBg, marginBottom: 3 }} />
                <View style={{ height: 10, width: '80%', borderRadius: 3, backgroundColor: contentBg }} />
            </View>
        </View>
    )
}

function ThemeCard({ mode, label, isSelected, onPress, isDark }: ThemeCardProps) {
    return (
        <Pressable onPress={onPress} style={{ flex: 1, alignItems: 'center', paddingHorizontal: 8 }}>
            <View
                style={{
                    width: '100%',
                    aspectRatio: 1.5,
                    borderRadius: 10,
                    borderWidth: isSelected ? 2.5 : 1,
                    borderColor: isSelected ? BRAND.blue : isDark ? '#3E444A' : '#E0E0E0',
                    overflow: 'hidden',
                }}
            >
                <ThemePreview mode={mode} />
            </View>
            <HStack style={{ alignItems: 'center', marginTop: 10, gap: 6 }}>
                <View
                    style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: isSelected ? BRAND.blue : isDark ? '#5A6981' : '#BBBBBB',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {isSelected && (
                        <View
                            style={{
                                width: 10,
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: BRAND.blue,
                            }}
                        />
                    )}
                </View>
                <Text size="sm" className="text-foreground">
                    {label}
                </Text>
            </HStack>
        </Pressable>
    )
}

// ── Main Screen ─────────────────────────────────────────
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
                            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                        </HStack>
                    }
                    onPress={() => { }}
                />
            </Box>
        </SettingsDetailScreen>
    )
}
