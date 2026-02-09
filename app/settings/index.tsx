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
  )
}
