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
  useContactSettingsQuery,
  useUpdateContactSettingsMutation
} from '@/features/settings'

export default function ContactsScreen() {
  const { t } = useTranslation()
  const { data: contactSettings, isLoading } = useContactSettingsQuery()
  const updateContact = useUpdateContactSettingsMutation()

  const syncContacts = contactSettings?.syncContacts ?? false
  const autoAddFromPhoneContacts = contactSettings?.autoAddFromPhoneContacts ?? false

  const toggle = (field: 'syncContacts' | 'autoAddFromPhoneContacts', value: boolean) => {
    updateContact.mutate({ [field]: value })
  }

  return (
    <SettingsDetailScreen title={t('settings.menu.contacts.title')}>
      <SectionLabel blue title={t('settings.sections.sync')} />
      <SettingsCard>
        <ToggleRow
          icon='sync-outline'
          title={t('settings.contacts.syncContacts')}
          subtitle={t('settings.contacts.syncContactsSubtitle')}
          value={syncContacts}
          onValueChange={(v) => toggle('syncContacts', v)}
          disabled={isLoading || updateContact.isPending}
        />
        <SettingsDivider />
        <ToggleRow
          icon='person-add-outline'
          title={t('settings.contacts.autoAddFromPhoneContacts')}
          subtitle={t('settings.contacts.autoAddFromPhoneContactsSubtitle')}
          value={autoAddFromPhoneContacts}
          onValueChange={(v) => toggle('autoAddFromPhoneContacts', v)}
          disabled={isLoading || updateContact.isPending}
        />
      </SettingsCard>

      <SectionLabel blue title={t('settings.sections.management') || 'Management'} />
      <SettingsCard>
        <ActionRow
          icon='people-outline'
          title={t('settings.contacts.allContacts')}
          subtitle={t('settings.contacts.contactsCount', { count: 250 })}
          onPress={() => {}}
        />
        <SettingsDivider />
        <ActionRow
          icon='star-outline'
          title={t('settings.contacts.favorites')}
          subtitle={t('settings.contacts.contactsCount', { count: 12 })}
          onPress={() => {}}
        />
        <SettingsDivider />
        <ActionRow
          icon='person-add-outline'
          title={t('settings.contacts.friendRequestsList')}
          subtitle={t('settings.contacts.requestsCount', { count: 3 })}
          onPress={() => {}}
        />
        <SettingsDivider />
        <ActionRow icon='ban-outline' title={t('settings.privacy.blockList')} onPress={() => {}} />
      </SettingsCard>

      <View className='h-8' />
    </SettingsDetailScreen>
  )
}
