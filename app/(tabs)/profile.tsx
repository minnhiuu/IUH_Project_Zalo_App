import { Ionicons } from '@expo/vector-icons'
import { View, ScrollView, Pressable, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Header, Avatar, Text } from '@/components/ui'

interface MenuItem {
  id: string
  title: string
  subtitle?: string
  icon: string
  badge?: string
}

const MENU_ITEMS_KEYS = [
  { id: '1', titleKey: 'profile.menu.zCloud', subtitleKey: 'profile.menu.zCloudDesc', icon: 'cloud-outline' },
  { id: '2', titleKey: 'profile.menu.zStyle', subtitleKey: 'profile.menu.zStyleDesc', icon: 'brush-outline' },
  { id: '3', titleKey: 'profile.menu.myDocs', subtitleKey: 'profile.menu.myDocsDesc', icon: 'folder-open-outline' },
  { id: '4', titleKey: 'profile.menu.storage', subtitleKey: 'profile.menu.storageDesc', icon: 'pie-chart-outline' },
  { id: '5', titleKey: 'profile.menu.qrWallet', subtitleKey: 'profile.menu.qrWalletDesc', icon: 'wallet-outline' },
  { id: '6', titleKey: 'profile.menu.accountSecurity', icon: 'shield-checkmark-outline' },
  { id: '7', titleKey: 'profile.menu.privacy', icon: 'lock-closed-outline' }
]

export default function ProfileScreen() {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <Header
        showSearch
        searchPlaceholder={t('profile.search')}
        showSettingsButton
        onSettingsPress={() => router.push('/settings' as any)}
      />

      <ScrollView>
        {/* User Profile Header */}
        <View className="bg-white px-4 py-4">
          <View className="flex-row items-center">
            <View className="relative mr-3">
              <Avatar
                size="xl"
                source={{ uri: 'https://i.pravatar.cc/150?img=50' }}
                fallback={
                  <View className="bg-primary items-center justify-center w-full h-full">
                    <Text className="text-white font-bold text-2xl">N</Text>
                  </View>
                }
              />
              {/* Online status indicator */}
              <View className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
            </View>
            <View className="flex-1">
              <Text size="lg" weight="bold" className="text-gray-900">
                Nguyễn Huỳnh Minh Hiếu
              </Text>
            </View>
          </View>
        </View>

        {/* Promotional Card */}
        <Pressable 
          className="mx-4 mt-2 p-3.5 rounded-lg active:opacity-90"
          style={{
            backgroundColor: '#E8F3FF'
          }}
        >
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-white rounded-lg items-center justify-center mr-3 shadow-sm">
              <Ionicons name="pricetag" size={20} color="#0068FF" />
            </View>
            <View className="flex-1">
              <Text weight="semibold" className="text-gray-900" size="sm">
                {t('profile.promo.title')}
              </Text>
              <Text size="xs" className="text-primary mt-0.5">
                {t('profile.promo.subtitle')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#0068FF" />
          </View>
        </Pressable>

        {/* Menu Items */}
        <View className="bg-white mt-2">
          {MENU_ITEMS_KEYS.map((item, index) => (
            <View key={item.id}>
              <Pressable className="flex-row items-center px-4 py-3 active:bg-gray-50">
                {/* Icon */}
                <View className="w-10 h-10 items-center justify-center mr-3">
                  <Ionicons name={item.icon as any} size={28} color="#0068FF" />
                </View>

                {/* Content */}
                <View className="flex-1">
                  <Text size="base" weight="medium" className="text-gray-900">
                    {t(item.titleKey)}
                  </Text>
                  {item.subtitleKey && (
                    <Text size="xs" className="text-gray-500 mt-0.5">
                      {t(item.subtitleKey)}
                    </Text>
                  )}
                </View>

                {/* Arrow */}
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </Pressable>

              {/* Divider */}
              {index < MENU_ITEMS_KEYS.length - 1 && (
                <View className="h-px bg-gray-100 ml-16" />
              )}
            </View>
          ))}
        </View>

        {/* Settings */}
        <View className="bg-white mt-2 mb-6">
          <Pressable className="flex-row items-center px-4 py-3 active:bg-gray-50">
            <View className="w-10 h-10 items-center justify-center mr-3">
              <Ionicons name="settings-outline" size={28} color="#0068FF" />
            </View>
            <View className="flex-1">
              <Text size="base" weight="medium" className="text-gray-900">
                {t('profile.menu.settings')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  )
}
