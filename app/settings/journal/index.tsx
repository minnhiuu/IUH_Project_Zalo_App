import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'

function SectionLabel({ title }: { title: string }) {
    return (
        <View className="px-4 pt-5 pb-2">
            <Text className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{title}</Text>
        </View>
    )
}

function Divider() {
    return <View className="h-px bg-gray-100 ml-16" />
}

function ActivityRow({ icon, iconColor, title, time }: {
    icon: string; iconColor: string; title: string; time: string
}) {
    return (
        <View className="flex-row items-center px-4 py-3 gap-3 bg-white">
            <Ionicons name={icon as any} size={22} color={iconColor} />
            <View className="flex-1">
                <Text className="text-base text-gray-900">{title}</Text>
                <Text className="text-sm text-gray-500 mt-0.5">{time}</Text>
            </View>
        </View>
    )
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

export default function JournalScreen() {
    const { t } = useTranslation()

    return (
        <SettingsDetailScreen title={t('settings.menu.journal.title')}>
            <SectionLabel title={t('settings.sections.recentActivity')} />
            <View className="bg-white">
                <ActivityRow
                    icon="log-in-outline" iconColor="#4CAF50"
                    title={t('settings.journal.login')}
                    time={`iPhone 14 Pro • ${t('settings.backupRestore.today')}, 10:30`}
                />
                <Divider />
                <ActivityRow
                    icon="shield-checkmark-outline" iconColor="#0068FF"
                    title={t('settings.journal.passwordChange')}
                    time="Yesterday, 14:20"
                />
                <Divider />
                <ActivityRow
                    icon="person-add-outline" iconColor="#2196F3"
                    title={t('settings.journal.newFriend')}
                    time="2 days ago, 09:15"
                />
            </View>

            <SectionLabel title={t('settings.sections.filter')} />
            <View className="bg-white">
                <ActionRow
                    icon="funnel-outline" iconBg="#F3E5F5" iconColor="#9C27B0"
                    title={t('settings.journal.activityType')}
                    subtitle={t('settings.journal.all')}
                    onPress={() => { }}
                />
                <Divider />
                <ActionRow
                    icon="calendar-outline" iconBg="#E3F2FD" iconColor="#2196F3"
                    title={t('settings.journal.timeRange')}
                    subtitle={t('settings.journal.last7Days')}
                    onPress={() => { }}
                />
            </View>

            <SectionLabel title={t('settings.sections.actions') || 'Actions'} />
            <View className="bg-white">
                <ActionRow
                    icon="download-outline" iconBg="#E8F0FE" iconColor="#0068FF"
                    title={t('settings.journal.exportLog')}
                    onPress={() => { }}
                />
                <Divider />
                <ActionRow
                    icon="trash-outline" iconBg="#FFEBEE" iconColor="#F44336"
                    title={t('settings.journal.clearLog')}
                    onPress={() => { }}
                />
            </View>

            <View className="h-8" />
        </SettingsDetailScreen>
    )
}
