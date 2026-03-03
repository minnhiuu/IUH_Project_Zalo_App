import React from 'react'
import { View } from 'react-native'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { Box, VStack, HStack, Text, Divider, MenuItem } from '@/components/ui'
import { useTranslation } from 'react-i18next'

export default function JournalScreen() {
 const { t } = useTranslation()

 return (
 <SettingsDetailScreen title={t('settings.menu.journal.title')}>
 {/* Recent Activity */}
 <Box className="bg-background mt-2">
 <Box className="px-4 py-2 bg-background-secondary">
 <Text size="sm" className="text-muted-foreground font-medium">
 {t('settings.sections.recentActivity')}
 </Text>
 </Box>

 <VStack>
 <HStack className="px-4 py-3 items-center" space="md">
 <Ionicons name='log-in-outline' size={22} color='#4CAF50' />
 <VStack className="flex-1">
 <Text size="md" className="text-foreground">
 {t('settings.journal.login')}
 </Text>
 <Text size="sm" className="text-muted-foreground">
 iPhone 14 Pro • {t('settings.backupRestore.today')}, 10:30
 </Text>
 </VStack>
 </HStack>

 <HStack className="px-4 py-3 items-center" space="md">
 <Ionicons name='shield-checkmark-outline' size={22} color='#0068FF' />
 <VStack className="flex-1">
 <Text size="md" className="text-foreground">
 {t('settings.journal.passwordChange')}
 </Text>
 <Text size="sm" className="text-muted-foreground">
 Yesterday, 14:20
 </Text>
 </VStack>
 </HStack>

 <HStack className="px-4 py-3 items-center" space="md">
 <Ionicons name='person-add-outline' size={22} color='#2196F3' />
 <VStack className="flex-1">
 <Text size="md" className="text-foreground">
 {t('settings.journal.newFriend')}
 </Text>
 <Text size="sm" className="text-muted-foreground">
 2 days ago, 09:15
 </Text>
 </VStack>
 </HStack>
 </VStack>
 </Box>

 {/* Filter Options */}
 <Box className="bg-background mt-4">
 <Box className="px-4 py-2 bg-background-secondary">
 <Text size="sm" className="text-muted-foreground font-medium">
 {t('settings.sections.filter')}
 </Text>
 </Box>

 <MenuItem
 title={t('settings.journal.activityType')}
 subtitle={t('settings.journal.all')}
 leftComponent={
 <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3E5F5', alignItems: 'center', justifyContent: 'center' }}>
 <Ionicons name='funnel-outline' size={22} color='#9C27B0' />
 </View>
 }
 onPress={() => {}}
 />

 <MenuItem
 title={t('settings.journal.timeRange')}
 subtitle={t('settings.journal.last7Days')}
 leftComponent={
 <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' }}>
 <Ionicons name='calendar-outline' size={22} color='#2196F3' />
 </View>
 }
 onPress={() => {}}
 />
 </Box>

 {/* Actions */}
 <Box className="bg-background mt-4 mb-8">
 <MenuItem
 title={t('settings.journal.exportLog')}
 leftComponent={
 <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' }}>
 <Ionicons name='download-outline' size={22} color='#0068FF' />
 </View>
 }
 onPress={() => {}}
 />

 <MenuItem
 title={t('settings.journal.clearLog')}
 leftComponent={
 <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFEBEE', alignItems: 'center', justifyContent: 'center' }}>
 <Ionicons name='trash-outline' size={22} color='#F44336' />
 </View>
 }
 onPress={() => {}}
 />
 </Box>
 </SettingsDetailScreen>
 )
}
