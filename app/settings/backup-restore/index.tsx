import React from 'react'
import { View } from 'react-native'
import SettingsDetailScreen from '@/components/settings-detail-screen'
import { useTranslation } from 'react-i18next'
import {
  SectionLabel,
  ActionRow,
  ToggleRow,
  SettingsDivider,
  SettingsCard,
  useBackupRestoreSettingsQuery,
  useUpdateBackupRestoreSettingsMutation
} from '@/features/settings'

export default function BackupRestoreScreen() {
  const { t } = useTranslation()
  const { data: backupSettings, isLoading } = useBackupRestoreSettingsQuery()
  const updateBackupRestore = useUpdateBackupRestoreSettingsMutation()

  const autoBackup = backupSettings?.autoBackup ?? false
  const backupOverWifi = backupSettings?.backupOverWifi ?? true
  const lastBackupAt = backupSettings?.lastBackupAt

  const toggle = (field: string, value: boolean) => {
    updateBackupRestore.mutate({ [field]: value })
  }

  return (
    <SettingsDetailScreen title={t('settings.menu.backupRestore.title')}>
      <SettingsCard marginTop={8}>
        <ActionRow
          icon='time-outline'
          title={t('settings.backupRestore.lastBackup')}
          subtitle={lastBackupAt ? new Date(lastBackupAt).toLocaleString() : t('settings.backupRestore.never') || '-'}
          onPress={() => {}}
          showChevron={false}
        />
      </SettingsCard>

      <SectionLabel blue title={t('settings.sections.backupSettings')} />
      <SettingsCard>
        <ToggleRow
          icon='cloud-upload-outline'
          title={t('settings.backupRestore.autoBackup')}
          subtitle={t('settings.backupRestore.autoBackupSubtitle')}
          value={autoBackup}
          onValueChange={(v) => toggle('autoBackup', v)}
          disabled={isLoading || updateBackupRestore.isPending}
        />
        <SettingsDivider />
        <ToggleRow
          icon='wifi-outline'
          title={t('settings.backupRestore.backupOverWifi')}
          subtitle={t('settings.backupRestore.backupOverWifiSubtitle')}
          value={backupOverWifi}
          onValueChange={(v) => toggle('backupOverWifi', v)}
          disabled={isLoading || updateBackupRestore.isPending}
        />
        <SettingsDivider />
        <ActionRow
          icon='list-outline'
          title={t('settings.backupRestore.backupContent')}
          subtitle={t('settings.backupRestore.backupContentSubtitle')}
          onPress={() => {}}
        />
      </SettingsCard>

      <SectionLabel blue title={t('settings.sections.actions') || 'Actions'} />
      <SettingsCard>
        <ActionRow icon='cloud-upload-outline' title={t('settings.backupRestore.backupNow')} onPress={() => {}} />
        <SettingsDivider />
        <ActionRow icon='cloud-download-outline' title={t('settings.backupRestore.restoreData')} onPress={() => {}} />
      </SettingsCard>

      <View className='h-8' />
    </SettingsDetailScreen>
  )
}
