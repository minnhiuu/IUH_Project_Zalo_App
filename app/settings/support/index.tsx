import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'

function Divider() {
    return <View className="h-px bg-gray-100 ml-16" />
}

function ActionRow({ icon, iconBg, iconColor, title, subtitle, onPress }: {
    icon: string; iconBg: string; iconColor: string
    title: string; subtitle?: string; onPress: () => void
}) {
    return (
        <TouchableOpacity className="flex-row items-center px-4 py-3 gap-3 bg-white active:bg-gray-50" onPress={onPress}>
            <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: iconBg }}>
                <Ionicons name={icon as any} size={22} color={iconColor} />
            </View>
            <View className="flex-1">
                <Text className="text-base text-gray-900">{title}</Text>
                {subtitle && <Text className="text-sm text-gray-500 mt-0.5">{subtitle}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
    )
}

export default function SupportScreen() {
    const { t } = useTranslation()

    return (
        <SettingsDetailScreen title={t('settings.menu.support.title')}>
            <View className="bg-white mt-3">
                <ActionRow
                    icon="book-outline" iconBg="#E8F0FE" iconColor="#0068FF"
                    title={t('settings.support.faq')}
                    subtitle={t('settings.support.faqSubtitle')}
                    onPress={() => { }}
                />
                <Divider />
                <ActionRow
                    icon="chatbubble-outline" iconBg="#E8F5E9" iconColor="#4CAF50"
                    title={t('settings.support.chatSupport')}
                    subtitle={t('settings.support.chatSupportSubtitle')}
                    onPress={() => { }}
                />
                <Divider />
                <ActionRow
                    icon="mail-outline" iconBg="#FFF3E0" iconColor="#FF9800"
                    title={t('settings.support.email')}
                    subtitle="support@zalo.me"
                    onPress={() => { }}
                />
                <Divider />
                <ActionRow
                    icon="call-outline" iconBg="#E3F2FD" iconColor="#2196F3"
                    title={t('settings.support.hotline')}
                    subtitle="1900 1234"
                    onPress={() => { }}
                />
            </View>

            <View className="h-8" />
        </SettingsDetailScreen>
    )
}
