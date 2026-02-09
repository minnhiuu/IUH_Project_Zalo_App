import React from 'react'
import { Box, VStack, HStack, Text, Center } from '@gluestack-ui/themed'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { ListItem } from '@/components/ui'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'

export default function DataOnDeviceScreen() {
  const { t } = useTranslation()

  return (
    <SettingsDetailScreen title={t('settings.menu.dataOnDevice.title')}>
      {/* Storage Info */}
      <VStack bg='$white' mt='$2' px='$4' py='$6'>
        <Center>
          <Ionicons name='phone-portrait-outline' size={48} color='#9C27B0' />
          <Text size='3xl' fontWeight='$bold' color='$textLight900' mt='$4'>
            2.4 GB
          </Text>
          <Text size='sm' color='$textLight500' mt='$1'>
            {t('settings.dataOnDevice.totalUsed')}
          </Text>
        </Center>
      </VStack>

      {/* Storage Breakdown */}
      <Box bg='$white' mt='$4'>
        <Box px='$4' py='$2' bg='$backgroundLight100'>
          <Text size='sm' color='$textLight600' fontWeight='$medium'>
            {t('settings.sections.storageDetails')}
          </Text>
        </Box>

        <HStack px='$4' py='$3' justifyContent='space-between' alignItems='center'>
          <HStack alignItems='center' flex={1} space='md'>
            <Ionicons name='image-outline' size={22} color='#4CAF50' />
            <Text size='md' color='$textLight900'>
              {t('settings.dataOnDevice.images')}
            </Text>
          </HStack>
          <Text size='md' color='$textLight600'>
            1.2 GB
          </Text>
        </HStack>

        <HStack px='$4' py='$3' justifyContent='space-between' alignItems='center'>
          <HStack alignItems='center' flex={1} space='md'>
            <Ionicons name='videocam-outline' size={22} color='#F44336' />
            <Text size='md' color='$textLight900'>
              {t('settings.dataOnDevice.videos')}
            </Text>
          </HStack>
          <Text size='md' color='$textLight600'>
            800 MB
          </Text>
        </HStack>

        <HStack px='$4' py='$3' justifyContent='space-between' alignItems='center'>
          <HStack alignItems='center' flex={1} space='md'>
            <Ionicons name='document-outline' size={22} color='#FF9800' />
            <Text size='md' color='$textLight900'>
              {t('settings.dataOnDevice.documents')}
            </Text>
          </HStack>
          <Text size='md' color='$textLight600'>
            300 MB
          </Text>
        </HStack>

        <HStack px='$4' py='$3' justifyContent='space-between' alignItems='center'>
          <HStack alignItems='center' flex={1} space='md'>
            <Ionicons name='musical-notes-outline' size={22} color='#9C27B0' />
            <Text size='md' color='$textLight900'>
              {t('settings.dataOnDevice.audio')}
            </Text>
          </HStack>
          <Text size='md' color='$textLight600'>
            100 MB
          </Text>
        </HStack>
      </Box>

      {/* Actions */}
      <VStack bg='$white' mt='$4' mb='$8'>
        <ListItem
          title={t('settings.dataOnDevice.clearCache')}
          subtitle={t('settings.dataOnDevice.clearCacheSubtitle')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFEBEE', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='trash-outline' size={22} color='#F44336' />
            </View>
          }
          onPress={() => {}}
        />

        <ListItem
          title={t('settings.dataOnDevice.manageData')}
          subtitle={t('settings.dataOnDevice.manageDataSubtitle')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#ECEFF1', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='settings-outline' size={22} color='#607D8B' />
            </View>
          }
          onPress={() => {}}
        />
      </VStack>
    </SettingsDetailScreen>
  )
}
