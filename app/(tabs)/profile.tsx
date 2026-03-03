import { Ionicons } from '@expo/vector-icons'
import { ScrollView, ActivityIndicator } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Header, Avatar, Text, Box, VStack, HStack, Card, Divider } from '@/components/ui'
import { AvatarImage, AvatarFallbackText } from '@/components/ui/avatar'
import { Pressable } from '@/components/ui/pressable'
import { useMyProfile } from '@/features/user'
import { SEMANTIC, BRAND } from '@/constants/theme'

interface MenuItem {
  id: string
  titleKey: string
  subtitleKey?: string
  icon: string
  route?: string
}

const MENU_ITEMS_KEYS: MenuItem[] = [
  { id: '1', titleKey: 'profile.menu.zCloud', subtitleKey: 'profile.menu.zCloudDesc', icon: 'cloud-outline' },
  { id: '2', titleKey: 'profile.menu.zStyle', subtitleKey: 'profile.menu.zStyleDesc', icon: 'brush-outline' },
  { id: '3', titleKey: 'profile.menu.myDocs', subtitleKey: 'profile.menu.myDocsDesc', icon: 'folder-open-outline' },
  { id: '4', titleKey: 'profile.menu.storage', subtitleKey: 'profile.menu.storageDesc', icon: 'pie-chart-outline', route: '/settings/data-on-device' },
  { id: '5', titleKey: 'profile.menu.qrWallet', subtitleKey: 'profile.menu.qrWalletDesc', icon: 'wallet-outline' },
  { id: '6', titleKey: 'profile.menu.accountSecurity', icon: 'shield-checkmark-outline', route: '/settings/account-security' },
  { id: '7', titleKey: 'profile.menu.privacy', icon: 'lock-closed-outline', route: '/settings/privacy' }
]

export default function ProfileScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { data: user, isLoading } = useMyProfile()

  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ')
    if (names.length >= 2) {
      return names[names.length - 2].charAt(0) + names[names.length - 1].charAt(0)
    }
    return fullName.charAt(0)
  }

  return (
    <Box style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <Header
        showSearch
        searchPlaceholder={t('profile.search')}
        showSettingsButton
        onSettingsPress={() => router.push('/settings' as any)}
      />

      <ScrollView>
        {/* User Profile Header */}
        <Card style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
          {isLoading ? (
            <Box style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 20 }}>
              <ActivityIndicator size="large" color="#0068FF" />
            </Box>
          ) : (
            <Pressable onPress={() => router.push('/user-profile/me' as any)}>
              <HStack style={{ alignItems: 'center' }} space="md">
                <Box style={{ position: 'relative' }}>
                  <Avatar size="xl">
                    <AvatarFallbackText style={{ fontSize: 24, color: '#ffffff' }}>
                      {user?.fullName ? getInitials(user.fullName) : 'U'}
                    </AvatarFallbackText>
                    {user?.avatar && (
                      <AvatarImage source={{ uri: user.avatar }} />
                    )}
                  </Avatar>
                  {/* Online status indicator */}
                  <Box style={{ position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, backgroundColor: '#22c55e', borderRadius: 8, borderWidth: 2, borderColor: '#ffffff' }} />
                </Box>
                <VStack style={{ flex: 1 }}>
                  <Text size="lg" bold style={{ color: '#111827' }}>
                    {user?.fullName || 'User'}
                  </Text>
                </VStack>
              </HStack>
            </Pressable>
          )}
        </Card>

        {/* Promotional Card */}
        <Pressable 
          style={{
            marginHorizontal: 16,
            marginTop: 8,
            padding: 14,
            borderRadius: 8,
            backgroundColor: BRAND.blueLight
          }}
        >
          <HStack style={{ alignItems: 'center' }} space="md">
            <Box style={{ width: 40, height: 40, backgroundColor: SEMANTIC.background, borderRadius: 8, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}>
              <Ionicons name="pricetag" size={20} color={SEMANTIC.primary} />
            </Box>
            <VStack style={{ flex: 1 }}>
              <Text style={{ color: '#111827' }} size="sm" bold>
                {t('profile.promo.title')}
              </Text>
              <Text size="xs" style={{ color: '#3b82f6', marginTop: 2 }}>
                {t('profile.promo.subtitle')}
              </Text>
            </VStack>
            <Ionicons name="chevron-forward" size={20} color={SEMANTIC.primary} />
          </HStack>
        </Pressable>

        {/* Menu Items */}
        <Card style={{ marginTop: 8 }}>
          {MENU_ITEMS_KEYS.map((item, index) => (
            <VStack key={item.id}>
              <Pressable 
                style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}
                onPress={() => {
                  if (item.route) {
                    router.push(item.route as any)
                  }
                }}
              >
                {/* Icon */}
                <Box style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Ionicons name={item.icon as any} size={28} color="#0068FF" />
                </Box>

                {/* Content */}
                <VStack style={{ flex: 1 }}>
                  <Text size="md" bold style={{ color: '#111827' }}>
                    {t(item.titleKey)}
                  </Text>
                  {item.subtitleKey && (
                    <Text size="xs" style={{ color: '#6b7280', marginTop: 2 }}>
                      {t(item.subtitleKey)}
                    </Text>
                  )}
                </VStack>

                {/* Arrow */}
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </Pressable>

              {/* Divider */}
              {index < MENU_ITEMS_KEYS.length - 1 && (
                <Divider style={{ marginLeft: 64 }} />
              )}
            </VStack>
          ))}
        </Card>

        {/* Settings */}
        <Card style={{ marginTop: 8, marginBottom: 24}}>
          <Pressable style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
            <Box style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Ionicons name="settings-outline" size={28} color="#0068FF" />
            </Box>
            <VStack style={{ flex: 1 }}>
              <Text size="md" bold style={{ color: '#111827' }}>
                {t('profile.menu.settings')}
              </Text>
            </VStack>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </Pressable>
        </Card>
      </ScrollView>
    </Box>
  )
}
