import React from 'react'
import { View, Text, Switch, TouchableOpacity } from 'react-native'
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

export default function ContactsScreen() {
    const { t } = useTranslation()
    const [syncEnabled, setSyncEnabled] = React.useState(true)

    return (
        <SettingsDetailScreen title={t('settings.menu.contacts.title')}>
            <SectionLabel title={t('settings.sections.sync')} />
            <View className="bg-white">
                <View className="flex-row items-center px-4 py-3 gap-3">
                    <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: '#E8F5E9' }}>
                        <Ionicons name="sync-outline" size={22} color="#4CAF50" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-base text-gray-900">{t('settings.contacts.syncContacts')}</Text>
                        <Text className="text-sm text-gray-500 mt-0.5">{t('settings.contacts.syncContactsSubtitle')}</Text>
                    </View>
                    <Switch value={syncEnabled} onValueChange={setSyncEnabled} trackColor={{ true: '#0068FF' }} />
                </View>
            </View>

            <SectionLabel title={t('settings.sections.management') || 'Management'} />
            <View className="bg-white">
                <ActionRow
                    icon="people-outline" iconBg="#E3F2FD" iconColor="#2196F3"
                    title={t('settings.contacts.allContacts')}
                    subtitle={t('settings.contacts.contactsCount', { count: 250 })}
                    onPress={() => { }}
                />
                <Divider />
                <ActionRow
                    icon="star-outline" iconBg="#FFF3E0" iconColor="#FF9800"
                    title={t('settings.contacts.favorites')}
                    subtitle={t('settings.contacts.contactsCount', { count: 12 })}
                    onPress={() => { }}
                />
                <Divider />
                <ActionRow
                    icon="person-add-outline" iconBg="#E8F0FE" iconColor="#0068FF"
                    title={t('settings.contacts.friendRequestsList')}
                    subtitle={t('settings.contacts.requestsCount', { count: 3 })}
                    onPress={() => { }}
                />
                <Divider />
                <ActionRow
                    icon="ban-outline" iconBg="#FFEBEE" iconColor="#F44336"
                    title={t('settings.privacy.blockList')}
                    onPress={() => { }}
                />
            </View>

            <View className="h-8" />
        </SettingsDetailScreen>
    )
}
