import React from 'react'
import { View } from 'react-native'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { Box, Divider, MenuItem } from '@/components/ui'
import { useTranslation } from 'react-i18next'

export default function SupportScreen() {
 const { t } = useTranslation()

 return (
 <SettingsDetailScreen title={t('settings.menu.support.title')}>
 {/* Support Options */}
 <Box className="bg-background mt-2 mb-8">
 <MenuItem
 title={t('settings.support.faq')}
 subtitle={t('settings.support.faqSubtitle')}
 leftComponent={
 <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' }}>
 <Ionicons name='book-outline' size={22} color='#0068FF' />
 </View>
 }
 onPress={() => {}}
 />
 <Divider className="ml-16" />

 <MenuItem
 title={t('settings.support.chatSupport')}
 subtitle={t('settings.support.chatSupportSubtitle')}
 leftComponent={
 <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' }}>
 <Ionicons name='chatbubble-outline' size={22} color='#4CAF50' />
 </View>
 }
 onPress={() => {}}
 />
 <Divider className="ml-16" />

 <MenuItem
 title={t('settings.support.email')}
 subtitle='support@zalo.me'
 leftComponent={
 <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF3E0', alignItems: 'center', justifyContent: 'center' }}>
 <Ionicons name='mail-outline' size={22} color='#FF9800' />
 </View>
 }
 onPress={() => {}}
 />
 <Divider className="ml-16" />

 <MenuItem
 title={t('settings.support.hotline')}
 subtitle='1900 1234'
 leftComponent={
 <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' }}>
 <Ionicons name='call-outline' size={22} color='#2196F3' />
 </View>
 }
 onPress={() => {}}
 />
 </Box>
 </SettingsDetailScreen>
 )
}
