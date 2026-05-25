import React from 'react'
import { View, TouchableOpacity, Linking } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components/common/user-avatar'
import type { BusinessCardPayload } from '../utils'

interface BusinessCardMessageProps {
  payload: BusinessCardPayload
  onCardPress?: (userId: string) => void
  onMessagePress?: (userId: string) => void
  onLongPress?: () => void
}

export function BusinessCardMessage({ payload, onCardPress, onMessagePress, onLongPress }: BusinessCardMessageProps) {
  const handleCall = () => {
    if (!payload.phone) return
    Linking.openURL(`tel:${payload.phone}`)
  }

  const canMessage = !!payload.userId && typeof onMessagePress === 'function'
  const qrValue = payload.qrValue || `bondhub://user/${payload.userId}?name=${encodeURIComponent(payload.name || '')}`

  return (
    <View
      style={{
        width: 284,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        borderWidth: 0.8,
        borderColor: '#D7DDE6'
      }}
    >
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={() => payload.userId && onCardPress?.(payload.userId)}
        onLongPress={onLongPress}
        delayLongPress={260}
      >
        <View
          style={{
            backgroundColor: '#1473E6',
            paddingHorizontal: 14,
            paddingVertical: 12,
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 106
          }}
        >
          <View
            style={{
              position: 'absolute',
              right: -28,
              top: -18,
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: 'rgba(255,255,255,0.08)'
            }}
          />
          <View
            style={{
              position: 'absolute',
              right: 28,
              top: 26,
              width: 84,
              height: 84,
              borderRadius: 42,
              backgroundColor: 'rgba(255,255,255,0.06)'
            }}
          />

          <UserAvatar source={payload.avatar || null} name={payload.name || 'User'} size='lg' />
          <View style={{ flex: 1, marginLeft: 10, minWidth: 0 }}>
            <Text style={{ color: '#fff', fontSize: 31 / 2, fontWeight: '700' }} numberOfLines={1}>
              {payload.name || 'User'}
            </Text>
            {!!payload.phone && (
              <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 16 }} numberOfLines={1}>
                {payload.phone}
              </Text>
            )}
          </View>

          <View
            style={{
              width: 54,
              height: 54,
              borderRadius: 8,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 8
            }}
          >
            <QRCode value={qrValue} size={42} />
          </View>
        </View>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', backgroundColor: '#FFFFFF', minHeight: 52 }}>
        <TouchableOpacity
          onPress={handleCall}
          onLongPress={onLongPress}
          delayLongPress={260}
          disabled={!payload.phone}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            height: 52,
            opacity: payload.phone ? 1 : 0.6
          }}
        >
          <Text style={{ color: '#1F2937', fontSize: 19 / 2, fontWeight: '700' }}>Gọi điện</Text>
        </TouchableOpacity>

        {canMessage && (
          <>
            <View style={{ width: 0.8, backgroundColor: '#D7DDE6' }} />
            <TouchableOpacity
              onPress={() => onMessagePress?.(payload.userId)}
              onLongPress={onLongPress}
              delayLongPress={260}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: 52 }}
            >
              <Text style={{ color: '#1473E6', fontSize: 19 / 2, fontWeight: '700' }}>Nhắn tin</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  )
}
