import React from 'react'
import { View } from 'react-native'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { Box, VStack, HStack, Text, Divider, Switch, MenuItem } from '@/components/ui'
import { useTranslation } from 'react-i18next'

export default function BackupRestoreScreen() {
 const { t } = useTranslation()
 const [autoBackup, setAutoBackup] = React.useState(true)
 const [backupOverWifi, setBackupOverWifi] = React.useState(true)

 return (
 <SettingsDetailScreen title={t('settings.menu.backupRestore.title')}>
 {/* Last Backup Info */}
 <Box className="bg-background mt-2 px-4 py-4">
 <HStack className="items-center" space="md">
 <Text size="md" className="text-muted-foreground">
 {t('settings.backupRestore.lastBackup')}
 </Text>
 <Text size="md" className="text-foreground font-medium">
 {t('settings.backupRestore.today')}, 10:30
 </Text>
 </HStack>
 </Box>

 {/* Backup Settings */}
 <Box className="bg-background mt-4">
 <Box className="px-4 py-2 bg-background-secondary">
 <Text size="sm" className="text-muted-foreground font-medium">
 {t('settings.sections.backupSettings')}
 </Text>
 </Box>

 <HStack className="px-4 py-3 items-center" space="md">
 <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' }}>
 <Ionicons name='cloud-upload-outline' size={22} color='#0068FF' />
 </View>
 <VStack className="flex-1">
 <Text size="md" className="text-foreground">
 {t('settings.backupRestore.autoBackup')}
 </Text>
 <Text size="sm" className="text-muted-foreground mt-0.5">
 {t('settings.backupRestore.autoBackupSubtitle')}
 </Text>
 </VStack>
 <Switch value={autoBackup} onValueChange={setAutoBackup} />
 </HStack>
 <Divider className="ml-16" />

 <HStack className="px-4 py-3 items-center" space="md">
 <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' }}>
 <Ionicons name='wifi-outline' size={22} color='#2196F3' />
 </View>
 <VStack className="flex-1">
 <Text size="md" className="text-foreground">
 {t('settings.backupRestore.backupOverWifi')}
 </Text>
 <Text size="sm" className="text-muted-foreground mt-0.5">
 {t('settings.backupRestore.backupOverWifiSubtitle')}
 </Text>
 </VStack>
 <Switch value={backupOverWifi} onValueChange={setBackupOverWifi} />
 </HStack>
 <Divider className="ml-16" />

 <MenuItem
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
 <Box className="bg-background mt-4 mb-8">
 <MenuItem
 title={t('settings.backupRestore.backupNow')}
 leftComponent={
 <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' }}>
 <Ionicons name='cloud-upload-outline' size={22} color='#0068FF' />
 </View>
 }
 onPress={() => {}}
 />

 <MenuItem
 title={t('settings.backupRestore.restoreData')}
 leftComponent={
 <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF3E0', alignItems: 'center', justifyContent: 'center' }}>
 <Ionicons name='cloud-download-outline' size={22} color='#FF9800' />
 </View>
 }
 onPress={() => {}}
 />
 </Box>
 </SettingsDetailScreen>
 )
}
