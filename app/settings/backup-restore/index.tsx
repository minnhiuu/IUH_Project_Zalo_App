import React from 'react'
import { View, Text, TouchableOpacity, Switch } from 'react-native'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'

interface ToggleRowProps {
    icon: string
    iconColor: string
    iconBg: string
    title: string
    subtitle: string
    value: boolean
    onValueChange: (val: boolean) => void
}

function ToggleRow({ icon, iconColor, iconBg, title, subtitle, value, onValueChange }: ToggleRowProps) {
    return (
        <View className="flex-row items-center px-4 py-3 gap-3">
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

interface ActionRowProps {
    icon: string
    iconColor: string
    iconBg: string
    title: string
    subtitle?: string
    onPress: () => void
    showChevron?: boolean
}

function ActionRow({ icon, iconColor, iconBg, title, subtitle, onPress, showChevron = true }: ActionRowProps) {
    return (
        <TouchableOpacity className="flex-row items-center px-4 py-3 gap-3 active:bg-gray-50" onPress={onPress}>
            <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: iconBg }}>
                <Ionicons name={icon as any} size={22} color={iconColor} />
            </View>
            <View className="flex-1">
                <Text className="text-base text-gray-900">{title}</Text>
                {subtitle && <Text className="text-sm text-gray-500 mt-0.5">{subtitle}</Text>}
            </View>
            {showChevron && <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />}
        </TouchableOpacity>
    )
}

function Divider() {
    return <View className="h-px bg-gray-100 ml-16" />
}

function SectionCard({ children }: { children: React.ReactNode }) {
    return (
        <View className="bg-white mt-3">
            {children}
        </View>
    )
}

export default function BackupRestoreScreen() {
    const { t } = useTranslation()
    const [autoBackup, setAutoBackup] = React.useState(true)
    const [backupOverWifi, setBackupOverWifi] = React.useState(true)

    return (
        <SettingsDetailScreen title={t('settings.menu.backupRestore.title')}>

            {/* Last Backup Info */}
            <View className="bg-white mt-3 px-4 py-3 flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
                    <Ionicons name="time-outline" size={22} color="#0068FF" />
                </View>
                <View className="flex-1">
                    <Text className="text-sm text-gray-500">{t('settings.backupRestore.lastBackup')}</Text>
                    <Text className="text-base font-medium text-gray-900">
                        {t('settings.backupRestore.today')}, 10:30
                    </Text>
                </View>
            </View>

            {/* Backup Settings */}
            <View className="mt-5 px-4">
                <Text className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">
                    {t('settings.sections.backupSettings')}
                </Text>
            </View>

            <SectionCard>
                <ToggleRow
                    icon="cloud-upload-outline"
                    iconColor="#0068FF"
                    iconBg="#E8F0FE"
                    title={t('settings.backupRestore.autoBackup')}
                    subtitle={t('settings.backupRestore.autoBackupSubtitle')}
                    value={autoBackup}
                    onValueChange={setAutoBackup}
                />
                <Divider />
                <ToggleRow
                    icon="wifi-outline"
                    iconColor="#2196F3"
                    iconBg="#E3F2FD"
                    title={t('settings.backupRestore.backupOverWifi')}
                    subtitle={t('settings.backupRestore.backupOverWifiSubtitle')}
                    value={backupOverWifi}
                    onValueChange={setBackupOverWifi}
                />
                <Divider />
                <ActionRow
                    icon="list-outline"
                    iconColor="#4CAF50"
                    iconBg="#E8F5E9"
                    title={t('settings.backupRestore.backupContent')}
                    subtitle={t('settings.backupRestore.backupContentSubtitle')}
                    onPress={() => { }}
                />
            </SectionCard>

            {/* Actions */}
            <View className="mt-5 px-4">
                <Text className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">
                    {t('settings.sections.actions') || 'Actions'}
                </Text>
            </View>

            <SectionCard>
                <ActionRow
                    icon="cloud-upload-outline"
                    iconColor="#0068FF"
                    iconBg="#E8F0FE"
                    title={t('settings.backupRestore.backupNow')}
                    onPress={() => { }}
                />
                <Divider />
                <ActionRow
                    icon="cloud-download-outline"
                    iconColor="#FF9800"
                    iconBg="#FFF3E0"
                    title={t('settings.backupRestore.restoreData')}
                    onPress={() => { }}
                />
            </SectionCard>

            <View className="h-8" />
        </SettingsDetailScreen>
    )
}
