import React from 'react'
import { Box, VStack, HStack, Text, Divider, Switch } from '@gluestack-ui/themed'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { ListItem } from '@/components/ui'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'

export default function InterfaceLanguageScreen() {
  const { t } = useTranslation()
  const [darkMode, setDarkMode] = React.useState(false)

  return (
    <SettingsDetailScreen title={t('settings.menu.interfaceLanguage.title')}>
      {/* Theme */}
      <Box bg='$white' mt='$2'>
        <Box px='$4' py='$2' bg='$backgroundLight100'>
          <Text size='sm' color='$textLight600' fontWeight='$medium'>
            {t('settings.sections.interface')}
          </Text>
        </Box>

        <HStack px='$4' py='$3' alignItems='center' space='md'>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name='moon-outline' size={22} color='#FFFFFF' />
          </View>
          <VStack flex={1}>
            <Text size='md' color='$textLight900'>
              {t('settings.interfaceLanguage.darkMode')}
            </Text>
            <Text size='sm' color='$textLight500' mt='$0.5'>
              {t('settings.interfaceLanguage.darkModeSubtitle')}
            </Text>
          </VStack>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </HStack>
        <Divider ml='$16' />

        <ListItem
          title={t('settings.interfaceLanguage.themeColor')}
          subtitle={t('settings.interfaceLanguage.blue')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='color-palette-outline' size={22} color='#0068FF' />
            </View>
          }
          onPress={() => {}}
        />
      </Box>

      {/* Language */}
      <VStack bg='$white' mt='$4' mb='$8'>
        <Box px='$4' py='$2' bg='$backgroundLight100'>
          <Text size='sm' color='$textLight600' fontWeight='$medium'>
            {t('settings.sections.language')}
          </Text>
        </Box>

        <ListItem
          title={t('settings.interfaceLanguage.appLanguage')}
          subtitle={t('settings.interfaceLanguage.vietnamese')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='language-outline' size={22} color='#2196F3' />
            </View>
          }
          onPress={() => {}}
        />
      </VStack>
    </SettingsDetailScreen>
  )
}
