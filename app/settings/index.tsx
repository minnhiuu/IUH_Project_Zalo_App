import { Ionicons } from '@expo/vector-icons'
import { View, ScrollView, Pressable, Alert, Switch } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Header, Text } from '@/components/ui'
import { useLogoutMutation } from '@/features/auth/queries'
import { useTheme, type ThemeMode } from '@/context'

interface SettingItem {
  id: string
  title: string
  icon: string
  action?: () => void
  rightComponent?: 'arrow' | 'switch' | 'badge'
  switchValue?: boolean
  onSwitchChange?: (value: boolean) => void
}

export default function SettingsScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { mutate: logout, isPending } = useLogoutMutation()
  const { themeMode, setThemeMode, activeTheme } = useTheme()

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout.title'),
      t('settings.logout.confirm'),
      [
        {
          text: t('settings.logout.cancel'),
          style: 'cancel'
        },
        {
          text: t('settings.logout.button'),
          style: 'destructive',
          onPress: () => {
            logout()
          }
        }
      ]
    )
  }

  const handleThemeChange = () => {
    Alert.alert(
      t('settings.theme.chooseTheme'),
      t('settings.theme.chooseThemeDesc'),
      [
        {
          text: t('settings.theme.light'),
          onPress: () => setThemeMode('light'),
          style: themeMode === 'light' ? 'default' : 'cancel'
        },
        {
          text: t('settings.theme.dark'),
          onPress: () => setThemeMode('dark'),
          style: themeMode === 'dark' ? 'default' : 'cancel'
        },
        {
          text: t('settings.theme.system'),
          onPress: () => setThemeMode('system'),
          style: themeMode === 'system' ? 'default' : 'cancel'
        },
        {
          text: t('common.cancel'),
          style: 'cancel'
        }
      ]
    )
  }

  const getThemeLabel = (): string => {
    switch (themeMode) {
      case 'light':
        return t('settings.theme.light')
      case 'dark':
        return t('settings.theme.dark')
      case 'system':
        return `${t('settings.theme.system')} (${activeTheme === 'dark' ? t('settings.theme.dark') : t('settings.theme.light')})`
      default:
        return t('settings.theme.light')
    }
  }

  const SETTINGS_ITEMS: SettingItem[] = [
    {
      id: 'theme',
      title: t('settings.theme.title'),
      icon: 'color-palette-outline',
      action: handleThemeChange,
      rightComponent: 'badge'
    },
    {
      id: '1',
      title: t('settings.menu.accountSecurity'),
      icon: 'shield-checkmark-outline',
      rightComponent: 'arrow'
    },
    {
      id: '2',
      title: t('settings.menu.privacy'),
      icon: 'lock-closed-outline',
      rightComponent: 'arrow'
    },
    {
      id: '3',
      title: t('settings.menu.storage'),
      icon: 'pie-chart-outline',
      rightComponent: 'arrow'
    },
    {
      id: '4',
      title: t('settings.menu.backup'),
      icon: 'refresh-outline',
      rightComponent: 'arrow'
    },
    {
      id: '5',
      title: t('settings.menu.notifications'),
      icon: 'notifications-outline',
      rightComponent: 'arrow'
    },
    {
      id: '6',
      title: t('settings.menu.messages'),
      icon: 'chatbubble-ellipses-outline',
      rightComponent: 'arrow'
    },
    {
      id: '7',
      title: t('settings.menu.calls'),
      icon: 'call-outline',
      rightComponent: 'arrow'
    },
    {
      id: '8',
      title: t('settings.menu.diary'),
      icon: 'time-outline',
      rightComponent: 'arrow'
    },
    {
      id: '9',
      title: t('settings.menu.contacts'),
      icon: 'book-outline',
      rightComponent: 'arrow'
    },
    {
      id: '10',
      title: t('settings.menu.appearance'),
      icon: 'brush-outline',
      rightComponent: 'arrow'
    },
    {
      id: '11',
      title: t('settings.menu.about'),
      icon: 'information-circle-outline',
      rightComponent: 'arrow'
    },
    {
      id: '12',
      title: t('settings.menu.support'),
      icon: 'help-circle-outline',
      rightComponent: 'arrow'
    },
    {
      id: '13',
      title: t('settings.menu.switchAccount'),
      icon: 'people-outline',
      rightComponent: 'arrow'
    }
  ]

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <Header
        showSearch={false}
        title={t('settings.title')}
        showBackButton
        showSearchButton
        onSearchPress={() => {
          // Handle search in settings
        }}
      />

      <ScrollView>
        {/* Settings List */}
        <View className="bg-white mt-2">
          {SETTINGS_ITEMS.map((item, index) => (
            <View key={item.id}>
              <Pressable 
                className="flex-row items-center px-4 py-3 active:bg-gray-50"
                onPress={item.action}
              >
                {/* Icon */}
                <View className="w-10 h-10 items-center justify-center mr-3">
                  <Ionicons name={item.icon as any} size={28} color="#0068FF" />
                </View>

                {/* Title */}
                <View className="flex-1">
                  <Text size="base" weight="medium" className="text-gray-900">
                    {item.title}
                  </Text>
                  {/* Show current theme for theme item */}
                  {item.id === 'theme' && (
                    <Text size="sm" className="text-gray-500 mt-0.5">
                      {getThemeLabel()}
                    </Text>
                  )}
                </View>

                {/* Right Component */}
                {item.rightComponent === 'arrow' && (
                  <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                )}
                {item.rightComponent === 'badge' && (
                  <View className="bg-gray-100 px-2.5 py-1 rounded-full">
                    <Text size="xs" className="text-gray-600">
                      {item.id === 'theme' ? getThemeLabel() : ''}
                    </Text>
                  </View>
                )}
              </Pressable>

              {/* Divider */}
              {index < SETTINGS_ITEMS.length - 1 && (
                <View className="h-px bg-gray-100 ml-16" />
              )}
            </View>
          ))}
        </View>

        {/* Logout Button */}
        <View className="px-4 py-6">
          <Pressable
            onPress={handleLogout}
            disabled={isPending}
            className="bg-white rounded-full py-3.5 items-center active:opacity-70"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2
            }}
          >
            <Text size="base" weight="semibold" className="text-gray-900">
              {isPending ? t('settings.logout.loading') : t('settings.logout.button')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  )
}
