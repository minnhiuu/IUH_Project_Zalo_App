import React, { memo } from 'react'
import { View, Text, TouchableOpacity, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/context'
import { UserAvatar } from '@/components'
import type { ToastConfigParams } from 'react-native-toast-message'
import { renderHtmlText } from '../utils/render-utils'

/**
 * Custom Floating Notification Toast
 * Mimics native OS notification styles with Zalo-specific branding.
 */
function NotificationToastComponent({ text1, text2, props, onPress }: ToastConfigParams<any>) {
  const { colors, isDark } = useTheme()
  
  // Extract metadata from props
  const actorAvatar = props?.actorAvatar
  const actorName = props?.actorName || text1

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => {
        if (onPress) onPress()
      }}
      style={{
        width: '94%',
        backgroundColor: isDark ? '#242526' : '#FFFFFF',
        borderRadius: 12, // Reduced from 18 for a sleeker look
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
          },
          android: {
            elevation: 4,
          },
        }),
        marginTop: Platform.OS === 'ios' ? 0 : 8,
      }}
    >
      {/* Avatar Section (Simplified) */}
      <View>
        <UserAvatar
          source={actorAvatar}
          name={actorName}
          size='md'
        />
      </View>

      {/* Content Section */}
      <View className='flex-1 ml-3'>
        <Text 
          className='font-bold text-[14px]'
          style={{ color: colors.text }}
          numberOfLines={1}
        >
          {text1}
        </Text>
        <Text 
          className='text-[13px] mt-0.5'
          style={{ color: colors.textSecondary }}
          numberOfLines={2}
        >
          {renderHtmlText(text2 || '', { fontSize: 13, color: colors.textSecondary })}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

// Memoize to prevent unnecessary re-renders when other app state changes
const MemoizedNotificationToast = memo(NotificationToastComponent)

export const notificationToastConfig = {
  notification: (params: ToastConfigParams<any>) => <MemoizedNotificationToast {...params} />
}
