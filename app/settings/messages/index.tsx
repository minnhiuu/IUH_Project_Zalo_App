import React from 'react'
import { View } from 'react-native'
import SettingsDetailScreen from '@/components/settings-detail-screen'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import {
  SectionLabel,
  ActionRow,
  ToggleRow,
  SettingsDivider,
  SettingsCard,
  type MessageSettings,
  useMessageSettingsQuery,
  useUpdateMessageSettingsMutation
} from '@/features/settings'

export default function MessagesScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { data: messageSettings, isLoading } = useMessageSettingsQuery()
  const updateMessage = useUpdateMessageSettingsMutation()

  const messagePreview = messageSettings?.messagePreview ?? true
  const autoDownload = messageSettings?.autoDownload ?? true
  const saveToLibrary = messageSettings?.saveToLibrary ?? false
  const fontSize = messageSettings?.fontSize ?? 'MEDIUM'
  const chatTheme = messageSettings?.chatTheme
  const endToEndEncryption = messageSettings?.endToEndEncryption ?? true

  const toggle = (
    field: 'messagePreview' | 'autoDownload' | 'saveToLibrary' | 'endToEndEncryption' | 'showArchivedMessages',
    value: boolean
  ) => {
    updateMessage.mutate({ [field]: value })
  }

  const fontSizeSubtitle =
    {
      SMALL: t('settings.messages.fontSizeSmall'),
      MEDIUM: t('settings.messages.fontSizeMedium'),
      LARGE: t('settings.messages.fontSizeLarge')
    }[fontSize as MessageSettings['fontSize']] ?? t('settings.messages.fontSizeMedium')

  return (
    <SettingsDetailScreen title={t('settings.menu.messages.title')}>
      <SectionLabel blue title={t('settings.sections.display')} />
      <SettingsCard>
        <ToggleRow
          icon='eye-outline'
          title={t('settings.messages.messagePreview')}
          subtitle={t('settings.messages.messagePreviewSubtitle')}
          value={messagePreview}
          onValueChange={(v) => toggle('messagePreview', v)}
          disabled={isLoading || updateMessage.isPending}
        />
        <SettingsDivider />
        <ActionRow
          icon='text-outline'
          title={t('settings.messages.fontSize')}
          subtitle={fontSizeSubtitle}
          onPress={() => router.push('/settings/messages/font-size' as any)}
        />
        <SettingsDivider />
        <ActionRow
          icon='color-palette-outline'
          title={t('settings.messages.chatTheme')}
          subtitle={chatTheme || t('settings.messages.chatThemeSubtitle')}
          onPress={() => {}}
        />
      </SettingsCard>

      <SectionLabel blue title={t('settings.sections.media')} />
      <SettingsCard>
        <ToggleRow
          icon='download-outline'
          title={t('settings.messages.autoDownload')}
          subtitle={t('settings.messages.autoDownloadSubtitle')}
          value={autoDownload}
          onValueChange={(v) => toggle('autoDownload', v)}
          disabled={isLoading || updateMessage.isPending}
        />
        <SettingsDivider />
        <ToggleRow
          icon='save-outline'
          title={t('settings.messages.saveToLibrary')}
          subtitle={t('settings.messages.saveToLibrarySubtitle')}
          value={saveToLibrary}
          onValueChange={(v) => toggle('saveToLibrary', v)}
          disabled={isLoading || updateMessage.isPending}
        />
      </SettingsCard>

      <SectionLabel blue title={t('settings.sections.advanced')} />
      <SettingsCard>
        <ToggleRow
          icon='lock-closed-outline'
          title={t('settings.messages.endToEndEncryption')}
          subtitle={t('settings.messages.endToEndEncryptionSubtitle')}
          value={endToEndEncryption}
          onValueChange={(v) => toggle('endToEndEncryption', v)}
          disabled={isLoading || updateMessage.isPending}
        />
        <SettingsDivider />
        <ActionRow
          icon='archive-outline'
          title={t('settings.messages.archivedMessages')}
          onPress={() => router.push('/settings/messages/archived-messages' as any)}
        />
      </SettingsCard>

      <View className='h-8' />
    </SettingsDetailScreen>
  )
}
