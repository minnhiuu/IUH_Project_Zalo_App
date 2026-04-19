import React from 'react'
import { View, TouchableOpacity, Image, Text as RNText } from 'react-native'
import SettingsDetailScreen from '@/components/settings-detail-screen'
import { Ionicons } from '@expo/vector-icons'
import { Box, HStack, VStack, Text, Avatar } from '@/components/ui'
import { AvatarImage, AvatarFallbackText } from '@/components/ui/avatar'
import { Pressable } from '@/components/ui/pressable'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import {
  SectionLabel,
  SettingsCard,
  SettingsDivider,
  useAccountSecuritySettingsQuery,
  useUpdateAccountSecuritySettingsMutation
} from '@/features/settings'
import { ActionRow } from '@/features/settings/components/action-row'
import { ToggleRow } from '@/features/settings/components/toggle-row'
import { useAuthStore } from '@/store'

export default function AccountSecurityScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user } = useAuthStore()
  const { data: accountSecuritySettings, isLoading } = useAccountSecuritySettingsQuery()
  const updateAccountSecurity = useUpdateAccountSecuritySettingsMutation()

  const twoFactorEnabled = accountSecuritySettings?.twoFactorEnabled ?? false

  return (
    <SettingsDetailScreen title={t('settings.menu.accountSecurity.title')}>
      {/* Tài khoản Section */}
      <SectionLabel blue title={t('settings.accountSecurity.sections.account')} />

      {/* Personal Info Card */}
      <TouchableOpacity
        className='mx-4 my-2 rounded-2xl bg-background border border-border shadow-sm active:bg-secondary'
        onPress={() => {}}
      >
        <View className='flex-row items-center p-4 rounded-2xl overflow-hidden'>
          {/* Avatar with blue ring */}
          <View className='p-0.5 rounded-full border-2 border-primary mr-3.5'>
            <View className='w-14 h-14 rounded-full bg-primary/10 items-center justify-center overflow-hidden'>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} className='w-full h-full' />
              ) : (
                <RNText className='text-xl font-medium text-primary'>{user?.fullName?.[0] || 'U'}</RNText>
              )}
            </View>
          </View>

          {/* Name & Label */}
          <View className='flex-1 flex-col'>
            <RNText className='text-xs font-medium text-primary'>{t('settings.accountSecurity.personalInfo')}</RNText>
            <RNText className='text-[17px] font-bold text-foreground mt-0.5'>{user?.fullName || 'N/A'}</RNText>
          </View>

          {/* Chevron pill */}
          <View className='w-7 h-7 rounded-full bg-secondary items-center justify-center ml-2'>
            <Ionicons name='chevron-forward' size={16} className='text-icon-secondary' />
          </View>
        </View>
      </TouchableOpacity>

      {/* Phone, Email, QR */}
      <SettingsCard>
        <ActionRow
          icon='call-outline'
          title={t('settings.accountSecurity.phone')}
          subtitle={user?.phoneNumber || 'N/A'}
          onPress={() => {}}
        />
        <SettingsDivider inset={68} />
        <ActionRow
          icon='mail-outline'
          title={t('settings.accountSecurity.email')}
          subtitle={user?.email || t('settings.accountSecurity.notLinked')}
          onPress={() => {}}
        />
        <SettingsDivider inset={68} />
        <ActionRow icon='qr-code-outline' title={t('settings.accountSecurity.myQR')} onPress={() => {}} />
      </SettingsCard>

      {/* Bảo mật Section */}
      <SectionLabel blue title={t('settings.accountSecurity.sections.security')} />

      <SettingsCard>
        <ActionRow
          icon='shield-checkmark-outline'
          title={t('settings.accountSecurity.securityCheck')}
          subtitle={t('settings.accountSecurity.securityCheckSubtitle')}
          rightComponent={
            <HStack style={{ alignItems: 'center', gap: 4 }}>
              <Ionicons name='warning' size={18} color='#F59E0B' />
              <Ionicons name='chevron-forward' size={20} color='#C7C7CC' />
            </HStack>
          }
          onPress={() => {}}
        />
        <SettingsDivider inset={68} />
        <ActionRow
          icon='lock-closed-outline'
          title={t('settings.accountSecurity.lockZalo')}
          rightComponent={
            <HStack style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 14, color: '#6b7280' }}>{t('settings.accountSecurity.off')}</Text>
              <Ionicons name='chevron-forward' size={20} color='#C7C7CC' />
            </HStack>
          }
          onPress={() => {}}
        />
      </SettingsCard>

      {/* Đăng nhập Section */}
      <SectionLabel blue title={t('settings.accountSecurity.sections.login')} />

      <SettingsCard>
        <ToggleRow
          icon='shield-outline'
          title={t('settings.accountSecurity.twoFactor')}
          subtitle={t('settings.accountSecurity.twoFactorSubtitle')}
          value={twoFactorEnabled}
          disabled={isLoading || updateAccountSecurity.isPending}
          onValueChange={(val) => updateAccountSecurity.mutate({ twoFactorEnabled: val })}
        />

        <SettingsDivider inset={68} />

        <ActionRow
          icon='phone-portrait-outline'
          title={t('settings.accountSecurity.deviceManagement')}
          subtitle={t('settings.accountSecurity.deviceManagementSubtitle')}
          onPress={() => router.push('/settings/device-management' as any)}
        />

        <SettingsDivider inset={68} />

        <ActionRow
          icon='lock-closed-outline'
          title={t('settings.accountSecurity.changePassword')}
          subtitle={t('settings.accountSecurity.changePasswordSubtitle')}
          onPress={() => router.push('/settings/change-password' as any)}
        />
      </SettingsCard>

      <Box style={{ height: 32 }} />
    </SettingsDetailScreen>
  )
}
