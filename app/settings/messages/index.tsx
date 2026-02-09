import React from 'react'
import { Box, VStack, HStack, Text, Divider, Switch } from '@gluestack-ui/themed'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { ListItem } from '@/components/ui'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'

export default function MessagesScreen() {
  const { t } = useTranslation()
  const [messagePreview, setMessagePreview] = React.useState(true)
  const [autoDownload, setAutoDownload] = React.useState(true)
  const [saveToLibrary, setSaveToLibrary] = React.useState(false)

  return (
    <SettingsDetailScreen title={t('settings.menu.messages.title')}>
      {/* Display Settings */}
      <Box bg='$white' mt='$2'>
        <Box px='$4' py='$2' bg='$backgroundLight100'>
          <Text size='sm' color='$textLight600' fontWeight='$medium'>
            {t('settings.sections.display')}
          </Text>
        </Box>

        <HStack px='$4' py='$3' alignItems='center' space='md'>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name='eye-outline' size={22} color='#0068FF' />
          </View>
          <VStack flex={1}>
            <Text size='md' color='$textLight900'>
              {t('settings.messages.messagePreview')}
            </Text>
            <Text size='sm' color='$textLight500' mt='$0.5'>
              {t('settings.messages.messagePreviewSubtitle')}
            </Text>
          </VStack>
          <Switch value={messagePreview} onValueChange={setMessagePreview} />
        </HStack>
        <Divider ml='$16' />

        <ListItem
          title={t('settings.messages.fontSize')}
          subtitle={t('settings.messages.fontSizeMedium')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='text-outline' size={22} color='#2196F3' />
            </View>
          }
          onPress={() => {}}
        />
        <Divider ml='$16' />

        <ListItem
          title={t('settings.messages.chatTheme')}
          subtitle={t('settings.messages.chatThemeSubtitle')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3E5F5', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='color-palette-outline' size={22} color='#9C27B0' />
            </View>
          }
          onPress={() => {}}
        />
      </Box>

      {/* Media Settings */}
      <Box bg='$white' mt='$4'>
        <Box px='$4' py='$2' bg='$backgroundLight100'>
          <Text size='sm' color='$textLight600' fontWeight='$medium'>
            {t('settings.sections.media')}
          </Text>
        </Box>

        <HStack px='$4' py='$3' alignItems='center' space='md'>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name='download-outline' size={22} color='#4CAF50' />
          </View>
          <VStack flex={1}>
            <Text size='md' color='$textLight900'>
              {t('settings.messages.autoDownload')}
            </Text>
            <Text size='sm' color='$textLight500' mt='$0.5'>
              {t('settings.messages.autoDownloadSubtitle')}
            </Text>
          </VStack>
          <Switch value={autoDownload} onValueChange={setAutoDownload} />
        </HStack>
        <Divider ml='$16' />

        <HStack px='$4' py='$3' alignItems='center' space='md'>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF3E0', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name='save-outline' size={22} color='#FF9800' />
          </View>
          <VStack flex={1}>
            <Text size='md' color='$textLight900'>
              {t('settings.messages.saveToLibrary')}
            </Text>
            <Text size='sm' color='$textLight500' mt='$0.5'>
              {t('settings.messages.saveToLibrarySubtitle')}
            </Text>
          </VStack>
          <Switch value={saveToLibrary} onValueChange={setSaveToLibrary} />
        </HStack>
      </Box>

      {/* Advanced */}
      <Box bg='$white' mt='$4' mb='$8'>
        <Box px='$4' py='$2' bg='$backgroundLight100'>
          <Text size='sm' color='$textLight600' fontWeight='$medium'>
            {t('settings.sections.advanced')}
          </Text>
        </Box>

        <ListItem
          title={t('settings.messages.endToEndEncryption')}
          subtitle={t('settings.messages.endToEndEncryptionSubtitle')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='lock-closed-outline' size={22} color='#0068FF' />
            </View>
          }
          onPress={() => {}}
        />
        <Divider ml='$16' />

        <ListItem
          title={t('settings.messages.archivedMessages')}
          subtitle={t('settings.messages.archivedMessagesSubtitle')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#ECEFF1', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='archive-outline' size={22} color='#607D8B' />
            </View>
          }
          onPress={() => {}}
        />
      </Box>
    </SettingsDetailScreen>
  )
}
