import React from 'react'
import { Box, VStack, HStack, Text, Divider, Switch } from '@gluestack-ui/themed'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { ListItem } from '@/components/ui'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'

export default function PrivacyScreen() {
  const { t } = useTranslation()
  const [showOnline, setShowOnline] = React.useState(true)
  const [readReceipts, setReadReceipts] = React.useState(true)

  return (
    <SettingsDetailScreen title={t('settings.menu.privacy.title')}>
      {/* Profile Privacy */}
      <Box bg='$white' mt='$2'>
        <Box px='$4' py='$2' bg='$backgroundLight100'>
          <Text size='sm' color='$textLight600' fontWeight='$medium'>
            {t('settings.sections.personalInfo')}
          </Text>
        </Box>

        <ListItem
          title={t('settings.privacy.whoCanSeeProfile')}
          subtitle={t('settings.privacy.everyone')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='person-outline' size={22} color='#0068FF' />
            </View>
          }
          onPress={() => {}}
        />
        <Divider ml='$16' />

        <ListItem
          title={t('settings.privacy.whoCanSeePhotos')}
          subtitle={t('settings.privacy.friends')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='image-outline' size={22} color='#4CAF50' />
            </View>
          }
          onPress={() => {}}
        />
      </Box>

      {/* Activity Privacy */}
      <Box bg='$white' mt='$4'>
        <Box px='$4' py='$2' bg='$backgroundLight100'>
          <Text size='sm' color='$textLight600' fontWeight='$medium'>
            {t('settings.sections.activity')}
          </Text>
        </Box>

        <HStack px='$4' py='$3' alignItems='center' space='md'>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E3F2FD', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name='checkmark-circle-outline' size={22} color='#2196F3' />
          </View>
          <VStack flex={1}>
            <Text size='md' color='$textLight900'>
              {t('settings.privacy.showOnlineStatus')}
            </Text>
            <Text size='sm' color='$textLight500' mt='$0.5'>
              {t('settings.privacy.showOnlineStatusSubtitle')}
            </Text>
          </VStack>
          <Switch value={showOnline} onValueChange={setShowOnline} />
        </HStack>
        <Divider ml='$16' />

        <HStack px='$4' py='$3' alignItems='center' space='md'>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3E5F5', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name='checkmark-done-outline' size={22} color='#9C27B0' />
          </View>
          <VStack flex={1}>
            <Text size='md' color='$textLight900'>
              {t('settings.privacy.readReceipts')}
            </Text>
            <Text size='sm' color='$textLight500' mt='$0.5'>
              {t('settings.privacy.readReceiptsSubtitle')}
            </Text>
          </VStack>
          <Switch value={readReceipts} onValueChange={setReadReceipts} />
        </HStack>
      </Box>

      {/* Block & Report */}
      <Box bg='$white' mt='$4' mb='$8'>
        <Box px='$4' py='$2' bg='$backgroundLight100'>
          <Text size='sm' color='$textLight600' fontWeight='$medium'>
            {t('settings.sections.blockReport')}
          </Text>
        </Box>

        <ListItem
          title={t('settings.privacy.blockList')}
          subtitle={t('settings.privacy.blockListSubtitle')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFEBEE', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='ban-outline' size={22} color='#F44336' />
            </View>
          }
          onPress={() => {}}
        />
        <Divider ml='$16' />

        <ListItem
          title={t('settings.privacy.reportViolation')}
          subtitle={t('settings.privacy.reportViolationSubtitle')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF3E0', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='alert-circle-outline' size={22} color='#FF9800' />
            </View>
          }
          onPress={() => {}}
        />
      </Box>
    </SettingsDetailScreen>
  )
}
