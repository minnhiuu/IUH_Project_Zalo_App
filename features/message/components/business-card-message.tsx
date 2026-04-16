import React from 'react'
import { View, TouchableOpacity, Linking } from 'react-native'
import QRCode from 'react-native-qrcode-svg'
import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components/common/user-avatar'
import type { BusinessCardPayload } from '../utils'

interface BusinessCardMessageProps {
  payload: BusinessCardPayload
  onMessagePress?: (userId: string) => void
}

export function BusinessCardMessage({ payload, onMessagePress }: BusinessCardMessageProps) {
  const qrValue = payload.qrValue || `bondhub://user/${payload.userId}?name=${encodeURIComponent(payload.name || '')}`

  const handleCall = () => {
    if (!payload.phone) return
    Linking.openURL(`tel:${payload.phone}`)
  }

  return (
    <View
      style={{
        width: 280,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#E5EEF8',
        borderWidth: 0.5,
        borderColor: '#D1DCEB'
      }}
    >
      <View
        style={{
          backgroundColor: '#1677E6',
          paddingHorizontal: 12,
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center'
        }}
      >
        <UserAvatar source={payload.avatar || null} name={payload.name || 'User'} size='md' />
        <View style={{ flex: 1, marginLeft: 8, minWidth: 0 }}>
          <Text style={{ color: '#fff', fontSize: 22 / 2, fontWeight: '700' }} numberOfLines={1}>
            {payload.name || 'User'}
          </Text>
          {!!payload.phone && (
            <Text style={{ color: 'rgba(255,255,255,0.92)', fontSize: 12 }} numberOfLines={1}>
              {payload.phone}
            </Text>
          )}
        </View>

        <View style={{ backgroundColor: '#fff', padding: 3, borderRadius: 4 }}>
          <QRCode value={qrValue} size={48} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', backgroundColor: '#E5EEF8' }}>
        <TouchableOpacity
          onPress={handleCall}
          disabled={!payload.phone}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            height: 46,
            opacity: payload.phone ? 1 : 0.6
          }}
        >
          <Text style={{ color: '#1F2937', fontSize: 14, fontWeight: '600' }}>Gọi Điện</Text>
        </TouchableOpacity>

        <View style={{ width: 0.5, backgroundColor: '#C7D2DF' }} />

        <TouchableOpacity
          onPress={() => onMessagePress?.(payload.userId)}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: 46 }}
        >
          <Text style={{ color: '#1F2937', fontSize: 14, fontWeight: '600' }}>Nhắn Tin</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
