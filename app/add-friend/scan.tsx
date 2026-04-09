import React, { useMemo, useRef, useState } from 'react'
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'

const USER_QR_REGEX = /^bondhub:\/\/user\/([^\s/?#]+)(\?.*)?$/i

function parseUserIdFromQr(raw: string): string | null {
  const data = String(raw || '').trim()
  const matched = data.match(USER_QR_REGEX)
  if (matched?.[1]) return matched[1]

  try {
    const url = new URL(data)
    const protocol = url.protocol.toLowerCase()

    if (protocol === 'bondhub:') {
      // Expected shape: bondhub://user/{id}?name=...
      if (url.hostname === 'user') {
        const id = url.pathname.split('/').filter(Boolean)[0]
        return id || null
      }

      if (url.pathname.startsWith('/user/')) {
        const id = url.pathname.split('/').filter(Boolean)[1]
        return id || null
      }
    }

    if ((protocol === 'https:' || protocol === 'http:') && url.pathname.startsWith('/user/')) {
      const id = url.pathname.split('/').filter(Boolean)[1]
      return id || null
    }
  } catch {
    return null
  }

  return null
}

export default function AddFriendScanScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const scanningLockedRef = useRef(false)
  const [torchEnabled, setTorchEnabled] = useState(false)

  const hasPermission = useMemo(() => permission?.granted === true, [permission?.granted])

  const onScanned = ({ data }: { data: string }) => {
    if (scanned || scanningLockedRef.current) return

    const userId = parseUserIdFromQr(data)
    if (!userId) {
      scanningLockedRef.current = true
      setScanned(true)
      Alert.alert(
        t('common.error'),
        t('friend.addFriend.invalidQr'),
        [
          {
            text: 'OK',
            onPress: () => {
              scanningLockedRef.current = false
              setScanned(false)
            },
          },
        ]
      )
      return
    }

    scanningLockedRef.current = true
    setScanned(true)
    router.replace(`/user-profile/${userId}` as any)
  }

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: '#000' }} />
  }

  if (!hasPermission) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#000',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 24 }}>
          {t('friend.addFriend.cameraPermission')}
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={{
            backgroundColor: '#0068FF',
            borderRadius: 999,
            paddingHorizontal: 24,
            paddingVertical: 12,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
            {t('friend.addFriend.grantCamera')}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : onScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        enableTorch={torchEnabled}
      />

      <SafeAreaView style={{ flex: 1, justifyContent: 'space-between' }} edges={['top', 'bottom']}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginRight: 8 }}>
            <Ionicons name='close' size={30} color='#fff' />
          </TouchableOpacity>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>
            {t('friend.addFriend.scanQR')}
          </Text>
        </View>

        <View style={{ alignItems: 'center' }}>
          <View style={{ width: 260, height: 260, position: 'relative' }}>
            <View style={cornerStyles.topLeft} />
            <View style={cornerStyles.topRight} />
            <View style={cornerStyles.bottomLeft} />
            <View style={cornerStyles.bottomRight} />
          </View>
          <Text
            style={{
              marginTop: 24,
              color: '#fff',
              fontSize: 14,
              textAlign: 'center',
              backgroundColor: 'rgba(0,0,0,0.45)',
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 999,
            }}
          >
            {t('friend.addFriend.scanHint')}
          </Text>
        </View>

        <View style={{ alignItems: 'center', paddingBottom: 28 }}>
          <TouchableOpacity
            onPress={() => setTorchEnabled((prev) => !prev)}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: torchEnabled ? '#FACC15' : 'rgba(255,255,255,0.14)',
            }}
          >
            <Ionicons name={torchEnabled ? 'flashlight' : 'flashlight-outline'} size={24} color={torchEnabled ? '#111' : '#fff'} />
          </TouchableOpacity>
          <Text style={{ color: '#fff', marginTop: 8, fontSize: 12 }}>
            {torchEnabled ? t('friend.addFriend.flashOff') : t('friend.addFriend.flashOn')}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  )
}

const cornerStyles = StyleSheet.create({
  topLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 34,
    height: 34,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#0068FF',
    borderTopLeftRadius: 14,
  },
  topRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 34,
    height: 34,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#0068FF',
    borderTopRightRadius: 14,
  },
  bottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 34,
    height: 34,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#0068FF',
    borderBottomLeftRadius: 14,
  },
  bottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#0068FF',
    borderBottomRightRadius: 14,
  },
})
