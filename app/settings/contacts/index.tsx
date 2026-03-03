import React from 'react'
import { View } from 'react-native'
import SettingsDetailScreen from '@/components/settings-detail-screen'
import { useTranslation } from 'react-i18next'
import { SectionLabel, ActionRow, ToggleRow, SettingsDivider, SettingsCard } from '@/features/settings'

export default function ContactsScreen() {
    const { t } = useTranslation()
    const [syncEnabled, setSyncEnabled] = React.useState(true)

    return (
        <SettingsDetailScreen title={t('settings.menu.contacts.title')}>
            <SectionLabel blue title={t('settings.sections.sync')} />
            <SettingsCard>
                <ToggleRow
                    icon="sync-outline" iconBg="#E8F5E9" iconColor="#4CAF50"
                    title={t('settings.contacts.syncContacts')}
                    subtitle={t('settings.contacts.syncContactsSubtitle')}
                    value={syncEnabled} onValueChange={setSyncEnabled}
                />
            </SettingsCard>

            <SectionLabel blue title={t('settings.sections.management') || 'Management'} />
            <SettingsCard>
                <ActionRow
                    icon="people-outline" iconBg="#E3F2FD" iconColor="#2196F3"
                    title={t('settings.contacts.allContacts')}
                    subtitle={t('settings.contacts.contactsCount', { count: 250 })}
                    onPress={() => { }}
                />
                <SettingsDivider />
                <ActionRow
                    icon="star-outline" iconBg="#FFF3E0" iconColor="#FF9800"
                    title={t('settings.contacts.favorites')}
                    subtitle={t('settings.contacts.contactsCount', { count: 12 })}
                    onPress={() => { }}
                />
                <SettingsDivider />
                <ActionRow
                    icon="person-add-outline" iconBg="#E8F0FE" iconColor="#0068FF"
                    title={t('settings.contacts.friendRequestsList')}
                    subtitle={t('settings.contacts.requestsCount', { count: 3 })}
                    onPress={() => { }}
                />
                <SettingsDivider />
                <ActionRow
                    icon="ban-outline" iconBg="#FFEBEE" iconColor="#F44336"
                    title={t('settings.privacy.blockList')}
                    onPress={() => { }}
                />
            </SettingsCard>

            <View className="h-8" />
        </SettingsDetailScreen>
    )
}
