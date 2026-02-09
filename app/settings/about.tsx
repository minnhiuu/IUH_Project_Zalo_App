import React from 'react'
import { Box, VStack, Text, Center } from '@gluestack-ui/themed'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'

export default function AboutScreen() {
  const { t } = useTranslation()

  return (
    <SettingsDetailScreen title={t('settings.menu.about.title')}>
      {/* App Icon & Version */}
      <VStack bg='$white' mt='$2' px='$4' py='$8'>
        <Center>
          <Ionicons name='chatbubble-ellipses' size={64} color='#0068FF' />
          <Text size='2xl' fontWeight='$bold' color='$textLight900' mt='$4'>
            Zalo
          </Text>
          <Text size='md' color='$textLight600' mt='$2'>
            {t('settings.about.version', { version: '1.0.0' })}
          </Text>
        </Center>
      </VStack>

      {/* Description */}
      <Box bg='$white' mt='$4' px='$4' py='$4'>
        <Text size='md' color='$textLight700' lineHeight='$xl' textAlign='center'>
          {t('settings.about.description')}
        </Text>
      </Box>

      {/* Copyright */}
      <Box bg='$white' mt='$4' px='$4' py='$6' mb='$8'>
        <Center>
          <Text size='sm' color='$textLight500'>
            {t('settings.about.copyright')}
          </Text>
        </Center>
      </Box>
    </SettingsDetailScreen>
  )
}
