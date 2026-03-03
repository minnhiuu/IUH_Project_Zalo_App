import React from 'react'
import { View } from 'react-native'
import SettingsDetailScreen from '@/components/settings-detail-screen'
import { useTranslation } from 'react-i18next'
import { SectionLabel, ActionRow, SettingsDivider, SettingsCard } from '@/features/settings'

export default function SupportScreen() {
    const { t } = useTranslation()

    return (
        <SettingsDetailScreen title={t('settings.menu.support.title')}>
            <SectionLabel blue title={t('settings.sections.support') || 'Get Help'} />
            <SettingsCard>
                <ActionRow
                    icon="book-outline" iconBg="#E8F0FE" iconColor="#0068FF"
                    title={t('settings.support.faq')}
                    subtitle={t('settings.support.faqSubtitle')}
                    onPress={() => { }}
                />
                <SettingsDivider />
                <ActionRow
                    icon="chatbubble-outline" iconBg="#E8F5E9" iconColor="#4CAF50"
                    title={t('settings.support.chatSupport')}
                    subtitle={t('settings.support.chatSupportSubtitle')}
                    onPress={() => { }}
                />
                <SettingsDivider />
                <ActionRow
                    icon="mail-outline" iconBg="#FFF3E0" iconColor="#FF9800"
                    title={t('settings.support.email')}
                    subtitle="support@zalo.me"
                    onPress={() => { }}
                />
                <SettingsDivider />
                <ActionRow
                    icon="call-outline" iconBg="#E3F2FD" iconColor="#2196F3"
                    title={t('settings.support.hotline')}
                    subtitle="1900 1234"
                    onPress={() => { }}
                />
            </SettingsCard>

            <View className="h-8" />
        </SettingsDetailScreen>
    )
}
