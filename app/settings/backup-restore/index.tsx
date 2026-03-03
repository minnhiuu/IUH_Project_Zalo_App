import React from 'react'
import { View } from 'react-native'
import SettingsDetailScreen from '@/components/settings-detail-screen'
import { useTranslation } from 'react-i18next'
import { SectionLabel, ActionRow, ToggleRow, SettingsDivider, SettingsCard } from '@/features/settings'
import { LastBackupBanner } from '@/features/settings/backup-restore'

export default function BackupRestoreScreen() {
    const { t } = useTranslation()
    const [autoBackup, setAutoBackup] = React.useState(true)
    const [backupOverWifi, setBackupOverWifi] = React.useState(true)

    return (
        <SettingsDetailScreen title={t('settings.menu.backupRestore.title')}>
            <LastBackupBanner
                label={t('settings.backupRestore.lastBackup')}
                timestamp={`${t('settings.backupRestore.today')}, 10:30`}
            />

            <SectionLabel blue title={t('settings.sections.backupSettings')} />
            <SettingsCard>
                <ToggleRow
                    icon="cloud-upload-outline" iconBg="#E8F0FE" iconColor="#0068FF"
                    title={t('settings.backupRestore.autoBackup')}
                    subtitle={t('settings.backupRestore.autoBackupSubtitle')}
                    value={autoBackup} onValueChange={setAutoBackup}
                />
                <SettingsDivider />
                <ToggleRow
                    icon="wifi-outline" iconBg="#E3F2FD" iconColor="#2196F3"
                    title={t('settings.backupRestore.backupOverWifi')}
                    subtitle={t('settings.backupRestore.backupOverWifiSubtitle')}
                    value={backupOverWifi} onValueChange={setBackupOverWifi}
                />
                <SettingsDivider />
                <ActionRow
                    icon="list-outline" iconBg="#E8F5E9" iconColor="#4CAF50"
                    title={t('settings.backupRestore.backupContent')}
                    subtitle={t('settings.backupRestore.backupContentSubtitle')}
                    onPress={() => { }}
                />
            </SettingsCard>

            <SectionLabel blue title={t('settings.sections.actions') || 'Actions'} />
            <SettingsCard>
                <ActionRow
                    icon="cloud-upload-outline" iconBg="#E8F0FE" iconColor="#0068FF"
                    title={t('settings.backupRestore.backupNow')}
                    onPress={() => { }}
                />
                <SettingsDivider />
                <ActionRow
                    icon="cloud-download-outline" iconBg="#FFF3E0" iconColor="#FF9800"
                    title={t('settings.backupRestore.restoreData')}
                    onPress={() => { }}
                />
            </SettingsCard>

            <View className="h-8" />
        </SettingsDetailScreen>
    )
}
