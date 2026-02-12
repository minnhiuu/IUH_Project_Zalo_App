import React from 'react'
import { View } from 'react-native'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { Box, VStack, Text } from '@/components/ui'
import { useTranslation } from 'react-i18next'

export default function AboutScreen() {
 const { t } = useTranslation()

 return (
 <SettingsDetailScreen title={t('settings.menu.about.title')}>
 {/* App Icon & Version */}
 <Box className="bg-white mt-2 px-4 py-8">
 <VStack className="items-center justify-center">
 <Ionicons name='chatbubble-ellipses' size={64} color='#0068FF' />
 <Text size="2xl" className="text-gray-900 font-bold mt-4">
 Zalo
 </Text>
 <Text size="md" className="text-gray-600 mt-2">
 {t('settings.about.version', { version: '1.0.0' })}
 </Text>
 </VStack>
 </Box>

 {/* Description */}
 <Box className="bg-white mt-4 px-4 py-4">
 <Text size="md" className="text-gray-700 text-center">
 {t('settings.about.description')}
 </Text>
 </Box>

 {/* Copyright */}
 <Box className="bg-white mt-4 px-4 py-6 mb-8">
 <VStack className="items-center justify-center">
 <Text size="sm" className="text-gray-500">
 {t('settings.about.copyright')}
 </Text>
 </VStack>
 </Box>
 </SettingsDetailScreen>
 )
}
