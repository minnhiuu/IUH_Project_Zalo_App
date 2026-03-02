import React, { useState, useEffect } from 'react'
import { ScrollView, Text as RNText, TouchableOpacity, View, Modal as RNModal, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useQrAcceptMutation, useQrRejectMutation } from '@/features/auth/queries/use-mutations'
import { useWaitQrStatusQuery } from '@/features/auth/queries/use-queries'
import { QrSessionStatus } from '@/features/auth/schemas'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Text } from '@/components/ui'
import { SEMANTIC } from '@/constants/theme'

export default function QrConfirmScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const qrContent = params.qrContent as string
  const expiresAt = params.expiresAt as string

  const qrId = qrContent

  const [isChecked, setIsChecked] = useState(false)
  const [showCountdown, setShowCountdown] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [isExpired, setIsExpired] = useState(false)

  const acceptMutation = useQrAcceptMutation()
  const rejectMutation = useQrRejectMutation()

  const { data: statusData, refetch: refetchStatus } = useWaitQrStatusQuery(
    qrId,
    QrSessionStatus.Confirmed,
    !!qrId && !isExpired && !showCountdown
  )

  useEffect(() => {
    if (!statusData || isExpired) return
    if (statusData.status === QrSessionStatus.Rejected) {
      router.back()
    } else if (statusData.status === QrSessionStatus.Scanned) {
      refetchStatus()
    }
  }, [statusData, router, isExpired, refetchStatus])

  useEffect(() => {
    if (!expiresAt) return
    const expiryTime = new Date(expiresAt).getTime()
    const checkExpiry = () => {
      const now = new Date().getTime()
      if (now >= expiryTime) {
        setIsExpired(true)
        return true
      }
      return false
    }
    if (checkExpiry()) return
    const timer = setInterval(() => {
      if (checkExpiry()) clearInterval(timer)
    }, 1000)
    return () => clearInterval(timer)
  }, [expiresAt])

  useEffect(() => {
    let timer: any
    if (showCountdown && countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [showCountdown, countdown])

  const handleStartLoginFlow = () => {
    if (!isChecked) return
    setShowCountdown(true)
    setCountdown(5)
  }

  const handleConfirmLogin = () => {
    if (countdown > 0) return
    acceptMutation.mutate(
      { qrContent: qrContent },
      {
        onSuccess: () => {
          setShowCountdown(false)
          router.dismiss()
          router.navigate({
            pathname: '/(tabs)' as any,
            params: { qrLoginSuccess: 'true' }
          })
        },
        onError: (error: any) => {
          setShowCountdown(false)
          setCountdown(5)
          if (error?.response?.data?.code === 'AUTH_005') setIsExpired(true)
        }
      }
    )
  }

  const handleReject = () => {
    rejectMutation.mutate(
      { qrContent: qrContent },
      {
        onSettled: () => router.back()
      }
    )
  }

  const browserInfo = 'Chrome - Windows 11'
  const currentTime = new Date().toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
  const location = 'Hồ Chí Minh, Việt Nam'

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top', 'bottom']}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header spacer */}
        <View style={{ height: 56, justifyContent: 'center', paddingHorizontal: 16 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name='arrow-back' size={24} color='black' />
          </TouchableOpacity>
        </View>

        {/* Monitor Icon Section */}
        <View style={{ marginTop: 16, alignItems: 'center' }}>
          <View
            style={{
              width: 208,
              height: 160,
              backgroundColor: '#F8F9FA',
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            <View
              style={{
                width: 144,
                height: 96,
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#E9EAED',
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  borderWidth: 1,
                  borderColor: '#E9EAED',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Ionicons name='globe-outline' size={28} color='#D12323' />
              </View>
              {/* Stand */}
              <View
                style={{
                  position: 'absolute',
                  bottom: -16,
                  width: 32,
                  height: 16,
                  backgroundColor: '#E9EAED',
                  borderRadius: 4
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: -20,
                  width: 64,
                  height: 4,
                  backgroundColor: '#D1D3D6',
                  borderRadius: 100
                }}
              />
            </View>
            {/* Alert Badge */}
            <View
              style={{
                position: 'absolute',
                top: 8,
                right: 16,
                backgroundColor: '#D12323',
                width: 28,
                height: 28,
                borderRadius: 14,
                borderWidth: 2,
                borderColor: '#F8F9FA',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons name='warning' size={14} color='white' />
            </View>
          </View>
        </View>

        {/* Title */}
        <View style={{ paddingHorizontal: 40, marginTop: 32 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              textAlign: 'center',
              color: '#0F172A',
              lineHeight: 28
            }}
          >
            Đăng nhập Zalo Web bằng mã QR trên thiết bị lạ?
          </Text>
        </View>

        {/* Security Warning Box */}
        <View
          style={{
            marginHorizontal: 24,
            marginTop: 24,
            padding: 16,
            backgroundColor: '#FFEBEB',
            borderRadius: 8
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: '#334155',
              lineHeight: 20,
              marginBottom: 12
            }}
          >
            Tài khoản có thể bị chiếm đoạt nếu đây không phải thiết bị của bạn.
          </Text>
          <Text style={{ fontSize: 14, color: '#334155', lineHeight: 20 }}>
            Bấm <Text style={{ fontWeight: 'bold' }}>Từ chối</Text> nếu ai đó yêu cầu bạn đăng nhập bằng mã QR để bình
            chọn, trúng thưởng, nhận khuyến mãi,...
          </Text>
        </View>

        {/* Details Section */}
        <View style={{ paddingHorizontal: 24, marginTop: 32, gap: 12 }}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ fontSize: 14, color: '#64748B', width: 112 }}>Trình duyệt:</Text>
            <Text
              style={{
                fontSize: 14,
                color: '#0F172A',
                fontWeight: 'bold',
                flex: 1
              }}
            >
              {browserInfo}
            </Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ fontSize: 14, color: '#64748B', width: 112 }}>Thời gian:</Text>
            <Text
              style={{
                fontSize: 14,
                color: '#0F172A',
                fontWeight: 'bold',
                flex: 1
              }}
            >
              {currentTime}
            </Text>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Text style={{ fontSize: 14, color: '#64748B', width: 112 }}>Địa điểm:</Text>
            <Text
              style={{
                fontSize: 14,
                color: '#0F172A',
                fontWeight: 'bold',
                flex: 1
              }}
            >
              {location}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: 24,
          backgroundColor: 'white',
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: SEMANTIC.border
        }}
      >
        <Pressable
          onPress={() => setIsChecked(!isChecked)}
          style={{ flexDirection: 'row', marginBottom: 24, marginTop: 8 }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderWidth: 2,
              borderColor: isChecked ? '#0068FF' : '#D1D5DB',
              borderRadius: 4,
              marginRight: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isChecked ? '#0068FF' : 'transparent'
            }}
          >
            {isChecked && <Ionicons name='checkmark' size={12} color='white' />}
          </View>
          <Text style={{ color: '#334155', fontSize: 14, lineHeight: 20, flex: 1 }}>
            Tôi đã kiểm tra kỹ thông tin và xác nhận đây là thiết bị của tôi
          </Text>
        </Pressable>

        {/* Action Buttons */}
        <View style={{ gap: 8 }}>
          <Button
            onPress={handleStartLoginFlow}
            disabled={!isChecked}
            variant={isChecked ? 'primary' : 'secondary'}
            className="h-14 rounded-full"
          >
            <Text bold={true} className={isChecked ? 'text-white' : 'text-muted'}>
              Đăng nhập
            </Text>
          </Button>

          <Button onPress={handleReject} variant="secondary" className="h-14 rounded-full">
            <Text bold={true} className="text-foreground">
              Từ chối
            </Text>
          </Button>
        </View>
      </View>

      {/* Confirmation Modal */}
      <RNModal visible={showCountdown} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              backgroundColor: 'white',
              padding: 24,
              borderRadius: 16,
              maxWidth: 340,
              width: '90%'
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 12 }}>
              Đăng nhập trên thiết bị lạ?
            </Text>
            <Text style={{ fontSize: 14, color: '#64748B', lineHeight: 24, marginBottom: 32 }}>
              Bạn hãy luôn thận trọng khi đăng nhập bằng mã QR để tránh bị chiếm đoạt tài khoản
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 24 }}>
              <TouchableOpacity onPress={() => setShowCountdown(false)}>
                <Text style={{ fontWeight: 'bold', color: '#0F172A' }}>Quay lại</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmLogin} disabled={countdown > 0 || acceptMutation.isPending}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    color: countdown > 0 ? '#94A3B8' : '#0068FF'
                  }}
                >
                  Đăng nhập {countdown > 0 ? `(${countdown})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </RNModal>

      {/* Expiration Modal */}
      <RNModal visible={isExpired} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              backgroundColor: 'white',
              padding: 32,
              borderRadius: 16,
              alignItems: 'center',
              width: '90%',
              maxWidth: 340
            }}
          >
            <View
              style={{
                backgroundColor: '#FFEBEB',
                padding: 16,
                borderRadius: 24,
                marginBottom: 16
              }}
            >
              <Ionicons name='time-outline' size={48} color='#D12323' />
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#0F172A',
                marginBottom: 8,
                textAlign: 'center'
              }}
            >
              Mã QR hết hạn
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#64748B',
                marginBottom: 32,
                textAlign: 'center',
                lineHeight: 20
              }}
            >
              Mã QR đã hết hạn, vui lòng tải lại mã mới trên thiết bị của bạn.
            </Text>
            <Button onPress={() => router.back()} variant="primary" className="w-full h-12 rounded-xl">
              <Text bold={true} className="text-white">
                Quay lại
              </Text>
            </Button>
          </View>
        </View>
      </RNModal>
    </SafeAreaView>
  )
}
