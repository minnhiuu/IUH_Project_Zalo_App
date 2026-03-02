import React, { useState, useEffect, useRef } from 'react'
import { Alert, StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useQrScanMutation } from '@/features/auth/queries/use-mutations'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'

export default function QrScanScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [torch, setTorch] = useState(false)
  const isProcessingRef = useRef(false) // Prevent multiple scans immediately

  const scanMutation = useQrScanMutation()

  useEffect(() => {
    if (!permission) {
      requestPermission()
    }
  }, [permission, requestPermission])

  const processQrData = (data: string) => {
    // Double check with ref to prevent multiple scans
    if (scanned || isProcessingRef.current) {
      console.log('[QR Scanner] Already processing, ignoring...')
      return
    }

    console.log('[QR Scanner] Raw QR data:', data)

    // Set both state and ref immediately
    setScanned(true)
    isProcessingRef.current = true

    // Extract qrId from deep link format: bondhub://qr/{qrId}
    let qrId = data
    if (data.startsWith('bondhub://qr/')) {
      qrId = data.replace('bondhub://qr/', '')
    } else if (data.startsWith('http://') || data.startsWith('https://')) {
      // Handle web URL format if needed
      const match = data.match(/\/qr\/([a-zA-Z0-9-]+)/)
      if (match) qrId = match[1]
    }

    console.log('[QR Scanner] Extracted qrId:', qrId)

    // Notify backend that QR is scanned
    scanMutation.mutate(
      { qrContent: qrId },
      {
        onSuccess: () => {
          console.log('[QR Scanner] Scan successful, navigating to confirm')
          router.replace({
            pathname: '/qr/confirm',
            params: {
              qrContent: qrId,
              expiresAt: ''
            }
          })
        },
        onError: (error: any) => {
          console.error('[QR Scanner] Scan error:', error)
          console.error('[QR Scanner] Error response:', error?.response?.data)

          const errorMessage = error?.response?.data?.message || ''
          const errorCode = error?.response?.data?.code || ''

          let alertTitle = t('common.error')
          let alertMessage = t('auth.qrScanner.invalidQr')

          if (
            errorCode === 'AUTH_005' ||
            errorMessage.toLowerCase().includes('expired') ||
            errorMessage.toLowerCase().includes('hết hạn')
          ) {
            alertTitle = t('auth.qrScanner.expired')
            alertMessage = t('auth.qrScanner.expiredError')
          }

          Alert.alert(alertTitle, `${alertMessage}\n\nError: ${errorMessage || errorCode}`, [
            {
              text: 'OK',
              onPress: () => {
                // Wait 2 seconds before allowing next scan
                setTimeout(() => {
                  setScanned(false)
                  isProcessingRef.current = false
                }, 2000)
              }
            }
          ])
        }
      }
    )
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    processQrData(data)
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1
    })

    if (!result.canceled && result.assets[0].uri) {
      Alert.alert('Thông báo', 'Tính năng quét từ ảnh đang được cập nhật')
    }
  }

  if (!permission) return <View style={{ flex: 1, backgroundColor: 'black' }} />
  if (!permission.granted) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'black',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 40
        }}
      >
        <Text
          style={{
            color: 'white',
            textAlign: 'center',
            marginBottom: 40,
            fontSize: 18
          }}
        >
          {t('auth.qrScanner.permissionMessage')}
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={{
            backgroundColor: '#0068FF',
            paddingVertical: 16,
            paddingHorizontal: 40,
            borderRadius: 100
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Cấp quyền máy ảnh</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      <SafeAreaView style={{ flex: 1, justifyContent: 'space-between' }} edges={['top', 'bottom']}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 8
          }}
        >
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
            <Ionicons name='close' size={30} color='white' />
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Quét mã QR</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Scan Area Container */}
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 256, height: 256, position: 'relative' }}>
            {/* Corners */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 32,
                height: 32,
                borderTopWidth: 4,
                borderLeftWidth: 4,
                borderColor: '#0068FF',
                borderTopLeftRadius: 16
              }}
            />
            <View
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 32,
                height: 32,
                borderTopWidth: 4,
                borderRightWidth: 4,
                borderColor: '#0068FF',
                borderTopRightRadius: 16
              }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: 32,
                height: 32,
                borderBottomWidth: 4,
                borderLeftWidth: 4,
                borderColor: '#0068FF',
                borderBottomLeftRadius: 16
              }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 32,
                height: 32,
                borderBottomWidth: 4,
                borderRightWidth: 4,
                borderColor: '#0068FF',
                borderBottomRightRadius: 16
              }}
            />
          </View>

          <View
            style={{
              marginTop: 40,
              backgroundColor: 'rgba(0,0,0,0.4)',
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 100
            }}
          >
            <Text style={{ color: 'white', fontSize: 14, textAlign: 'center' }}>
              Hướng camera về phía mã QR để quét
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            paddingBottom: 48
          }}
        >
          <TouchableOpacity style={{ alignItems: 'center', width: 96 }} onPress={pickImage}>
            <View
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                width: 56,
                height: 56,
                borderRadius: 28,
                marginBottom: 8,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons name='image-outline' size={26} color='white' />
            </View>
            <Text style={{ color: 'white', fontSize: 12 }}>Chọn ảnh</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ alignItems: 'center', width: 96 }} onPress={() => setTorch(!torch)}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                marginBottom: 8,
                backgroundColor: torch ? '#FACC15' : 'rgba(255,255,255,0.1)',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons
                name={torch ? 'flashlight' : 'flashlight-outline'}
                size={26}
                color={torch ? 'black' : 'white'}
              />
            </View>
            <Text style={{ color: 'white', fontSize: 12 }}>{torch ? 'Tắt đèn' : 'Bật đèn'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  )
}
