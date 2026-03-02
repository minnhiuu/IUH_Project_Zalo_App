import React from 'react'
import { View } from 'react-native'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { Box, VStack, HStack, Text, Switch, MenuItem, Avatar } from '@/components/ui'
import { AvatarImage, AvatarFallbackText } from '@/components/ui/avatar'
import { Pressable } from '@/components/ui/pressable'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/store'

// Section header - blue text like Zalo
const SectionHeader = ({ title }: { title: string }) => (
  <Box style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8, backgroundColor: '#f5f5f5' }}>
    <Text style={{ fontSize: 14, fontWeight: '600', color: '#0068FF' }}>
      {title}
    </Text>
  </Box>
)

export default function AccountSecurityScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user } = useAuthStore()
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(false)

  return (
    <SettingsDetailScreen title={t('settings.menu.accountSecurity.title')}>
      {/* Tài khoản Section */}
      <SectionHeader title={t('settings.accountSecurity.sections.account')} />

      {/* Personal Info Card */}
      <Pressable
        style={{
          marginHorizontal: 16,
          marginTop: 8,
          padding: 16,
          borderRadius: 12,
          backgroundColor: '#ffffff',
          borderWidth: 1,
          borderColor: '#e5e7eb',
          flexDirection: 'row',
          alignItems: 'center'
        }}
        onPress={() => {}}
      >
        <Avatar size="lg">
          <AvatarFallbackText style={{ fontSize: 18, color: '#ffffff' }}>
            {user?.fullName?.[0] || 'U'}
          </AvatarFallbackText>
          {user?.avatar && <AvatarImage source={{ uri: user.avatar }} />}
        </Avatar>
        <VStack style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontSize: 13, color: '#6b7280' }}>
            {t('settings.accountSecurity.personalInfo')}
          </Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#111827' }}>
            {user?.fullName || 'N/A'}
          </Text>
        </VStack>
        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
      </Pressable>

      {/* Phone, Email, QR */}
      <VStack style={{ backgroundColor: '#ffffff', marginTop: 8 }}>
        <MenuItem
          icon="call-outline"
          iconColor="#555"
          title={t('settings.accountSecurity.phone')}
          subtitle={user?.phoneNumber || 'N/A'}
          onPress={() => {}}
        />
        <MenuItem
          icon="mail-outline"
          iconColor="#555"
          title={t('settings.accountSecurity.email')}
          subtitle={user?.email || t('settings.accountSecurity.notLinked')}
          onPress={() => {}}
        />
        <MenuItem
          icon="qr-code-outline"
          iconColor="#555"
          title={t('settings.accountSecurity.myQR')}
          onPress={() => {}}
        />
      </VStack>

      {/* Bảo mật Section */}
      <SectionHeader title={t('settings.accountSecurity.sections.security')} />

      <VStack style={{ backgroundColor: '#ffffff' }}>
        <MenuItem
          icon="shield-checkmark-outline"
          iconColor="#555"
          title={t('settings.accountSecurity.securityCheck')}
          subtitle={t('settings.accountSecurity.securityCheckSubtitle')}
          rightComponent={
            <HStack style={{ alignItems: 'center', gap: 4 }}>
              <Ionicons name="warning" size={18} color="#F59E0B" />
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </HStack>
          }
          onPress={() => {}}
        />
        <MenuItem
          icon="lock-closed-outline"
          iconColor="#555"
          title={t('settings.accountSecurity.lockZalo')}
          rightComponent={
            <HStack style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>
                {t('settings.accountSecurity.off')}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </HStack>
          }
          onPress={() => {}}
        />
      </VStack>

      {/* Đăng nhập Section */}
      <SectionHeader title={t('settings.accountSecurity.sections.login')} />

      <VStack style={{ backgroundColor: '#ffffff' }}>
        <HStack style={{ paddingHorizontal: 16, paddingVertical: 14, alignItems: 'center' }}>
          <View style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <Ionicons name="shield-outline" size={24} color="#555" />
          </View>
          <VStack style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, color: '#000000' }}>
              {t('settings.accountSecurity.twoFactor')}
            </Text>
            <Text style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
              {t('settings.accountSecurity.twoFactorSubtitle')}
            </Text>
          </VStack>
          <Switch value={twoFactorEnabled} onValueChange={setTwoFactorEnabled} />
        </HStack>

        <Box style={{ height: 0.5, backgroundColor: '#f0f0f0', marginLeft: 60 }} />

        <MenuItem
          icon="phone-portrait-outline"
          iconColor="#555"
          title={t('settings.accountSecurity.deviceManagement')}
          subtitle={t('settings.accountSecurity.deviceManagementSubtitle')}
          onPress={() => router.push('/settings/device-management' as any)}
        />

        <Box style={{ height: 0.5, backgroundColor: '#f0f0f0', marginLeft: 60 }} />

        <MenuItem
          icon="lock-closed-outline"
          iconColor="#555"
          title={t('settings.accountSecurity.changePassword')}
          subtitle={t('settings.accountSecurity.changePasswordSubtitle')}
          onPress={() => router.push('/settings/change-password' as any)}
        />
      </VStack>

      <Box style={{ height: 32 }} />
    </SettingsDetailScreen>
  )
}
