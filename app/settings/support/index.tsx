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
                    icon="book-outline" iconBgClass="bg-primary/10" iconColorClass="text-primary"
                    title={t('settings.support.faq')}
                    subtitle={t('settings.support.faqSubtitle')}
                    onPress={() => { }}
                />
                <SettingsDivider />
                <ActionRow
                    icon="chatbubble-outline" iconBgClass="bg-emerald-100 dark:bg-emerald-900/20" iconColorClass="text-emerald-500"
                    title={t('settings.support.chatSupport')}
                    subtitle={t('settings.support.chatSupportSubtitle')}
                    onPress={() => { }}
                />
                <SettingsDivider />
                <ActionRow
                    icon="mail-outline" iconBgClass="bg-orange-100 dark:bg-orange-900/20" iconColorClass="text-orange-500"
                    title={t('settings.support.email')}
                    subtitle="support@zalo.me"
                    onPress={() => { }}
                />
                <SettingsDivider />
                <ActionRow
                    icon="call-outline" iconBgClass="bg-blue-100 dark:bg-blue-900/20" iconColorClass="text-blue-500"
                    title={t('settings.support.hotline')}
                    subtitle="1900 1234"
                    onPress={() => { }}
                />
            </SettingsCard>

            <View className="h-8" />
        </SettingsDetailScreen>
    )
}
