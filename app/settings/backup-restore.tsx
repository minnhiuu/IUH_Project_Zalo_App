import React from 'react'
import { Box, VStack, HStack, Text, Divider, Switch } from '@gluestack-ui/themed'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { ListItem } from '@/components/ui'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'

export default function BackupRestoreScreen() {
  const { t } = useTranslation()
  const [autoBackup, setAutoBackup] = React.useState(true)
  const [backupOverWifi, setBackupOverWifi] = React.useState(true)

  return (
    <SettingsDetailScreen title={t('settings.menu.backupRestore.title')}>
      {/* Last Backup Info */}
      <VStack bg='$white' mt='$2' px='$4' py='$4'>
        <HStack justifyContent='space-between' alignItems='center'>
          <Text size='md' color='$textLight600'>
            {t('settings.backupRestore.lastBackup')}
          </Text>
          <Text size='md' color='$textLight900' fontWeight='$medium'>
            {t('settings.backupRestore.today')}, 10:30
          </Text>
        </HStack>
      </VStack>

      {/* Backup Settings */}
      <Box bg='$white' mt='$4'>
        <Box px='$4' py='$2' bg='$backgroundLight100'>
          <Text size='sm' color='$textLight600' fontWeight='$medium'>
            {t('settings.sections.backupSettings')}
          </Text>
        </Box>

        <HStack px='$4' py='$3' alignItems='center' space='md'>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name='cloud-upload-outline' size={22} color='#0068FF' />
          </View>
          <VStack flex={1}>
            <Text size='md' color='$textLight900'>
              {t('settings.backupRestore.autoBackup')}
            </Text>
            <Text size='sm' color='$textLight500' mt='$0.5'>
              {t('settings.backupRestore.autoBackupSubtitle')}
            </Text>
          </VStack>
          <Switch value={autoBackup} onValueChange={setAutoBackup} />
        </HStack>
        <Divider ml='$16' />

        <HStack px='$4' py='$3' alignItems='center' space='md'>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name='wifi-outline' size={22} color='#2196F3' />
          </View>
          <VStack flex={1}>
            <Text size='md' color='$textLight900'>
              {t('settings.backupRestore.backupOverWifi')}
            </Text>
            <Text size='sm' color='$textLight500' mt='$0.5'>
              {t('settings.backupRestore.backupOverWifiSubtitle')}
            </Text>
          </VStack>
          <Switch value={backupOverWifi} onValueChange={setBackupOverWifi} />
        </HStack>
        <Divider ml='$16' />

        <ListItem
          title={t('settings.backupRestore.backupContent')}
          subtitle={t('settings.backupRestore.backupContentSubtitle')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='list-outline' size={22} color='#4CAF50' />
            </View>
          }
          onPress={() => {}}
        />
      </Box>

      {/* Actions */}
      <VStack bg='$white' mt='$4' mb='$8'>
        <ListItem
          title={t('settings.backupRestore.backupNow')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='cloud-upload-outline' size={22} color='#0068FF' />
            </View>
          }
          showArrow={false}
          onPress={() => {}}
        />

        <ListItem
          title={t('settings.backupRestore.restoreData')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF3E0', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='cloud-download-outline' size={22} color='#FF9800' />
            </View>
          }
          showArrow={false}
          onPress={() => {}}
        />
      </VStack>
    </SettingsDetailScreen>
  )
}
