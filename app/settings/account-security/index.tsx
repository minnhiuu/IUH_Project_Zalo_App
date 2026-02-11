import React from 'react'
import { Box, VStack, HStack, Text, Divider, Switch } from '@gluestack-ui/themed'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { ListItem } from '@/components/ui'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/store'

export default function AccountSecurityScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user } = useAuthStore()
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(false)

  console.log(`user: ${JSON.stringify(user)} `)

  return (
    <SettingsDetailScreen title={t('settings.menu.accountSecurity.title')}>
      {/* Account Info Section */}
      <VStack bg='$white' mt='$2'>
        <Box px='$4' py='$3' borderBottomWidth={1} borderBottomColor='$borderLight200'>
          <Text size='sm' color='$textLight600' mb='$1'>
            {t('settings.accountSecurity.phone')}
          </Text>
          <Text size='md' color='$textLight900'>
            {user?.phoneNumber || 'N/A'}
          </Text>
        </Box>
        <Box px='$4' py='$3'>
          <Text size='sm' color='$textLight600' mb='$1'>
            {t('settings.accountSecurity.email')}
          </Text>
          <Text size='md' color='$textLight900'>
            {user?.email || 'N/A'}
          </Text>
        </Box>
      </VStack>

      {/* Security Section */}
      <Box bg='$white' mt='$4'>
        <Box px='$4' py='$2' bg='$backgroundLight100'>
          <Text size='sm' color='$textLight600' fontWeight='$medium'>
            {t('settings.sections.security')}
          </Text>
        </Box>

        <ListItem
          title={t('settings.accountSecurity.changePassword')}
          subtitle={t('settings.accountSecurity.changePasswordSubtitle')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='key-outline' size={22} color='#0068FF' />
            </View>
          }
          onPress={() => router.push('/settings/change-password' as any)}
        />
        <Divider ml='$16' />

        <Box>
          <HStack px='$4' py='$3' alignItems='center' space='md'>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='shield-checkmark-outline' size={22} color='#4CAF50' />
            </View>
            <VStack flex={1}>
              <Text size='md' color='$textLight900'>
                {t('settings.accountSecurity.twoFactor')}
              </Text>
              <Text size='sm' color='$textLight500' mt='$0.5'>
                {t('settings.accountSecurity.twoFactorSubtitle')}
              </Text>
            </VStack>
            <Switch value={twoFactorEnabled} onValueChange={setTwoFactorEnabled} />
          </HStack>
        </Box>
        <Divider ml='$16' />

        <ListItem
          title={t('settings.accountSecurity.biometrics')}
          subtitle={t('settings.accountSecurity.biometricsSubtitle')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF3E0', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='finger-print-outline' size={22} color='#FF9800' />
            </View>
          }
          onPress={() => {}}
        />
      </Box>

      {/* Device Management */}
      <Box bg='$white' mt='$4' mb='$8'>
        <Box px='$4' py='$2' bg='$backgroundLight100'>
          <Text size='sm' color='$textLight600' fontWeight='$medium'>
            {t('settings.sections.deviceManagement')}
          </Text>
        </Box>

        <ListItem
          title={t('settings.accountSecurity.deviceManagement')}
          subtitle={t('settings.accountSecurity.deviceManagementSubtitle')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#ECEFF1', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='phone-portrait-outline' size={22} color='#607D8B' />
            </View>
          }
          onPress={() => router.push('/settings/device-management' as any)}
        />
      </Box>
    </SettingsDetailScreen>
  )
}
