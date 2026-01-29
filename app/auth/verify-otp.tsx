import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import * as Application from 'expo-application'
import { useRegisterVerifyMutation } from '@/features/auth'

const OTP_LENGTH = 6

export default function VerifyOTPScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { email, expiresIn } = useLocalSearchParams<{ email: string; expiresIn: string }>()

  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(''))
  const [countdown, setCountdown] = useState(parseInt(expiresIn) || 180) // 3 minutes default
  const inputRefs = useRef<TextInput[]>([])

  const registerVerifyMutation = useRegisterVerifyMutation()

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  // Format countdown as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Handle OTP input
  const handleOtpChange = (text: string, index: number) => {
    // Only allow digits
    const digit = text.replace(/[^0-9]/g, '')

    if (digit.length <= 1) {
      const newOtp = [...otp]
      newOtp[index] = digit
      setOtp(newOtp)

      // Auto focus next input
      if (digit && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus()
      }

      // Auto submit when all digits are entered
      if (digit && index === OTP_LENGTH - 1) {
        const fullOtp = newOtp.join('')
        if (fullOtp.length === OTP_LENGTH) {
          handleVerify(fullOtp)
        }
      }
    }
  }

  // Handle backspace
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // Verify OTP
  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('')

    if (code.length !== OTP_LENGTH) {
      Alert.alert(t('common.error'), t('auth.validation.otpInvalid'))
      return
    }

    if (!email) {
      Alert.alert(t('common.error'), 'Email not found')
      return
    }

    // Get device ID based on platform
    let deviceId = 'device-' + Date.now()
    try {
      if (Platform.OS === 'ios') {
        const iosId = await Application.getIosIdForVendorAsync()
        deviceId = iosId || 'ios-' + Date.now()
      } else {
        // Only call getAndroidId on Android
        const androidModule = Application as any
        if (typeof androidModule.getAndroidId === 'function') {
          deviceId = androidModule.getAndroidId() || 'android-' + Date.now()
        }
      }
    } catch (error) {
      console.warn('Failed to get device ID:', error)
      deviceId = `${Platform.OS}-${Date.now()}`
    }

    // Backend only accepts WEB or MOBILE, not IOS/ANDROID
    const deviceType = 'MOBILE'

    console.log('Verify OTP payload:', { email, otp: code, deviceId, deviceType })

    registerVerifyMutation.mutate({
      email,
      otp: code,
      deviceId,
      deviceType
    })
  }

  // Resend OTP
  const handleResend = () => {
    if (countdown > 0) return

    // TODO: Call resend OTP API
    Alert.alert(t('common.success'), t('auth.register.otpSent'))
    setCountdown(180)
    setOtp(new Array(OTP_LENGTH).fill(''))
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name='arrow-back' size={24} color='#333' />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('auth.otp.title')}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name='mail-outline' size={60} color='#0068FF' />
          </View>

          <Text style={styles.title}>{t('auth.otp.verifyEmail')}</Text>
          <Text style={styles.subtitle}>
            {t('auth.otp.enterCode')} <Text style={styles.email}>{email}</Text>
          </Text>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  if (ref) inputRefs.current[index] = ref
                }}
                style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType='number-pad'
                maxLength={1}
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
          </View>

          {/* Countdown */}
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>
              {countdown > 0 ? `${t('auth.otp.resendIn')} ${formatTime(countdown)}` : t('auth.otp.codeExpired')}
            </Text>
          </View>

          {/* Resend Button */}
          <TouchableOpacity
            style={[styles.resendButton, countdown > 0 && styles.resendButtonDisabled]}
            onPress={handleResend}
            disabled={countdown > 0}
          >
            <Text style={[styles.resendText, countdown > 0 && styles.resendTextDisabled]}>{t('auth.otp.resend')}</Text>
          </TouchableOpacity>

          {/* Verify Button */}
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (otp.join('').length !== OTP_LENGTH || registerVerifyMutation.isPending) && styles.verifyButtonDisabled
            ]}
            onPress={() => handleVerify()}
            disabled={otp.join('').length !== OTP_LENGTH || registerVerifyMutation.isPending}
          >
            {registerVerifyMutation.isPending ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <Text style={styles.verifyButtonText}>{t('auth.otp.verify')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  keyboardView: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5'
  },
  backButton: {
    padding: 8
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center'
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F0FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20
  },
  email: {
    fontWeight: '600',
    color: '#0068FF'
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: '#F5F5F5'
  },
  otpInputFilled: {
    borderColor: '#0068FF',
    backgroundColor: '#E8F0FE'
  },
  timerContainer: {
    marginBottom: 16
  },
  timerText: {
    fontSize: 14,
    color: '#666'
  },
  resendButton: {
    paddingVertical: 12,
    marginBottom: 24
  },
  resendButtonDisabled: {
    opacity: 0.5
  },
  resendText: {
    fontSize: 16,
    color: '#0068FF',
    fontWeight: '600'
  },
  resendTextDisabled: {
    color: '#999'
  },
  verifyButton: {
    width: '100%',
    backgroundColor: '#0068FF',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 30
  },
  verifyButtonDisabled: {
    backgroundColor: '#A0C4FF'
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
})
