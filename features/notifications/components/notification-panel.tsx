import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Text } from '@/components/ui/text'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme, useSemanticColors } from '@/context'
import { HEADER } from '@/constants/theme'
import { NotificationList, type NotificationFilter } from './notification-list'
import { useMarkHistoryAsCheckedMutation, useMarkAllAsReadMutation } from '../queries/use-mutation'
import { BottomSheet } from './bottom-sheet'

interface NotificationPanelProps {
  visible: boolean
  onClose: () => void
  highlightNotificationId?: string | null
}

export function NotificationPanel({ visible, onClose, highlightNotificationId }: NotificationPanelProps) {
  const { t } = useTranslation()
  const [filter, setFilter] = useState<NotificationFilter>('all')
  const [settingsVisible, setSettingsVisible] = useState(false)
  const semantic = useSemanticColors()
  const { colors, isDark } = useTheme()
  const { mutate: markAsChecked } = useMarkHistoryAsCheckedMutation()
  const { mutate: markAllAsRead } = useMarkAllAsReadMutation()

  useEffect(() => {
    if (visible) {
      markAsChecked()
    }
  }, [visible, markAsChecked])

  const gradientColors = isDark ? HEADER.gradientColorsDark : HEADER.gradientColors

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
        <LinearGradient colors={gradientColors}>
          <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: HEADER.paddingHorizontal,
                height: HEADER.height
              }}
            >
              <TouchableOpacity onPress={onClose} style={{ paddingRight: 10 }}>
                <Ionicons name='chevron-back' size={24} color='white' />
              </TouchableOpacity>

              <Text style={{ flex: 1, fontSize: 19, fontWeight: '600', color: '#fff' }} numberOfLines={1}>
                {t('notification.title')}
              </Text>

              <TouchableOpacity style={{ padding: 8 }} onPress={() => setSettingsVisible(true)} activeOpacity={0.7}>
                <Ionicons name='settings-outline' size={24} color='white' />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View className='flex-row gap-2 px-4 py-2 border-b' style={{ borderColor: colors.border }}>
          <TouchableOpacity
            onPress={() => setFilter('all')}
            className='px-4 py-1.5 rounded-full'
            style={{ backgroundColor: filter === 'all' ? (isDark ? 'rgba(0,104,255,0.2)' : 'rgba(0,104,255,0.1)') : 'transparent' }}
          >
            <Text className='font-semibold' style={{ color: filter === 'all' ? colors.tint : colors.textSecondary }}>
              {t('notification.filter.all')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilter('unread')}
            className='px-4 py-1.5 rounded-full'
            style={{ backgroundColor: filter === 'unread' ? (isDark ? 'rgba(0,104,255,0.2)' : 'rgba(0,104,255,0.1)') : 'transparent' }}
          >
            <Text className='font-semibold' style={{ color: filter === 'unread' ? colors.tint : colors.textSecondary }}>
              {t('notification.filter.unread')}
            </Text>
          </TouchableOpacity>
        </View>

        <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: semantic.background }}>
          <NotificationList key={filter} filter={filter} highlightNotificationId={highlightNotificationId} />
        </SafeAreaView>
      </View>

      {/* Settings Bottom Sheet */}
      <BottomSheet visible={settingsVisible} onClose={() => setSettingsVisible(false)}>
        <View className='pt-2 pb-8' style={{ backgroundColor: colors.background }}>
          <View className='px-[20px] mb-3'>
            <Text className='text-[18px] font-bold' style={{ color: colors.text }}>{t('notification.settings.title')}</Text>
          </View>

          <View className='mt-1'>
            <TouchableOpacity className='flex-row items-center py-[14px] px-[20px]' onPress={handleMarkAllRead}>
              <View className='mr-4'>
                <Ionicons name='checkmark-done-outline' size={24} color={colors.textSecondary} />
              </View>
              <Text className='text-[16px] font-medium' style={{ color: colors.text }}>{t('notification.action.markAllRead')}</Text>
            </TouchableOpacity>

            <View className='h-[8px]' style={{ backgroundColor: isDark ? colors.border : '#F4F5F7' }} />

            <View className='py-[12px] px-[20px]' style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#F9FAFB' }}>
              <Text className='text-[14px] font-bold uppercase tracking-tight' style={{ color: colors.textSecondary }}>
                {t('notification.settings.recent_activities_title')}
              </Text>
            </View>

            <TouchableOpacity className='flex-row items-center py-[14px] px-[20px]'>
              <View className='flex-1 flex-row justify-between items-center'>
                <Text className='text-[16px]' style={{ color: colors.text }}>{t('notification.settings.notify_new')}</Text>
                <Ionicons name='checkmark' size={20} color={colors.tint} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity className='flex-row items-center py-[14px] px-[20px]'>
              <Text className='text-[16px]' style={{ color: colors.text }}>{t('notification.settings.not_notify_new')}</Text>
            </TouchableOpacity>

            <TouchableOpacity className='flex-row items-center py-[14px] px-[20px]'>
              <Text className='text-[16px]' style={{ color: colors.text }}>{t('notification.settings.notify_new_except')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>
    </Modal>
  )
}
