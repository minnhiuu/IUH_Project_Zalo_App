import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { DeviceResponse, DeviceType } from '@/features/device/schemas/device.schema'

interface DeviceItemProps {
  device: DeviceResponse
  activeLabel: string
  currentLabel: string
  onPressMore: () => void
}

export function DeviceItem({ device, activeLabel, currentLabel, onPressMore }: DeviceItemProps) {
  const isMobile = device.deviceType === DeviceType.MOBILE
  const isActive = device.isActive
  const isCurrent = device.isCurrentDevice

  return (
    <View
      className={`border rounded-xl p-3 mb-3 ${isCurrent ? 'bg-primary-50 dark:bg-secondary border-primary-200 dark:border-primary' : 'bg-background border-border'}`}
    >
      <View className='flex-row items-start justify-between'>
        {/* Icon + Info */}
        <View className='flex-row items-center flex-1 gap-3'>
          <View
            className={`w-10 h-10 rounded-full items-center justify-center ${isMobile ? 'bg-primary-50 dark:bg-background' : 'bg-secondary dark:bg-background'}`}
          >
            <Ionicons
              name={isMobile ? 'phone-portrait-outline' : 'desktop-outline'}
              size={20}
              color={isMobile ? '#0068FF' : '#9C27B0'}
              className='dark:opacity-90'
            />
          </View>

          <View className='flex-1'>
            <View className='flex-row flex-wrap items-center gap-1.5 mb-0.5'>
              <Text className='text-sm font-bold text-foreground'>{device.deviceName || 'Unknown Device'}</Text>
              {isActive && (
                <View className='flex-row items-center gap-1 bg-[#E8F5E9] dark:bg-[#1B3320] px-2 py-0.5 rounded-full'>
                  <View className='w-1.5 h-1.5 rounded-full bg-[#4CAF50]' />
                  <Text className='text-xs text-[#1B5E20] dark:text-[#4CAF50] font-medium'>{activeLabel}</Text>
                </View>
              )}
              {isCurrent && (
                <View className='bg-primary-100 dark:bg-primary-900 px-2 py-0.5 rounded-full'>
                  <Text className='text-xs text-primary-700 dark:text-primary-400 font-medium'>{currentLabel}</Text>
                </View>
              )}
            </View>
            <Text className='text-xs text-muted-foreground mt-0.5'>
              {device.os || 'Unknown OS'} • {device.browser || 'Unknown Browser'}
            </Text>
            {device.lastActiveTime && (
              <Text className='text-xs text-muted-foreground mt-0.5'>
                {format(new Date(device.lastActiveTime), 'Pp')}
              </Text>
            )}
          </View>
        </View>

        {/* More options button */}
        <TouchableOpacity onPress={onPressMore} className='p-2'>
          <Ionicons name='ellipsis-horizontal' size={20} color='#6B7280' className='dark:text-icon-muted' />
        </TouchableOpacity>
      </View>
    </View>
  )
}
