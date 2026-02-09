import React from 'react'
import { Box, VStack, HStack, Text, Divider, Switch } from '@gluestack-ui/themed'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { ListItem } from '@/components/ui'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'

export default function ContactsScreen() {
  const { t } = useTranslation()
  const [syncEnabled, setSyncEnabled] = React.useState(true)

  return (
    <SettingsDetailScreen title={t('settings.menu.contacts.title')}>
      {/* Sync Settings */}
      <Box bg='$white' mt='$2'>
        <Box px='$4' py='$2' bg='$backgroundLight100'>
          <Text size='sm' color='$textLight600' fontWeight='$medium'>
            {t('settings.sections.sync')}
          </Text>
        </Box>

        <HStack px='$4' py='$3' alignItems='center' space='md'>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name='sync-outline' size={22} color='#4CAF50' />
          </View>
          <VStack flex={1}>
            <Text size='md' color='$textLight900'>
              {t('settings.contacts.syncContacts')}
            </Text>
            <Text size='sm' color='$textLight500' mt='$0.5'>
              {t('settings.contacts.syncContactsSubtitle')}
            </Text>
          </VStack>
          <Switch value={syncEnabled} onValueChange={setSyncEnabled} />
        </HStack>
      </Box>

      {/* Contact Management */}
      <VStack bg='$white' mt='$4' mb='$8'>
        <ListItem
          title={t('settings.contacts.allContacts')}
          subtitle={t('settings.contacts.contactsCount', { count: 250 })}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='people-outline' size={22} color='#2196F3' />
            </View>
          }
          onPress={() => {}}
        />
        <Divider ml='$16' />

        <ListItem
          title={t('settings.contacts.favorites')}
          subtitle={t('settings.contacts.contactsCount', { count: 12 })}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF3E0', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='star-outline' size={22} color='#FF9800' />
            </View>
          }
          onPress={() => {}}
        />
        <Divider ml='$16' />

        <ListItem
          title={t('settings.contacts.friendRequestsList')}
          subtitle={t('settings.contacts.requestsCount', { count: 3 })}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='person-add-outline' size={22} color='#0068FF' />
            </View>
          }
          onPress={() => {}}
        />
        <Divider ml='$16' />

        <ListItem
          title={t('settings.privacy.blockList')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFEBEE', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='ban-outline' size={22} color='#F44336' />
            </View>
          }
          onPress={() => {}}
        />
      </VStack>
    </SettingsDetailScreen>
  )
}
