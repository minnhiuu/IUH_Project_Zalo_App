import React from 'react'
import { View } from 'react-native'
import SettingsDetailScreen from '@/components/settings-detail-screen'
import { useTranslation } from 'react-i18next'
import { SectionLabel, ActionRow, SettingsDivider, SettingsCard } from '@/features/settings'
import { ActivityRow } from '@/features/settings/journal'

export default function JournalScreen() {
    const { t } = useTranslation()

    return (
        <SettingsDetailScreen title={t('settings.menu.journal.title')}>
            <SectionLabel blue title={t('settings.sections.recentActivity')} />
            <SettingsCard marginTop={0}>
                <ActivityRow
                    icon="log-in-outline" iconColor="#4CAF50"
                    title={t('settings.journal.login')}
                    time={`iPhone 14 Pro • ${t('settings.backupRestore.today')}, 10:30`}
                />
                <SettingsDivider inset={0} />
                <ActivityRow
                    icon="shield-checkmark-outline" iconColor="#0068FF"
                    title={t('settings.journal.passwordChange')}
                    time="Yesterday, 14:20"
                />
                <SettingsDivider inset={0} />
                <ActivityRow
                    icon="person-add-outline" iconColor="#2196F3"
                    title={t('settings.journal.newFriend')}
                    time="2 days ago, 09:15"
                />
            </SettingsCard>

            <SectionLabel blue title={t('settings.sections.filter')} />
            <SettingsCard marginTop={0}>
                <ActionRow
                    icon="funnel-outline" iconBg="#F3E5F5" iconColor="#9C27B0"
                    title={t('settings.journal.activityType')}
                    subtitle={t('settings.journal.all')}
                    onPress={() => { }}
                />
                <SettingsDivider />
                <ActionRow
                    icon="calendar-outline" iconBg="#E3F2FD" iconColor="#2196F3"
                    title={t('settings.journal.timeRange')}
                    subtitle={t('settings.journal.last7Days')}
                    onPress={() => { }}
                />
            </SettingsCard>

            <SectionLabel blue title={t('settings.sections.actions') || 'Actions'} />
            <SettingsCard marginTop={0}>
                <ActionRow
                    icon="download-outline" iconBg="#E8F0FE" iconColor="#0068FF"
                    title={t('settings.journal.exportLog')}
                    onPress={() => { }}
                />
                <SettingsDivider />
                <ActionRow
                    icon="trash-outline" iconBg="#FFEBEE" iconColor="#F44336"
                    title={t('settings.journal.clearLog')}
                    onPress={() => { }}
                />
            </SettingsCard>

            <View className="h-8" />
        </SettingsDetailScreen>
    )
}
