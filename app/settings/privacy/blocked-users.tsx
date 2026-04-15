import React from 'react'
import { useTranslation } from 'react-i18next'
import { BlockedUsersList } from '@/features/users/components/blocked-users-list'
import SettingsDetailScreen from '@/components/settings-detail-screen'

export default function BlockedUsersScreen() {
  const { t } = useTranslation()

  return (
    <SettingsDetailScreen title={t('settings.privacy.blockAndHide')}>
      <BlockedUsersList />
    </SettingsDetailScreen>
  )
}
