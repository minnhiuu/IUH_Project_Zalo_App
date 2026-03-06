import React, { useState, useEffect } from 'react'
import { Modal, View, TouchableOpacity, TouchableWithoutFeedback } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui/text'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme, useSemanticColors } from '@/context/theme-context'
import { NotificationList, type NotificationFilter } from './notification-list'
import { useMarkHistoryAsCheckedMutation, useMarkAllAsReadMutation } from '../queries/use-mutation'
import { BottomSheet } from './bottom-sheet'

interface NotificationPanelProps {
  visible: boolean
  onClose: () => void
}

export function NotificationPanel({ visible, onClose }: NotificationPanelProps) {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const [filter] = useState<NotificationFilter>('all')
  const [settingsVisible, setSettingsVisible] = useState(false)
  const semantic = useSemanticColors()
  const { isDark } = useTheme()
  const { mutate: markAsChecked } = useMarkHistoryAsCheckedMutation()
  const { mutate: markAllAsRead } = useMarkAllAsReadMutation()

  useEffect(() => {
    if (visible) {
      markAsChecked()
    }
  }, [visible, markAsChecked])

  const gradientColors = isDark ? ([semantic.input, semantic.divider] as const) : (['#0068FF', '#0055DD'] as const)

  const handleMarkAllRead = () => {
    markAllAsRead()
    setSettingsVisible(false)
  }

  return (
    <Modal visible={visible} animationType='slide' transparent statusBarTranslucent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View className='absolute inset-0 bg-black/40' />
      </TouchableWithoutFeedback>

      <View style={{ backgroundColor: semantic.background }} className='absolute inset-0'>
        {/* Zalo-style Header */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: insets.top }}
        >
          <View className='flex-row items-center h-[56px] px-1'>
            <TouchableOpacity onPress={onClose} className='p-3'>
              <Ionicons name='arrow-back' size={24} color='white' />
            </TouchableOpacity>

            <Text className='flex-1 text-[18px] font-semibold text-white ml-1 leading-[24px]'>
              {t('notification.title')}
            </Text>

            <TouchableOpacity className='p-3' onPress={() => setSettingsVisible(true)} activeOpacity={0.7}>
              <Ionicons name='settings-outline' size={22} color='white' />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View className='flex-1'>
          <NotificationList key={filter} filter={filter} />
        </View>
      </View>

      {/* Settings Bottom Sheet */}
      <BottomSheet visible={settingsVisible} onClose={() => setSettingsVisible(false)}>
        <View className='pt-2 pb-8'>
          <View className='px-[20px] mb-3'>
            <Text className='text-[18px] font-bold text-gray-900'>{t('notification.settings.title')}</Text>
          </View>

          <View className='mt-1'>
            <TouchableOpacity className='flex-row items-center py-[14px] px-[20px]' onPress={handleMarkAllRead}>
              <View className='mr-4'>
                <Ionicons name='checkmark-done-outline' size={24} color='#374151' />
              </View>
              <Text className='text-[16px] text-gray-700 font-medium'>{t('notification.action.markAllRead')}</Text>
            </TouchableOpacity>

            <View className='h-[8px] bg-[#F4F5F7] my-1' />

            <View className='bg-[#F9FAFB] py-[12px] px-[20px]'>
              <Text className='text-[14px] font-bold text-gray-500 uppercase tracking-tight'>
                {t('notification.settings.recent_activities_title')}
              </Text>
            </View>

            <TouchableOpacity className='flex-row items-center py-[14px] px-[20px]'>
              <View className='flex-1 flex-row justify-between items-center'>
                <Text className='text-[16px] text-gray-700'>{t('notification.settings.notify_new')}</Text>
                <Ionicons name='checkmark' size={20} color='#0068FF' />
              </View>
            </TouchableOpacity>

            <TouchableOpacity className='flex-row items-center py-[14px] px-[20px]'>
              <Text className='text-[16px] text-gray-700'>{t('notification.settings.not_notify_new')}</Text>
            </TouchableOpacity>

            <TouchableOpacity className='flex-row items-center py-[14px] px-[20px]'>
              <Text className='text-[16px] text-gray-700'>{t('notification.settings.notify_new_except')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>
    </Modal>
  )
}
