import React from 'react'
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@/context'

interface TimeInputBottomSheetProps {
  visible: boolean
  title: string
  hour: number
  minute: number
  isSaving?: boolean
  onChangeHour: (nextHour: number) => void
  onChangeMinute: (nextMinute: number) => void
  onClose: () => void
  onSave: () => void
}

export function TimeInputBottomSheet({
  visible,
  title,
  hour,
  minute,
  isSaving = false,
  onChangeHour,
  onChangeMinute,
  onClose,
  onSave
}: TimeInputBottomSheetProps) {
  const { colors } = useTheme()
  const { t } = useTranslation()

  const displayHour = String(hour).padStart(2, '0')
  const displayMinute = String(minute).padStart(2, '0')

  const HOUR_OPTIONS = Array.from({ length: 24 }, (_, idx) => idx + 1)
  const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, idx) => idx)

  return (
    <Modal transparent visible={visible} animationType='fade' onRequestClose={onClose}>
      <View className='flex-1 justify-end'>
        <Pressable className='absolute inset-0' style={{ backgroundColor: 'rgba(0,0,0,0.45)' }} onPress={onClose} />

        <View className='rounded-t-3xl bg-background px-5 pb-8 pt-4'>
          <View className='self-center mb-4 h-1.5 w-10 rounded-full bg-border' />

          <Text className='text-base text-foreground mb-3'>{title}</Text>

          <View className='rounded-xl border border-border px-4 py-3 mb-3'>
            <Text className='text-center text-lg font-semibold text-foreground'>{`${displayHour}:${displayMinute}`}</Text>
          </View>

          <View className='flex-row gap-3'>
            <View className='flex-1'>
              <Text className='text-sm text-muted-foreground mb-2'>{t('settings.notifications.timePickerHour')}</Text>
              <View className='h-56 rounded-xl border border-border overflow-hidden'>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {HOUR_OPTIONS.map((h) => {
                    const selected = h === hour
                    return (
                      <TouchableOpacity
                        key={`hour-${h}`}
                        activeOpacity={0.8}
                        className={`px-4 py-3 border-b border-border ${selected ? 'bg-primary/10' : 'bg-background'}`}
                        onPress={() => onChangeHour(h)}
                      >
                        <Text className={`text-center ${selected ? 'text-primary font-semibold' : 'text-foreground'}`}>
                          {String(h).padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                </ScrollView>
              </View>
            </View>

            <View className='flex-1'>
              <Text className='text-sm text-muted-foreground mb-2'>{t('settings.notifications.timePickerMinute')}</Text>
              <View className='h-56 rounded-xl border border-border overflow-hidden'>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {MINUTE_OPTIONS.map((m) => {
                    const selected = m === minute
                    return (
                      <TouchableOpacity
                        key={`minute-${m}`}
                        activeOpacity={0.8}
                        className={`px-4 py-3 border-b border-border ${selected ? 'bg-primary/10' : 'bg-background'}`}
                        onPress={() => onChangeMinute(m)}
                      >
                        <Text className={`text-center ${selected ? 'text-primary font-semibold' : 'text-foreground'}`}>
                          {String(m).padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                </ScrollView>
              </View>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            className='mt-4 rounded-xl bg-primary py-3 items-center justify-center'
            onPress={onSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size='small' color={colors.background} />
            ) : (
              <Text className='text-sm font-semibold text-white'>{t('common.save')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}
