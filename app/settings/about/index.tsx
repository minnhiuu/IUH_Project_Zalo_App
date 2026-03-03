import React from 'react'
import { View, Text } from 'react-native'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'

export default function AboutScreen() {
    const { t } = useTranslation()

    return (
        <SettingsDetailScreen title={t('settings.menu.about.title')}>
            {/* App Icon & Version */}
            <View className="bg-white mt-3 px-4 py-10 items-center">
                <Ionicons name="chatbubble-ellipses" size={64} color="#0068FF" />
                <Text className="text-2xl font-bold text-gray-900 mt-4">Zalo</Text>
                <Text className="text-base text-gray-500 mt-1">
                    {t('settings.about.version', { version: '1.0.0' })}
                </Text>
            </View>

            {/* Description */}
            <View className="bg-white mt-3 px-6 py-5">
                <Text className="text-base text-gray-700 text-center leading-6">
                    {t('settings.about.description')}
                </Text>
            </View>

            {/* Copyright */}
            <View className="bg-white mt-3 px-4 py-6 items-center mb-8">
                <Text className="text-sm text-gray-400 text-center">
                    {t('settings.about.copyright')}
                </Text>
            </View>
        </SettingsDetailScreen>
    )
}
