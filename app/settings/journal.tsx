import React from 'react'
import { Box, VStack, HStack, Text } from '@gluestack-ui/themed'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { ListItem } from '@/components/ui'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'

export default function JournalScreen() {
  const { t } = useTranslation()

  return (
    <SettingsDetailScreen title={t('settings.menu.journal.title')}>
      {/* Recent Activity */}
      <Box bg='$white' mt='$2'>
        <Box px='$4' py='$2' bg='$backgroundLight100'>
          <Text size='sm' color='$textLight600' fontWeight='$medium'>
            {t('settings.sections.recentActivity')}
          </Text>
        </Box>

        <VStack>
          <HStack px='$4' py='$3' justifyContent='space-between'>
            <HStack alignItems='center' flex={1} space='md'>
              <Ionicons name='log-in-outline' size={22} color='#4CAF50' />
              <VStack flex={1}>
                <Text size='md' color='$textLight900'>
                  {t('settings.journal.login')}
                </Text>
                <Text size='sm' color='$textLight500'>
                  iPhone 14 Pro • {t('settings.backupRestore.today')}, 10:30
                </Text>
              </VStack>
            </HStack>
          </HStack>

          <HStack px='$4' py='$3' justifyContent='space-between'>
            <HStack alignItems='center' flex={1} space='md'>
              <Ionicons name='shield-checkmark-outline' size={22} color='#0068FF' />
              <VStack flex={1}>
                <Text size='md' color='$textLight900'>
                  {t('settings.journal.passwordChange')}
                </Text>
                <Text size='sm' color='$textLight500'>
                  Yesterday, 14:20
                </Text>
              </VStack>
            </HStack>
          </HStack>

          <HStack px='$4' py='$3' justifyContent='space-between'>
            <HStack alignItems='center' flex={1} space='md'>
              <Ionicons name='person-add-outline' size={22} color='#2196F3' />
              <VStack flex={1}>
                <Text size='md' color='$textLight900'>
                  {t('settings.journal.newFriend')}
                </Text>
                <Text size='sm' color='$textLight500'>
                  2 days ago, 09:15
                </Text>
              </VStack>
            </HStack>
          </HStack>
        </VStack>
      </Box>

      {/* Filter Options */}
      <Box bg='$white' mt='$4'>
        <Box px='$4' py='$2' bg='$backgroundLight100'>
          <Text size='sm' color='$textLight600' fontWeight='$medium'>
            {t('settings.sections.filter')}
          </Text>
        </Box>

        <ListItem
          title={t('settings.journal.activityType')}
          subtitle={t('settings.journal.all')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3E5F5', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='funnel-outline' size={22} color='#9C27B0' />
            </View>
          }
          onPress={() => {}}
        />

        <ListItem
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
      <VStack bg='$white' mt='$4' mb='$8'>
        <ListItem
          title={t('settings.journal.exportLog')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='download-outline' size={22} color='#0068FF' />
            </View>
          }
          showArrow={false}
          onPress={() => {}}
        />

        <ListItem
          title={t('settings.journal.clearLog')}
          leftComponent={
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFEBEE', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name='trash-outline' size={22} color='#F44336' />
            </View>
          }
          showArrow={false}
          onPress={() => {}}
        />
      </VStack>
    </SettingsDetailScreen>
  )
}
