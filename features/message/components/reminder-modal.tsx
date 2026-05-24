import React, { useState } from 'react'
import { Modal, View, TouchableOpacity, TextInput, Platform, ScrollView, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import DateTimePicker from '@react-native-community/datetimepicker'

import { Text } from '@/components/ui/text'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'
import { MessageResponse, ReminderTarget, RepeatType } from '../schemas'

interface ReminderModalProps {
  visible: boolean
  sourceMessage: MessageResponse | null
  onClose: () => void
  onSubmit: (reminderData: {
    title: string
    remindFor: ReminderTarget
    remindAt: string
    repeatType: RepeatType
  }) => void
}

export function ReminderModal({ visible, sourceMessage, onClose, onSubmit }: ReminderModalProps) {
  const { t } = useTranslation()
  const colorScheme = useColorScheme() ?? 'light'
  const colors = Colors[colorScheme]
  const isDark = colorScheme === 'dark'
  const insets = useSafeAreaInsets()

  const defaultTitle = sourceMessage?.content || ''
  const [title, setTitle] = useState(defaultTitle)
  const [remindFor, setRemindFor] = useState<ReminderTarget>(ReminderTarget.BOTH)
  const [date, setDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'quick' | 'advanced' | 'repeatOptions'>('quick')
  const [repeatType, setRepeatType] = useState<RepeatType>(RepeatType.NONE)

  const repeatOptions: Array<{ label: string; value: RepeatType }> = [
    { label: 'Không lặp lại', value: RepeatType.NONE },
    { label: 'Hằng ngày', value: RepeatType.DAILY },
    { label: 'Hằng tuần', value: RepeatType.WEEKLY },
    { label: 'Nhiều ngày hằng tuần', value: RepeatType.MULTIPLE_DAYS_WEEKLY },
    { label: 'Hằng tháng', value: RepeatType.MONTHLY },
    { label: 'Hằng năm', value: RepeatType.YEARLY }
  ]

  const repeatLabel = repeatOptions.find((option) => option.value === repeatType)?.label || 'Không lặp lại'

  const handleClose = () => {
    setViewMode('quick')
    onClose()
  }

  const handleSubmit = () => {
    onSubmit({
      title,
      remindFor,
      remindAt: date.toISOString(),
      repeatType
    })
    handleClose()
  }

  const formatDisplayDate = (d: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0')
    const day = pad(d.getDate())
    const month = pad(d.getMonth() + 1)
    const hours = pad(d.getHours())
    const minutes = pad(d.getMinutes())
    return `Hôm nay, ${day} tháng ${month} lúc ${hours}:${minutes}`
  }

  const QuickView = () => (
    <View className='flex-1 justify-end' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <TouchableOpacity className='flex-1' onPress={handleClose} />
      <View
        className='rounded-t-2xl pb-6 p-4'
        style={{
          backgroundColor: isDark ? '#2A2F36' : '#FFFFFF',
          paddingBottom: Math.max(insets.bottom, 24)
        }}
      >
        <View className='flex-row items-center justify-between mb-4'>
          <Text className='text-lg font-medium text-center flex-1 ml-6' style={{ color: isDark ? '#FFF' : '#000' }}>
            Đặt nhắc hẹn
          </Text>
          <TouchableOpacity onPress={handleClose} className='p-2'>
            <Ionicons name='close' size={24} color={isDark ? '#FFF' : '#000'} />
          </TouchableOpacity>
        </View>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder='Nhập tiêu đề nhắc hẹn'
          placeholderTextColor={isDark ? '#8899A6' : '#9ca3af'}
          className='text-lg pb-2 mb-6'
          style={{
            borderBottomWidth: 1,
            borderBottomColor: isDark ? '#3A3F46' : '#e5e7eb',
            color: isDark ? '#FFF' : '#000'
          }}
        />

        <Text className='text-sm font-medium mb-3' style={{ color: isDark ? '#FFF' : '#000' }}>
          Nhắc cho
        </Text>
        <View className='flex-row gap-6 mb-6'>
          <TouchableOpacity className='flex-row items-center gap-2' onPress={() => setRemindFor(ReminderTarget.ME)}>
            <View
              className={`w-5 h-5 rounded-full border items-center justify-center ${remindFor === ReminderTarget.ME ? 'border-[#0084FF]' : 'border-gray-400'}`}
            >
              {remindFor === ReminderTarget.ME && <View className='w-3 h-3 rounded-full bg-[#0084FF]' />}
            </View>
            <Text style={{ color: isDark ? '#FFF' : '#000' }}>Chỉ mình tôi</Text>
          </TouchableOpacity>
          <TouchableOpacity className='flex-row items-center gap-2' onPress={() => setRemindFor(ReminderTarget.BOTH)}>
            <View
              className={`w-5 h-5 rounded-full border items-center justify-center ${remindFor === ReminderTarget.BOTH ? 'border-[#0084FF]' : 'border-gray-400'}`}
            >
              {remindFor === ReminderTarget.BOTH && <View className='w-3 h-3 rounded-full bg-[#0084FF]' />}
            </View>
            <Text style={{ color: isDark ? '#FFF' : '#000' }}>Cả hai</Text>
          </TouchableOpacity>
        </View>

        <Text className='text-sm font-medium mb-2' style={{ color: isDark ? '#FFF' : '#000' }}>
          Thời gian nhắc
        </Text>
        <View className='border-b mb-6' style={{ borderBottomColor: '#0084FF' }}>
          <Text className='text-base py-2 text-[#0084FF]'>{formatDisplayDate(date)}</Text>
        </View>

        {Platform.OS === 'ios' && (
          <View className='mb-6 h-[150px] overflow-hidden justify-center items-center'>
            <DateTimePicker
              value={date}
              mode='datetime'
              display='spinner'
              onChange={(e, d) => d && setDate(d)}
              themeVariant={isDark ? 'dark' : 'light'}
              style={{ width: 320, height: 180 }}
            />
          </View>
        )}
        {Platform.OS === 'android' && (
          <View className='flex-row justify-between mb-6'>
            {/* Minimal mockup for Android Native Picker buttons since actual Picker requires 2 clicks */}
            <TouchableOpacity className='p-3 bg-[#333] rounded-lg flex-1 mr-2 items-center'>
              <Text className='text-white'>Chọn Ngày</Text>
            </TouchableOpacity>
            <TouchableOpacity className='p-3 bg-[#333] rounded-lg flex-1 ml-2 items-center'>
              <Text className='text-white'>Chọn Giờ</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className='flex-row gap-3 mt-4'>
          <TouchableOpacity
            className='flex-1 py-3 rounded-full border'
            style={{ borderColor: isDark ? '#555' : '#ccc', backgroundColor: isDark ? '#3A3F46' : '#fff' }}
            onPress={() => setViewMode('advanced')}
          >
            <Text className='text-center font-medium' style={{ color: isDark ? '#FFF' : '#000' }}>
              Tuỳ chọn khác
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className='flex-1 py-3 rounded-full bg-[#0084FF]' onPress={handleSubmit}>
            <Text className='text-white text-center font-medium'>Tạo nhắc hẹn</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  const AdvancedView = () => (
    <View className='flex-1' style={{ backgroundColor: isDark ? '#1C1C1E' : '#F3F4F6' }}>
      <View
        className='flex-row items-center justify-between px-4 pb-2 border-b'
        style={{
          borderBottomColor: isDark ? '#3A3F46' : '#e5e7eb',
          backgroundColor: isDark ? '#1C1C1E' : '#FFF',
          paddingTop: Math.max(insets.top, 16)
        }}
      >
        <TouchableOpacity onPress={handleClose} className='p-2'>
          <Ionicons name='close' size={24} color={isDark ? '#FFF' : '#000'} />
        </TouchableOpacity>
        <Text className='text-lg font-medium' style={{ color: isDark ? '#FFF' : '#000' }}>
          Tạo nhắc hẹn mới
        </Text>
        <TouchableOpacity onPress={handleSubmit} className='p-2'>
          <Text className='text-[#0084FF] font-medium text-base'>Xong</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className='flex-1 p-4'>
        <View className='flex-row items-center mb-6 pl-2'>
          <Ionicons name='alarm-outline' size={24} color='#EF4444' className='mr-3' />
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder='Tiêu đề nhắc hẹn'
            placeholderTextColor={isDark ? '#8899A6' : '#9ca3af'}
            className='text-base flex-1 border-b pb-2 ml-2'
            style={{
              borderBottomColor: isDark ? '#3A3F46' : '#e5e7eb',
              color: isDark ? '#FFF' : '#000'
            }}
          />
        </View>

        <TouchableOpacity
          className='flex-row items-center py-4 border-b pl-2'
          style={{ borderBottomColor: isDark ? '#3A3F46' : '#e5e7eb' }}
        >
          <Ionicons name='time-outline' size={24} color={isDark ? '#FFF' : '#000'} className='mr-3' />
          <Text className='text-base ml-2' style={{ color: isDark ? '#FFF' : '#000' }}>
            {formatDisplayDate(date)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className='flex-row items-center justify-between py-4 border-b pl-2'
          style={{ borderBottomColor: isDark ? '#3A3F46' : '#e5e7eb' }}
          onPress={() => setViewMode('repeatOptions')}
        >
          <View className='flex-row items-center'>
            <Ionicons name='repeat-outline' size={24} color={isDark ? '#FFF' : '#000'} className='mr-3' />
            <Text className='text-base ml-2' style={{ color: isDark ? '#FFF' : '#000' }}>
              {repeatType === RepeatType.NONE ? 'Chọn kiểu lặp lại (Vd: Hàng tuần)' : repeatLabel}
            </Text>
          </View>
          <Ionicons name='chevron-forward' size={20} color={isDark ? '#888' : '#ccc'} />
        </TouchableOpacity>

        <View className='py-4 pl-2'>
          <View className='flex-row items-center mb-4'>
            <Ionicons name='lock-closed-outline' size={24} color={isDark ? '#FFF' : '#000'} className='mr-3' />
            <Text className='text-base ml-2' style={{ color: isDark ? '#FFF' : '#000' }}>
              Nhắc cho
            </Text>
          </View>

          <View className='flex-row gap-6 ml-10'>
            <TouchableOpacity className='flex-row items-center gap-2' onPress={() => setRemindFor(ReminderTarget.ME)}>
              <View
                className={`w-5 h-5 rounded-full border items-center justify-center ${remindFor === ReminderTarget.ME ? 'border-[#0084FF]' : 'border-gray-400'}`}
              >
                {remindFor === ReminderTarget.ME && <View className='w-3 h-3 rounded-full bg-[#0084FF]' />}
              </View>
              <Text style={{ color: isDark ? '#FFF' : '#000' }}>Chỉ mình tôi</Text>
            </TouchableOpacity>
            <TouchableOpacity className='flex-row items-center gap-2' onPress={() => setRemindFor(ReminderTarget.BOTH)}>
              <View
                className={`w-5 h-5 rounded-full border items-center justify-center ${remindFor === ReminderTarget.BOTH ? 'border-[#0084FF]' : 'border-gray-400'}`}
              >
                {remindFor === ReminderTarget.BOTH && <View className='w-3 h-3 rounded-full bg-[#0084FF]' />}
              </View>
              <Text style={{ color: isDark ? '#FFF' : '#000' }}>Cả hai</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  )

  const RepeatOptionsView = () => {
    const options = repeatOptions
    return (
      <View className='flex-1' style={{ backgroundColor: isDark ? '#1C1C1E' : '#F3F4F6' }}>
        <View
          className='flex-row items-center px-4 py-4 border-b relative'
          style={{
            borderBottomColor: isDark ? '#3A3F46' : '#e5e7eb',
            backgroundColor: isDark ? '#1C1C1E' : '#FFF',
            paddingTop: Math.max(insets.top, 16)
          }}
        >
          <Text className='text-lg font-medium flex-1 text-center' style={{ color: isDark ? '#FFF' : '#000' }}>
            Chọn kiểu lặp lại
          </Text>
          <TouchableOpacity
            onPress={() => setViewMode('advanced')}
            className='absolute right-4 py-4'
            style={{ paddingTop: Math.max(insets.top, 16) }}
          >
            <Text className='text-[#0084FF] font-medium text-base'>Xong</Text>
          </TouchableOpacity>
        </View>
        <ScrollView>
          {options.map((option, idx) => (
            <TouchableOpacity
              key={idx}
              className='flex-row items-center justify-between py-4 px-4 border-b'
              style={{ borderBottomColor: isDark ? '#3A3F46' : '#e5e7eb' }}
              onPress={() => {
                setRepeatType(option.value)
                setViewMode('advanced')
              }}
            >
              <View className='flex-row items-center'>
                <View
                  className={`w-6 h-6 rounded-full border mr-3 items-center justify-center ${repeatType === option.value ? 'border-[#0084FF] bg-[#0084FF]' : 'border-gray-400'}`}
                >
                  {repeatType === option.value && <Ionicons name='checkmark' size={16} color='#FFF' />}
                </View>
                <Text className='text-base' style={{ color: isDark ? '#FFF' : '#000' }}>
                  {option.label}
                </Text>
              </View>
              {repeatType === option.value && <Ionicons name='checkmark' size={22} color='#0084FF' />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    )
  }

  return (
    <Modal
      visible={visible}
      animationType='slide'
      transparent={viewMode === 'quick'}
      onRequestClose={handleClose}
      statusBarTranslucent={Platform.OS === 'android'}
    >
      {viewMode === 'quick' && <QuickView />}
      {viewMode === 'advanced' && <AdvancedView />}
      {viewMode === 'repeatOptions' && <RepeatOptionsView />}
    </Modal>
  )
}
