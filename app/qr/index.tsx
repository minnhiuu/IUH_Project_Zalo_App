import React, { useState, useEffect, useRef } from 'react'
import { Alert, StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useQrScanMutation } from '@/features/auth/queries/use-mutations'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { Box, VStack, HStack, Center } from '@gluestack-ui/themed'

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
    <Box flex={1} bg='$black'>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      <SafeAreaView style={{ flex: 1, justifyContent: 'space-between' }} edges={['top', 'bottom']}>
        {/* Header */}
        <HStack alignItems='center' justifyContent='space-between' px='$4' py='$2'>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
            <Ionicons name='close' size={30} color='white' />
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>Quét mã QR</Text>
          <View style={{ width: 40 }} />
        </HStack>

        {/* Scan Area Container */}
        <VStack alignItems='center' justifyContent='center'>
          <Box width={256} height={256} position='relative'>
            {/* Corners */}
            <Box
              position='absolute'
              top={0}
              left={0}
              width='$8'
              height='$8'
              borderTopWidth={4}
              borderLeftWidth={4}
              borderColor='$primary600'
              borderTopLeftRadius='$2xl'
            />
            <Box
              position='absolute'
              top={0}
              right={0}
              width='$8'
              height='$8'
              borderTopWidth={4}
              borderRightWidth={4}
              borderColor='$primary600'
              borderTopRightRadius='$2xl'
            />
            <Box
              position='absolute'
              bottom={0}
              left={0}
              width='$8'
              height='$8'
              borderBottomWidth={4}
              borderLeftWidth={4}
              borderColor='$primary600'
              borderBottomLeftRadius='$2xl'
            />
            <Box
              position='absolute'
              bottom={0}
              right={0}
              width='$8'
              height='$8'
              borderBottomWidth={4}
              borderRightWidth={4}
              borderColor='$primary600'
              borderBottomRightRadius='$2xl'
            />
          </Box>

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
        </VStack>

        {/* Footer */}
        <HStack justifyContent='space-around' alignItems='center' pb='$12'>
          <TouchableOpacity style={{ alignItems: 'center', width: 96 }} onPress={pickImage}>
            <Center bg='rgba(255,255,255,0.1)' width={56} height={56} rounded='$full' mb='$2'>
              <Ionicons name='image-outline' size={26} color='white' />
            </Center>
            <Text style={{ color: 'white', fontSize: 12 }}>Chọn ảnh</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ alignItems: 'center', width: 96 }} onPress={() => setTorch(!torch)}>
            <Center width={56} height={56} rounded='$full' mb='$2' bg={torch ? '$yellow400' : 'rgba(255,255,255,0.1)'}>
              <Ionicons
                name={torch ? 'flashlight' : 'flashlight-outline'}
                size={26}
                color={torch ? 'black' : 'white'}
              />
            </Center>
            <Text style={{ color: 'white', fontSize: 12 }}>{torch ? 'Tắt đèn' : 'Bật đèn'}</Text>
          </TouchableOpacity>
        </HStack>
      </SafeAreaView>
    </Box>
  )
}
