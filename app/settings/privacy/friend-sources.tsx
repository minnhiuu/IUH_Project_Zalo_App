import React, { useMemo, useState } from 'react'
import { Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import {
  ActionRow,
  SettingsCard,
  SettingsDivider,
  SettingsSelectionScreen,
  SwitchBottomSheet,
  usePrivacySettingsQuery,
  useUpdatePrivacySettingsMutation,
  type PrivacySettings
} from '@/features/settings'

type FriendSourceKey = 'friendSourceByPhone' | 'friendSourceByQr'

const FRIEND_SOURCE_ITEMS: { key: FriendSourceKey; icon: string; labelKey: string }[] = [
  { key: 'friendSourceByPhone', icon: 'call-outline', labelKey: 'settings.privacy.friendSourceByPhone' },
  { key: 'friendSourceByQr', icon: 'qr-code-outline', labelKey: 'settings.privacy.friendSourceByQr' }
]

export default function FriendSourcesScreen() {
  const { t } = useTranslation()
  const { data: privacySettings } = usePrivacySettingsQuery()
  const updatePrivacySettings = useUpdatePrivacySettingsMutation()

  const [activeSourceKey, setActiveSourceKey] = useState<FriendSourceKey | null>(null)

  const activeConfig = useMemo(() => {
    if (!activeSourceKey) return null
    return FRIEND_SOURCE_ITEMS.find((item) => item.key === activeSourceKey) ?? null
  }, [activeSourceKey])

  const activeValue = activeSourceKey ? Boolean(privacySettings?.[activeSourceKey]) : false

  const handleToggleSource = (nextValue: boolean) => {
    if (!activeSourceKey || updatePrivacySettings.isPending) return

    updatePrivacySettings.mutate({ [activeSourceKey]: nextValue } as Partial<PrivacySettings>, {
      onSuccess: () => {
        setActiveSourceKey(null)
      }
    })
  }

  return (
    <SettingsSelectionScreen title={t('settings.privacy.manageFriendSources')}>
      <SettingsCard marginTop={0}>
        {FRIEND_SOURCE_ITEMS.map((item, index) => {
          const isOn = Boolean(privacySettings?.[item.key])

          return (
            <React.Fragment key={item.key}>
              <ActionRow
                icon={item.icon}
                title={t(item.labelKey)}
                rightComponent={
                  <View className='flex-row items-center gap-1'>
                    <Text className='text-sm text-muted-foreground'>
                      {t(isOn ? 'settings.privacy.on' : 'settings.privacy.off')}
                    </Text>
                  </View>
                }
                onPress={() => setActiveSourceKey(item.key)}
              />
              {index < FRIEND_SOURCE_ITEMS.length - 1 && <SettingsDivider inset={56} />}
            </React.Fragment>
          )
        })}
      </SettingsCard>

      <View className='h-8' />

      <SwitchBottomSheet
        visible={Boolean(activeSourceKey && activeConfig)}
        title={activeConfig ? t(activeConfig.labelKey) : ''}
        value={activeValue}
        onClose={() => setActiveSourceKey(null)}
        onValueChange={handleToggleSource}
        isSaving={updatePrivacySettings.isPending}
      />
    </SettingsSelectionScreen>
  )
}
