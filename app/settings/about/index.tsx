import React from 'react'
import { View, Text } from 'react-native'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { SettingsCard } from '@/features/settings'

export default function AboutScreen() {
    const { t } = useTranslation()

    return (
        <SettingsDetailScreen title={t('settings.menu.about.title')}>
            {/* App Icon & Version */}
            <SettingsCard marginTop={12}>
                <View className="px-4 py-10 items-center">
                    <Ionicons name="chatbubble-ellipses" size={64} color="#0068FF" />
                    <Text className="text-2xl font-bold text-gray-900 mt-4">Zalo</Text>
                    <Text className="text-base text-gray-500 mt-1">
                        {t('settings.about.version', { version: '1.0.0' })}
                    </Text>
                </View>
            </SettingsCard>

            {/* Description */}
            <SettingsCard>
                <View className="px-6 py-5">
                    <Text className="text-base text-gray-700 text-center leading-6">
                        {t('settings.about.description')}
                    </Text>
                </View>
            </SettingsCard>

            {/* Copyright */}
            <SettingsCard>
                <View className="px-4 py-6 items-center">
                    <Text className="text-sm text-gray-400 text-center">
                        {t('settings.about.copyright')}
                    </Text>
                </View>
            </SettingsCard>

            <View className="h-8" />
        </SettingsDetailScreen>
    )
}
