<<<<<<< HEAD
﻿import { Ionicons } from '@expo/vector-icons'
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
=======
import React from 'react'
import { Box, ScrollView, VStack, Text, Divider } from '@gluestack-ui/themed'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Header, ListItem } from '@/components/ui'
import { View } from 'react-native'

// Section Divider
const SectionDivider = () => <Box h={8} bg='$backgroundLight100' />

// Section Header
interface SectionHeaderProps {
  title: string
}

const SectionHeader = ({ title }: SectionHeaderProps) => (
  <Box px='$4' py='$2' bg='$backgroundLight100'>
    <Text size='sm' color='$textLight600' fontWeight='$medium'>
      {title}
    </Text>
  </Box>
)

export default function SettingsScreen() {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <Box flex={1} bg='$backgroundLight100'>
      <Header title={t('settings.title')} leftIcon='arrow-back' onLeftPress={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Security Section */}
        <SectionHeader title={t('settings.sections.security')} />
        <VStack bg='$white'>
          <ListItem
            title={t('settings.menu.accountSecurity.title')}
            subtitle={t('settings.menu.accountSecurity.subtitle')}
            leftComponent={
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#E8F0FE',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name='shield-checkmark-outline' size={22} color='#0068FF' />
              </View>
            }
            onPress={() => router.push('/settings/account-security')}
          />
          <Divider ml='$16' />
          <ListItem
            title={t('settings.menu.privacy.title')}
            subtitle={t('settings.menu.privacy.subtitle')}
            leftComponent={
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#ECEFF1',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name='lock-closed-outline' size={22} color='#607D8B' />
              </View>
            }
            onPress={() => router.push('/settings/privacy')}
          />
        </VStack>

        <SectionDivider />

        {/* Data Management Section */}
        <SectionHeader title={t('settings.sections.data')} />
        <VStack bg='$white'>
          <ListItem
            title={t('settings.menu.dataOnDevice.title')}
            subtitle={t('settings.menu.dataOnDevice.subtitle')}
            leftComponent={
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#F3E5F5',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name='phone-portrait-outline' size={22} color='#9C27B0' />
              </View>
            }
            onPress={() => router.push('/settings/data-on-device')}
          />
          <Divider ml='$16' />
          <ListItem
            title={t('settings.menu.backupRestore.title')}
            subtitle={t('settings.menu.backupRestore.subtitle')}
            leftComponent={
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#E8F5E9',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name='cloud-upload-outline' size={22} color='#4CAF50' />
              </View>
            }
            onPress={() => router.push('/settings/backup-restore')}
          />
        </VStack>

        <SectionDivider />

        {/* Notifications & Communication Section */}
        <SectionHeader title={t('settings.sections.notificationsCommunication')} />
        <VStack bg='$white'>
          <ListItem
            title={t('settings.menu.notifications.title')}
            subtitle={t('settings.menu.notifications.subtitle')}
            leftComponent={
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#FFF3E0',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name='notifications-outline' size={22} color='#FF9800' />
              </View>
            }
            onPress={() => router.push('/settings/notifications')}
          />
          <Divider ml='$16' />
          <ListItem
            title={t('settings.menu.messages.title')}
            subtitle={t('settings.menu.messages.subtitle')}
            leftComponent={
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#E8F0FE',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name='chatbubble-outline' size={22} color='#0068FF' />
              </View>
            }
            onPress={() => router.push('/settings/messages')}
          />
          <Divider ml='$16' />
          <ListItem
            title={t('settings.menu.calls.title')}
            subtitle={t('settings.menu.calls.subtitle')}
            leftComponent={
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#E8F5E9',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name='call-outline' size={22} color='#4CAF50' />
              </View>
            }
            onPress={() => router.push('/settings/calls')}
          />
          <Divider ml='$16' />
          <ListItem
            title={t('settings.menu.journal.title')}
            subtitle={t('settings.menu.journal.subtitle')}
            leftComponent={
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#EFEBE9',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name='book-outline' size={22} color='#795548' />
              </View>
            }
            onPress={() => router.push('/settings/journal')}
          />
          <Divider ml='$16' />
          <ListItem
            title={t('settings.menu.contacts.title')}
            subtitle={t('settings.menu.contacts.subtitle')}
            leftComponent={
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#E3F2FD',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name='people-outline' size={22} color='#2196F3' />
              </View>
            }
            onPress={() => router.push('/settings/contacts')}
          />
        </VStack>

        <SectionDivider />

        {/* Interface Section */}
        <SectionHeader title={t('settings.sections.interface')} />
        <VStack bg='$white'>
          <ListItem
            title={t('settings.menu.interfaceLanguage.title')}
            subtitle={t('settings.menu.interfaceLanguage.subtitle')}
            leftComponent={
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#FCE4EC',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name='color-palette-outline' size={22} color='#E91E63' />
              </View>
            }
            onPress={() => router.push('/settings/interface-language')}
          />
        </VStack>

        <SectionDivider />

        {/* About & Support Section */}
        <SectionHeader title={t('settings.sections.support')} />
        <VStack bg='$white'>
          <ListItem
            title={t('settings.menu.about.title')}
            subtitle={t('settings.menu.about.subtitle')}
            leftComponent={
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#E8F0FE',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name='information-circle-outline' size={22} color='#0068FF' />
              </View>
            }
            onPress={() => router.push('/settings/about')}
          />
          <Divider ml='$16' />
          <ListItem
            title={t('settings.menu.support.title')}
            subtitle={t('settings.menu.support.subtitle')}
            leftComponent={
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#FFF3E0',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name='help-circle-outline' size={22} color='#FF9800' />
              </View>
            }
            onPress={() => router.push('/settings/support')}
          />
        </VStack>

        {/* Bottom Spacing */}
        <Box h={32} />
      </ScrollView>
    </Box>
>>>>>>> 9c114b136a57ae1840d9366f35df2f764308ae65
  )
}
