import React from 'react'
import { View } from 'react-native'
import SettingsDetailScreen from '@/components/settings-detail-screen'
import { useTranslation } from 'react-i18next'
import { SectionLabel, ActionRow, ToggleRow, SettingsDivider, SettingsCard } from '@/features/settings'

export default function CallsScreen() {
    const { t } = useTranslation()
    const [allowCalls, setAllowCalls] = React.useState(true)
    const [allowVideoCalls, setAllowVideoCalls] = React.useState(true)

    return (
        <SettingsDetailScreen title={t('settings.menu.calls.title')}>
            <SectionLabel blue title={t('settings.sections.callSettings')} />
            <SettingsCard>
                <ToggleRow
                    icon="call-outline" iconBg="#E8F0FE" iconColor="#0068FF"
                    title={t('settings.calls.allowCalls')}
                    subtitle={t('settings.calls.allowCallsSubtitle')}
                    value={allowCalls} onValueChange={setAllowCalls}
                />
                <SettingsDivider />
                <ToggleRow
                    icon="videocam-outline" iconBg="#E3F2FD" iconColor="#2196F3"
                    title={t('settings.calls.allowVideoCalls')}
                    subtitle={t('settings.calls.allowVideoCallsSubtitle')}
                    value={allowVideoCalls} onValueChange={setAllowVideoCalls}
                />
            </SettingsCard>

            <SectionLabel blue title={t('settings.sections.quality')} />
            <SettingsCard>
                <ActionRow
                    icon="musical-notes-outline" iconBg="#E8F5E9" iconColor="#4CAF50"
                    title={t('settings.calls.audioQuality')}
                    subtitle={t('settings.calls.automatic')}
                    onPress={() => { }}
                />
                <SettingsDivider />
                <ActionRow
                    icon="videocam-outline" iconBg="#F3E5F5" iconColor="#9C27B0"
                    title={t('settings.calls.videoQuality')}
                    subtitle={t('settings.calls.hd')}
                    onPress={() => { }}
                />
            </SettingsCard>

            <SectionLabel blue title={t('settings.sections.other') || 'Other'} />
            <SettingsCard>
                <ActionRow
                    icon="musical-note-outline" iconBg="#FFF3E0" iconColor="#FF9800"
                    title={t('settings.calls.ringtone')}
                    subtitle={t('settings.calls.ringtoneSubtitle')}
                    onPress={() => { }}
                />
                <SettingsDivider />
                <ActionRow
                    icon="time-outline" iconBg="#ECEFF1" iconColor="#607D8B"
                    title={t('settings.calls.callHistory')}
                    subtitle={t('settings.calls.callHistorySubtitle')}
                    onPress={() => { }}
                />
            </SettingsCard>

            <View className="h-8" />
        </SettingsDetailScreen>
    )
}
