import React from 'react'
import { Box, VStack, HStack, Text, Divider, Switch } from '@gluestack-ui/themed'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { ListItem } from '@/components/ui'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'

export default function CallsScreen() {
  const { t } = useTranslation()
  const [allowCalls, setAllowCalls] = React.useState(true)
  const [allowVideoCalls, setAllowVideoCalls] = React.useState(true)

  return (
    <SettingsDetailScreen title={t('settings.menu.calls.title')}>
      {/* Call Settings */}
      <Box bg='$white' mt='$2'>
        <Box px='$4' py='$2' bg='$backgroundLight100'>
          <Text size='sm' color='$textLight600' fontWeight='$medium'>
            {t('settings.sections.callSettings')}
          </Text>
        </Box>

        <HStack px='$4' py='$3' alignItems='center' space='md'>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name='call-outline' size={22} color='#0068FF' />
          </View>
          <VStack flex={1}>
            <Text size='md' color='$textLight900'>
              {t('settings.calls.allowCalls')}
            </Text>
            <Text size='sm' color='$textLight500' mt='$0.5'>
              {t('settings.calls.allowCallsSubtitle')}
            </Text>
          </VStack>
          <Switch value={allowCalls} onValueChange={setAllowCalls} />
        </HStack>
        <Divider ml='$16' />

        <HStack px='$4' py='$3' alignItems='center' space='md'>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name='videocam-outline' size={22} color='#2196F3' />
          </View>
          <VStack flex={1}>
            <Text size='md' color='$textLight900'>
              {t('settings.calls.allowVideoCalls')}
            </Text>
            <Text size='sm' color='$textLight500' mt='$0.5'>
              {t('settings.calls.allowVideoCallsSubtitle')}
            </Text>
          </VStack>
          <Switch value={allowVideoCalls} onValueChange={setAllowVideoCalls} />
        </HStack>
      </Box>

      {/* Quality Settings */}
      <Box bg='$white' mt='$4'>
        <Box px='$4' py='$2' bg='$backgroundLight100'>
          <Text size='sm' color='$textLight600' fontWeight='$medium'>
            {t('settings.sections.quality')}
          </Text>
        </Box>

        <ListItem
          title={t('settings.calls.audioQuality')}
          subtitle={t('settings.calls.automatic')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='musical-notes-outline' size={22} color='#4CAF50' />
            </View>
          }
          onPress={() => {}}
        />
        <Divider ml='$16' />

        <ListItem
          title={t('settings.calls.videoQuality')}
          subtitle={t('settings.calls.hd')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3E5F5', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='videocam-outline' size={22} color='#9C27B0' />
            </View>
          }
          onPress={() => {}}
        />
      </Box>

      {/* Other Settings */}
      <Box bg='$white' mt='$4' mb='$8'>
        <ListItem
          title={t('settings.calls.ringtone')}
          subtitle={t('settings.calls.ringtoneSubtitle')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF3E0', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='musical-note-outline' size={22} color='#FF9800' />
            </View>
          }
          onPress={() => {}}
        />
        <Divider ml='$16' />

        <ListItem
          title={t('settings.calls.callHistory')}
          subtitle={t('settings.calls.callHistorySubtitle')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#ECEFF1', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='time-outline' size={22} color='#607D8B' />
            </View>
          }
          onPress={() => {}}
        />
      </Box>
    </SettingsDetailScreen>
  )
}
