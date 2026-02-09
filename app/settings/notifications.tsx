import React from 'react'
import { Box, VStack, HStack, Text, Divider, Switch } from '@gluestack-ui/themed'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { ListItem } from '@/components/ui'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'

export default function NotificationsScreen() {
  const { t } = useTranslation()
  const [allowNotifications, setAllowNotifications] = React.useState(true)
  const [sound, setSound] = React.useState(true)
  const [vibration, setVibration] = React.useState(true)

  return (
    <SettingsDetailScreen title={t('settings.menu.notifications.title')}>
      {/* General Settings */}
      <Box bg='$white' mt='$2'>
        <Box px='$4' py='$2' bg='$backgroundLight100'>
          <Text size='sm' color='$textLight600' fontWeight='$medium'>
            {t('settings.sections.general')}
          </Text>
        </Box>

        <HStack px='$4' py='$3' alignItems='center' space='md'>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name='notifications-outline' size={22} color='#0068FF' />
          </View>
          <VStack flex={1}>
            <Text size='md' color='$textLight900'>
              {t('settings.notifications.allowNotifications')}
            </Text>
            <Text size='sm' color='$textLight500' mt='$0.5'>
              {t('settings.notifications.allowNotificationsSubtitle')}
            </Text>
          </VStack>
          <Switch value={allowNotifications} onValueChange={setAllowNotifications} />
        </HStack>
        <Divider ml='$16' />

        <HStack px='$4' py='$3' alignItems='center' space='md'>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name='volume-high-outline' size={22} color='#2196F3' />
          </View>
          <VStack flex={1}>
            <Text size='md' color='$textLight900'>
              {t('settings.notifications.sound')}
            </Text>
            <Text size='sm' color='$textLight500' mt='$0.5'>
              {t('settings.notifications.soundSubtitle')}
            </Text>
          </VStack>
          <Switch value={sound} onValueChange={setSound} />
        </HStack>
        <Divider ml='$16' />

        <HStack px='$4' py='$3' alignItems='center' space='md'>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3E5F5', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name='phone-portrait-outline' size={22} color='#9C27B0' />
          </View>
          <VStack flex={1}>
            <Text size='md' color='$textLight900'>
              {t('settings.notifications.vibration')}
            </Text>
            <Text size='sm' color='$textLight500' mt='$0.5'>
              {t('settings.notifications.vibrationSubtitle')}
            </Text>
          </VStack>
          <Switch value={vibration} onValueChange={setVibration} />
        </HStack>
      </Box>

      {/* Notification Types */}
      <Box bg='$white' mt='$4'>
        <Box px='$4' py='$2' bg='$backgroundLight100'>
          <Text size='sm' color='$textLight600' fontWeight='$medium'>
            {t('settings.sections.notificationTypes')}
          </Text>
        </Box>

        <ListItem
          title={t('settings.notifications.messagesNotif')}
          subtitle={t('settings.notifications.messagesNotifSubtitle')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='chatbubble-outline' size={22} color='#4CAF50' />
            </View>
          }
          onPress={() => {}}
        />
        <Divider ml='$16' />

        <ListItem
          title={t('settings.notifications.groupsNotif')}
          subtitle={t('settings.notifications.groupsNotifSubtitle')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF3E0', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='people-outline' size={22} color='#FF9800' />
            </View>
          }
          onPress={() => {}}
        />
        <Divider ml='$16' />

        <ListItem
          title={t('settings.notifications.friendRequests')}
          subtitle={t('settings.notifications.friendRequestsSubtitle')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='person-add-outline' size={22} color='#2196F3' />
            </View>
          }
          onPress={() => {}}
        />
      </Box>

      {/* DND */}
      <Box bg='$white' mt='$4' mb='$8'>
        <ListItem
          title={t('settings.notifications.doNotDisturb')}
          subtitle={t('settings.notifications.doNotDisturbSubtitle')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#ECEFF1', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='moon-outline' size={22} color='#607D8B' />
            </View>
          }
          onPress={() => {}}
        />
      </Box>
    </SettingsDetailScreen>
  )
}
