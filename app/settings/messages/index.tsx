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

function ToggleRow({ icon, iconBg, iconColor, title, subtitle, value, onValueChange }: {
    icon: string; iconBg: string; iconColor: string
    title: string; subtitle: string; value: boolean; onValueChange: (v: boolean) => void
}) {
    return (
        <View className="flex-row items-center px-4 py-3 gap-3 bg-white">
            <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: iconBg }}>
                <Ionicons name={icon as any} size={22} color={iconColor} />
            </View>
            <View className="flex-1">
                <Text className="text-base text-gray-900">{title}</Text>
                <Text className="text-sm text-gray-500 mt-0.5">{subtitle}</Text>
            </View>
            <Switch value={value} onValueChange={onValueChange} trackColor={{ true: '#0068FF' }} />
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

export default function MessagesScreen() {
    const { t } = useTranslation()
    const [messagePreview, setMessagePreview] = React.useState(true)
    const [autoDownload, setAutoDownload] = React.useState(true)
    const [saveToLibrary, setSaveToLibrary] = React.useState(false)

    return (
        <SettingsDetailScreen title={t('settings.menu.messages.title')}>
            <SectionLabel title={t('settings.sections.display')} />
            <View className="bg-white">
                <ToggleRow
                    icon="eye-outline" iconBg="#E8F0FE" iconColor="#0068FF"
                    title={t('settings.messages.messagePreview')}
                    subtitle={t('settings.messages.messagePreviewSubtitle')}
                    value={messagePreview} onValueChange={setMessagePreview}
                />
                <Divider />
                <ActionRow
                    icon="text-outline" iconBg="#E3F2FD" iconColor="#2196F3"
                    title={t('settings.messages.fontSize')}
                    subtitle={t('settings.messages.fontSizeMedium')}
                    onPress={() => { }}
                />
                <Divider />
                <ActionRow
                    icon="color-palette-outline" iconBg="#F3E5F5" iconColor="#9C27B0"
                    title={t('settings.messages.chatTheme')}
                    subtitle={t('settings.messages.chatThemeSubtitle')}
                    onPress={() => { }}
                />
            </View>

            <SectionLabel title={t('settings.sections.media')} />
            <View className="bg-white">
                <ToggleRow
                    icon="download-outline" iconBg="#E8F5E9" iconColor="#4CAF50"
                    title={t('settings.messages.autoDownload')}
                    subtitle={t('settings.messages.autoDownloadSubtitle')}
                    value={autoDownload} onValueChange={setAutoDownload}
                />
                <Divider />
                <ToggleRow
                    icon="save-outline" iconBg="#FFF3E0" iconColor="#FF9800"
                    title={t('settings.messages.saveToLibrary')}
                    subtitle={t('settings.messages.saveToLibrarySubtitle')}
                    value={saveToLibrary} onValueChange={setSaveToLibrary}
                />
            </View>

            <SectionLabel title={t('settings.sections.advanced')} />
            <View className="bg-white">
                <ActionRow
                    icon="lock-closed-outline" iconBg="#E8F0FE" iconColor="#0068FF"
                    title={t('settings.messages.endToEndEncryption')}
                    subtitle={t('settings.messages.endToEndEncryptionSubtitle')}
                    onPress={() => { }}
                />
                <Divider />
                <ActionRow
                    icon="archive-outline" iconBg="#ECEFF1" iconColor="#607D8B"
                    title={t('settings.messages.archivedMessages')}
                    subtitle={t('settings.messages.archivedMessagesSubtitle')}
                    onPress={() => { }}
                />
            </View>

            <View className="h-8" />
        </SettingsDetailScreen>
    )
}
