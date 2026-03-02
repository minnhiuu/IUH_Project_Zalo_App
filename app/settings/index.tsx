import React from 'react'
import { ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Box, VStack, Header, MenuItem, Button, ButtonText } from '@/components/ui'
import { useLogoutMutation } from '@/features/auth'
import { useTheme } from '@/context'

export default function SettingsScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { mutate: logout, isPending: isLoggingOut } = useLogoutMutation()
  const { colors, isDark } = useTheme()

  const handleLogout = () => {
    logout()
  }

  return (
    <Box style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}>
      <Header 
        title={t('settings.title')} 
        showBackButton={true} 
        onBackPress={() => router.back()}
        showSearch
        searchPlaceholder={t('settings.search')}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* All menu items in single container */}
        <VStack style={{ backgroundColor: colors.background, marginTop: 16 }}>
          <MenuItem
            icon="shield-checkmark-outline"
            iconColor="#0068FF"
            title={t('settings.menu.accountSecurity.title')}
            onPress={() => router.push('/settings/account-security' as any)}
          />

          <MenuItem
            icon="lock-closed-outline"
            iconColor="#607D8B"
            title={t('settings.menu.privacy.title')}
            onPress={() => router.push('/settings/privacy' as any)}
          />

          <MenuItem
            icon="time-outline"
            iconColor="#0068FF"
            title={t('settings.menu.dataOnDevice.title')}
            onPress={() => router.push('/settings/data-on-device' as any)}
          />

          <MenuItem
            icon="cloud-upload-outline"
            iconColor="#4CAF50"
            title={t('settings.menu.backupRestore.title')}
            onPress={() => router.push('/settings/backup-restore' as any)}
          />

          <MenuItem
            icon="notifications-outline"
            iconColor="#FF9800"
            title={t('settings.menu.notifications.title')}
            onPress={() => router.push('/settings/notifications' as any)}
          />

          <MenuItem
            icon="chatbubble-outline"
            iconColor="#0068FF"
            title={t('settings.menu.messages.title')}
            onPress={() => router.push('/settings/messages' as any)}
          />

          <MenuItem
            icon="call-outline"
            iconColor="#4CAF50"
            title={t('settings.menu.calls.title')}
            onPress={() => router.push('/settings/calls' as any)}
          />

          <MenuItem
            icon="book-outline"
            iconColor="#795548"
            title={t('settings.menu.journal.title')}
            onPress={() => router.push('/settings/journal' as any)}
          />

          <MenuItem
            icon="people-outline"
            iconColor="#2196F3"
            title={t('settings.menu.contacts.title')}
            onPress={() => router.push('/settings/contacts' as any)}
          />

          <MenuItem
            icon="color-palette-outline"
            iconColor="#E91E63"
            title={t('settings.menu.interfaceLanguage.title')}
            onPress={() => router.push('/settings/interface-language' as any)}
          />

          <MenuItem
            icon="information-circle-outline"
            iconColor="#0068FF"
            title={t('settings.menu.about.title')}
            onPress={() => router.push('/settings/about' as any)}
          />

          <MenuItem
            icon="help-circle-outline"
            iconColor="#FF9800"
            title={t('settings.menu.support.title')}
            rightComponent={
              <Ionicons name="chatbubble-outline" size={20} color="#999" />
            }
            onPress={() => router.push('/settings/support' as any)}
          />

          <MenuItem
            icon="people-circle-outline"
            iconColor="#2196F3"
            title={t('settings.menu.switchAccount')}
            onPress={() => {}}
          />
        </VStack>

        {/* Logout Button */}
        <Box style={{ marginHorizontal: 16, marginTop: 16, marginBottom: 32 }}>
          <Button
            style={{ 
              backgroundColor: 'transparent',
              borderRadius: 8,
              paddingVertical: 14,
              borderWidth: 1,
              borderColor: colors.border
            }}
            onPress={handleLogout}
            isDisabled={isLoggingOut}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.text} />
            <ButtonText style={{ color: colors.text, fontSize: 16, fontWeight: '500' }}>
              {t('settings.deviceManagement.logout')}
            </ButtonText>
          </Button>
        </Box>

        {/* Bottom Spacing */}
        <Box style={{ height: 32 }} />
      </ScrollView>
    </Box>
  )
}
