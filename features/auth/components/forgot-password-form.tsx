import { useState, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Input } from '@/components/ui'
import { Button } from '@/components/ui'
import { forgotPasswordRequestSchema, resetPasswordRequestSchema } from '../schemas/auth.schema'
import { useForgotPasswordMutation, useResetPasswordMutation } from '../queries/use-mutations'

type Step = 'REQUEST' | 'RESET'

export function ForgotPasswordForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('REQUEST')
  const [email, setEmail] = useState('')
  const otpInputRef = useRef<TextInput>(null)

  // Request step state
  const [requestEmail, setRequestEmail] = useState('')
  const [requestEmailError, setRequestEmailError] = useState('')

  // Reset step state
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otpError, setOtpError] = useState('')
  const [newPasswordError, setNewPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const forgotPasswordMutation = useForgotPasswordMutation()
  const resetPasswordMutation = useResetPasswordMutation()

  const validateRequestForm = (): boolean => {
    try {
      forgotPasswordRequestSchema.parse({ email: requestEmail })
      setRequestEmailError('')
      return true
    } catch (error: any) {
      const zodError = error.errors?.[0]
      setRequestEmailError(zodError?.message || 'Email không hợp lệ')
      return false
    }
  }

  const validateResetForm = (): boolean => {
    try {
      resetPasswordRequestSchema.parse({
        email,
        otp,
        newPassword,
        confirmPassword
      })
      setOtpError('')
      setNewPasswordError('')
      setConfirmPasswordError('')
      return true
    } catch (error: any) {
      const errors = error.errors || []
      errors.forEach((err: any) => {
        const path = err.path[0]
        if (path === 'otp') setOtpError(err.message)
        if (path === 'newPassword') setNewPasswordError(err.message)
        if (path === 'confirmPassword') setConfirmPasswordError(err.message)
      })
      return false
    }
  }

  const handleRequest = async () => {
    if (!validateRequestForm()) return

    try {
      await forgotPasswordMutation.mutateAsync({ email: requestEmail })
      setEmail(requestEmail)
      setStep('RESET')
    } catch (error) {
      // Error handled by mutation
    }
  }

  const handleReset = async () => {
    if (!validateResetForm()) return

    try {
      await resetPasswordMutation.mutateAsync({
        email,
        otp,
        newPassword,
        confirmPassword
      })
      // Navigation handled by mutation
    } catch (error) {
      // Error handled by mutation
    }
  }

  const isRequestStep = step === 'REQUEST'

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>BondHub</Text>
          <Text style={styles.instruction}>
            {isRequestStep
              ? 'Khôi phục mật khẩu BondHub\nđể kết nối với ứng dụng BondHub Web'
              : `Thiết lập mật khẩu mới cho tài khoản\n${email}`}
          </Text>
        </View>

        {/* Form */}
        {isRequestStep ? (
          <View style={styles.form}>
            <Input
              placeholder='Email'
              value={requestEmail}
              onChangeText={(text) => {
                setRequestEmail(text)
                setRequestEmailError('')
              }}
              error={requestEmailError}
              keyboardType='email-address'
              autoCapitalize='none'
              leftIcon={<MaterialCommunityIcons name='email-outline' size={20} color='#666' />}
            />

            <Button
              onPress={handleRequest}
              style={styles.submitButton}
              disabled={!requestEmail || forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending ? (
                <ActivityIndicator color='#fff' />
              ) : (
                <Text style={styles.buttonText}>Tiếp tục</Text>
              )}
            </Button>
          </View>
        ) : (
          <View style={styles.form}>
            {/* OTP Input */}
            <View style={styles.otpSection}>
              <View style={styles.otpHeader}>
                <MaterialCommunityIcons name='key-outline' size={16} color='#999' />
                <Text style={styles.otpLabel}>Nhập mã kích hoạt</Text>
              </View>
              <TouchableOpacity style={styles.otpBoxes} activeOpacity={1} onPress={() => otpInputRef.current?.focus()}>
                {[0, 1, 2, 3, 4, 5].map((index) => {
                  const isActive = index === otp.length
                  return (
                    <View key={index} style={[styles.otpBox, isActive && styles.otpBoxActive]}>
                      <Text style={styles.otpBoxText}>{otp[index] || ''}</Text>
                    </View>
                  )
                })}
              </TouchableOpacity>
              <TextInput
                ref={otpInputRef}
                value={otp}
                onChangeText={(text) => {
                  setOtp(text.replace(/\D/g, '').slice(0, 6))
                  setOtpError('')
                }}
                keyboardType='number-pad'
                maxLength={6}
                style={styles.hiddenInput}
                autoFocus
              />
              {otpError && <Text style={styles.errorText}>{otpError}</Text>}
            </View>

            {/* New Password */}
            <Input
              placeholder='Vui lòng nhập mật khẩu'
              value={newPassword}
              onChangeText={(text) => {
                setNewPassword(text)
                setNewPasswordError('')
              }}
              error={newPasswordError}
              secureTextEntry={!showPassword}
              leftIcon={<MaterialCommunityIcons name='lock-outline' size={20} color='#666' />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color='#666'
                  />
                </TouchableOpacity>
              }
            />

            {/* Confirm Password */}
            <Input
              placeholder='Nhập lại mật khẩu'
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text)
                setConfirmPasswordError('')
              }}
              error={confirmPasswordError}
              secureTextEntry={!showConfirmPassword}
              leftIcon={<MaterialCommunityIcons name='lock-outline' size={20} color='#666' />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <MaterialCommunityIcons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color='#666'
                  />
                </TouchableOpacity>
              }
            />

            <Button
              onPress={handleReset}
              style={styles.submitButton}
              disabled={!otp || !newPassword || !confirmPassword || resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? (
                <ActivityIndicator color='#fff' />
              ) : (
                <Text style={styles.buttonText}>Xác nhận</Text>
              )}
            </Button>
          </View>
        )}

        {/* Back button */}
        <TouchableOpacity
          onPress={() => {
            if (isRequestStep) {
              router.back()
            } else {
              setStep('REQUEST')
              setOtp('')
              setNewPassword('')
              setConfirmPassword('')
              setOtpError('')
              setNewPasswordError('')
              setConfirmPasswordError('')
            }
          }}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name='chevron-left' size={18} color='#0068FF' />
          <Text style={styles.backText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 20
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4
  },
  header: {
    alignItems: 'center',
    marginBottom: 32
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0068FF',
    marginBottom: 16
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20
  },
  form: {
    gap: 16
  },
  otpSection: {
    marginBottom: 8
  },
  otpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12
  },
  otpLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666'
  },
  otpInput: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 8
  },
  submitButton: {
    marginTop: 8
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 8
  },
  backText: {
    fontSize: 14,
    color: '#0068FF',
    fontWeight: '500'
  },
  otpBoxes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16
  },
  otpBox: {
    width: 42,
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  otpBoxActive: {
    borderColor: '#0068FF',
    borderWidth: 2
  },
  otpBoxText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a'
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center'
  }
})
