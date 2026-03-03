import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'

function SectionLabel({ title }: { title: string }) {
  return (
    <View className="px-4 pt-5 pb-2">
      <Text className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#0068FF' }}>{title}</Text>
    </View>
  )
}

function Divider() {
  return <View className="h-px bg-gray-100 ml-14" />
}

function ActionRow({ icon, title, value, onPress }: {
  icon: string; title: string; value?: string; onPress: () => void
}) {
  return (
    <TouchableOpacity className="flex-row items-center px-4 py-3 gap-3 bg-white active:bg-gray-50" onPress={onPress}>
      <View className="w-8 h-8 items-center justify-center">
        <Ionicons name={icon as any} size={22} color="#555" />
      </View>
      <Text className="flex-1 text-base text-gray-900">{title}</Text>
      <View className="flex-row items-center gap-1">
        {value && <Text className="text-sm text-gray-500">{value}</Text>}
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      </View>
    </TouchableOpacity>
  )
}

export default function PrivacyScreen() {
  const { t } = useTranslation()

  return (
    <SettingsDetailScreen title={t('settings.menu.privacy.title')}>
      <SectionLabel title={t('settings.privacy.sections.personal')} />
      <View className="bg-white">
        <ActionRow icon="calendar-outline" title={t('settings.privacy.birthday')} onPress={() => { }} />
        <Divider />
        <ActionRow icon="person-outline" title={t('settings.privacy.showAccessStatus')} value={t('settings.privacy.on')} onPress={() => { }} />
      </View>

      <SectionLabel title={t('settings.privacy.sections.messagesAndCalls')} />
      <View className="bg-white">
        <ActionRow icon="checkmark-done-outline" title={t('settings.privacy.showSeenStatus')} value={t('settings.privacy.off')} onPress={() => { }} />
        <Divider />
        <ActionRow icon="chatbubble-outline" title={t('settings.privacy.allowMessaging')} value={t('settings.privacy.everyone')} onPress={() => { }} />
        <Divider />
        <ActionRow icon="call-outline" title={t('settings.privacy.allowCalls')} value={t('settings.privacy.friendsAndContacted')} onPress={() => { }} />
      </View>

      <SectionLabel title={t('settings.privacy.sections.journal')} />
      <View className="bg-white">
        <ActionRow icon="create-outline" title={t('settings.privacy.allowViewAndComment')} onPress={() => { }} />
        <Divider />
        <ActionRow icon="ban-outline" title={t('settings.privacy.blockAndHide')} onPress={() => { }} />
      </View>

      <SectionLabel title={t('settings.privacy.sections.searchAndFriend')} />
      <View className="bg-white">
        <ActionRow icon="people-outline" title={t('settings.privacy.manageFriendSources')} onPress={() => { }} />
      </View>

      <SectionLabel title={t('settings.privacy.sections.utilities')} />
      <View className="bg-white">
        <ActionRow icon="apps-outline" title={t('settings.privacy.utilities')} onPress={() => { }} />
      </View>

      <View className="h-8" />
    </SettingsDetailScreen>
  )
}
