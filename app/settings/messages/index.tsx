import React from 'react'
import { View } from 'react-native'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { useTranslation } from 'react-i18next'
import { SectionLabel, ActionRow, ToggleRow, SettingsDivider, SettingsCard } from '@/features/settings'

export default function MessagesScreen() {
    const { t } = useTranslation()
    const [messagePreview, setMessagePreview] = React.useState(true)
    const [autoDownload, setAutoDownload] = React.useState(true)
    const [saveToLibrary, setSaveToLibrary] = React.useState(false)

    return (
        <SettingsDetailScreen title={t('settings.menu.messages.title')}>
            <SectionLabel title={t('settings.sections.display')} />
            <SettingsCard>
                <ToggleRow
                    icon="eye-outline" iconBg="#E8F0FE" iconColor="#0068FF"
                    title={t('settings.messages.messagePreview')}
                    subtitle={t('settings.messages.messagePreviewSubtitle')}
                    value={messagePreview} onValueChange={setMessagePreview}
                />
                <SettingsDivider />
                <ActionRow
                    icon="text-outline" iconBg="#E3F2FD" iconColor="#2196F3"
                    title={t('settings.messages.fontSize')}
                    subtitle={t('settings.messages.fontSizeMedium')}
                    onPress={() => { }}
                />
                <SettingsDivider />
                <ActionRow
                    icon="color-palette-outline" iconBg="#F3E5F5" iconColor="#9C27B0"
                    title={t('settings.messages.chatTheme')}
                    subtitle={t('settings.messages.chatThemeSubtitle')}
                    onPress={() => { }}
                />
            </SettingsCard>

            <SectionLabel title={t('settings.sections.media')} />
            <SettingsCard>
                <ToggleRow
                    icon="download-outline" iconBg="#E8F5E9" iconColor="#4CAF50"
                    title={t('settings.messages.autoDownload')}
                    subtitle={t('settings.messages.autoDownloadSubtitle')}
                    value={autoDownload} onValueChange={setAutoDownload}
                />
                <SettingsDivider />
                <ToggleRow
                    icon="save-outline" iconBg="#FFF3E0" iconColor="#FF9800"
                    title={t('settings.messages.saveToLibrary')}
                    subtitle={t('settings.messages.saveToLibrarySubtitle')}
                    value={saveToLibrary} onValueChange={setSaveToLibrary}
                />
            </SettingsCard>

            <SectionLabel title={t('settings.sections.advanced')} />
            <SettingsCard>
                <ActionRow
                    icon="lock-closed-outline" iconBg="#E8F0FE" iconColor="#0068FF"
                    title={t('settings.messages.endToEndEncryption')}
                    subtitle={t('settings.messages.endToEndEncryptionSubtitle')}
                    onPress={() => { }}
                />
                <SettingsDivider />
                <ActionRow
                    icon="archive-outline" iconBg="#ECEFF1" iconColor="#607D8B"
                    title={t('settings.messages.archivedMessages')}
                    subtitle={t('settings.messages.archivedMessagesSubtitle')}
                    onPress={() => { }}
                />
            </SettingsCard>

            <View className="h-8" />
        </SettingsDetailScreen>
    )
}
