import React from 'react'
import { View } from 'react-native'
import SettingsDetailScreen from '@/components/settings-detail-screen'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { SectionLabel, ActionRow, SettingsDivider, SettingsCard, useJournalSettingsQuery } from '@/features/settings'

export default function JournalScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { data: journalSettings } = useJournalSettingsQuery()

  const activityType = journalSettings?.filterActivityType ?? 'ALL'
  const timeRange = journalSettings?.filterTimeRange ?? 'ALL_TIME'

  const activityTypeSubtitle =
    {
      ALL: t('settings.journal.all'),
      LOGIN: t('settings.journal.login'),
      PASSWORD_CHANGE: t('settings.journal.passwordChange'),
      NEW_FRIEND: t('settings.journal.newFriend')
    }[activityType] ?? activityType

  const timeRangeSubtitle =
    {
      ALL_TIME: t('settings.journal.allTime'),
      LAST_7_DAYS: t('settings.journal.last7Days'),
      LAST_30_DAYS: t('settings.journal.last30Days')
    }[timeRange] ?? timeRange

  return (
    <SettingsDetailScreen title={t('settings.menu.journal.title')}>
      <SectionLabel blue title={t('settings.sections.recentActivity')} />
      <SettingsCard marginTop={0}>
        <ActionRow
          icon='log-in-outline'
          title={t('settings.journal.login')}
          subtitle={`iPhone 14 Pro • ${t('settings.backupRestore.today')}, 10:30`}
          onPress={() => {}}
          showChevron={false}
        />
        <SettingsDivider inset={0} />
        <ActionRow
          icon='shield-checkmark-outline'
          title={t('settings.journal.passwordChange')}
          subtitle='Yesterday, 14:20'
          onPress={() => {}}
          showChevron={false}
        />
        <SettingsDivider inset={0} />
        <ActionRow
          icon='person-add-outline'
          title={t('settings.journal.newFriend')}
          subtitle='2 days ago, 09:15'
          onPress={() => {}}
          showChevron={false}
        />
      </SettingsCard>

      <SectionLabel blue title={t('settings.sections.filter')} />
      <SettingsCard marginTop={0}>
        <ActionRow
          icon='funnel-outline'
          title={t('settings.journal.activityType')}
          subtitle={activityTypeSubtitle}
          onPress={() => router.push('/settings/journal/activity-type' as any)}
        />
        <SettingsDivider />
        <ActionRow
          icon='calendar-outline'
          title={t('settings.journal.timeRange')}
          subtitle={timeRangeSubtitle}
          onPress={() => router.push('/settings/journal/time-range' as any)}
        />
      </SettingsCard>

      <SectionLabel blue title={t('settings.sections.actions') || 'Actions'} />
      <SettingsCard marginTop={0}>
        <ActionRow icon='download-outline' title={t('settings.journal.exportLog')} onPress={() => {}} />
        <SettingsDivider />
        <ActionRow icon='trash-outline' title={t('settings.journal.clearLog')} onPress={() => {}} />
      </SettingsCard>

      <View className='h-8' />
    </SettingsDetailScreen>
  )
}
