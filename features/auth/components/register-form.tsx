import React, { useState, useCallback, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Pressable
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { isAxiosError } from 'axios'

import { useRegisterMutation } from '../queries'
import { useTheme } from '@/context'
import { changeLanguage, type LanguageCode } from '@/i18n'
import { showCenteredToast } from '@/utils/centered-toast'

const mapRegisterErrorMessage = (rawMessage: string | undefined, status: number | undefined, t: (key: string) => string) => {
  const normalized = (rawMessage || '').toLowerCase()

  if (status === 409 || normalized.includes('already exists') || normalized.includes('duplicate')) {
    return t('auth.register.emailExists')
  }

  if (status === 429 || normalized.includes('too many')) {
    return t('auth.login.tooManyAttempts')
  }

  return t('auth.register.serverError')
}

const RegisterForm: React.FC = () => {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const { mutateAsync: register, isPending } = useRegisterMutation()
  const { isDark, toggleTheme, colors } = useTheme()

  // Form state
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Validation errors
  const [errors, setErrors] = useState<{
    email?: string
    fullName?: string
    password?: string
    confirmPassword?: string
    phoneNumber?: string
  }>({})

  // Refs
  const fullNameRef = useRef<TextInput>(null)
  const phoneRef = useRef<TextInput>(null)
  const passwordRef = useRef<TextInput>(null)
  const confirmPasswordRef = useRef<TextInput>(null)

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: typeof errors = {}

    // Email validation
    if (!email.trim()) {
      newErrors.email = t('auth.validation.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('auth.validation.emailInvalid')
    }

    // Full name validation
    if (!fullName.trim()) {
      newErrors.fullName = t('auth.validation.fullNameRequired')
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = t('auth.validation.fullNameMinLength')
    }

    // Password validation
    if (!password) {
      newErrors.password = t('auth.validation.passwordRequired')
    } else if (password.length < 8) {
      newErrors.password = t('auth.validation.passwordMinLength')
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = t('auth.validation.confirmPasswordRequired')
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.validation.passwordMismatch')
    }

    // Phone number validation (optional but must be valid format if provided)
    if (phoneNumber && !/^[0-9]{10,15}$/.test(phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = t('auth.validation.phoneInvalid')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [email, fullName, password, confirmPassword, phoneNumber, t])

  // Handle register
  const handleRegister = useCallback(async () => {
    if (!validateForm()) return
    if (!agreedToTerms) {
      showCenteredToast({
        type: 'info',
        text1: t('common.warning'),
        text2: t('auth.register.termsRequired', { defaultValue: 'Vui lòng đồng ý điều khoản để tiếp tục' })
      })
      return
    }

    try {
      await register({
        email: email.trim(),
        password,
        confirmPassword,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber ? phoneNumber.replace(/\D/g, '') : undefined
      })
    } catch (error) {
      if (isAxiosError(error)) {
        const responseData = error.response?.data as
          | {
              message?: string
              data?: Record<string, string> | null
            }
          | undefined

        const fieldErrors = responseData?.data
        if (fieldErrors && typeof fieldErrors === 'object') {
          const nextErrors: typeof errors = {}
          if (fieldErrors.email) nextErrors.email = fieldErrors.email
          if (fieldErrors.fullName) nextErrors.fullName = fieldErrors.fullName
          if (fieldErrors.phoneNumber) nextErrors.phoneNumber = fieldErrors.phoneNumber
          if (fieldErrors.password) nextErrors.password = fieldErrors.password
          if (fieldErrors.confirmPassword) nextErrors.confirmPassword = fieldErrors.confirmPassword

          if (Object.keys(nextErrors).length > 0) {
            setErrors((prev) => ({ ...prev, ...nextErrors }))
            return
          }
        }

        const message = responseData?.message
        showCenteredToast({
          type: 'error',
          text1: t('common.error'),
          text2: mapRegisterErrorMessage(message, error.response?.status, t)
        })
      }
    }
  }, [validateForm, register, email, password, confirmPassword, fullName, phoneNumber, agreedToTerms])

  const toggleLanguage = useCallback(async () => {
    const next = (i18n.language === 'vi' ? 'en' : 'vi') as LanguageCode
    await changeLanguage(next)
  }, [i18n.language])

  return (
    <SafeAreaView className='flex-1 bg-background' edges={['top', 'bottom']}>
      <View className='flex-row items-center px-4 pt-3 pb-1'>
        <TouchableOpacity onPress={() => router.back()} className='p-2 -ml-2 mr-auto' activeOpacity={0.7}>
          <Ionicons name='arrow-back' size={24} color={colors.text} />
        </TouchableOpacity>
        <View className='flex-row items-center gap-2'>
          <Pressable onPress={toggleLanguage} className='px-3 py-1.5 rounded-full border border-border bg-card'>
            <Text className='text-foreground text-xs font-medium'>{i18n.language === 'vi' ? 'VI' : 'EN'}</Text>
          </Pressable>
          <Pressable onPress={toggleTheme} className='w-9 h-9 rounded-full border border-border bg-card items-center justify-center'>
            <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={18} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='flex-1'
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          className='flex-1'
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          <View className='items-center pt-2 pb-4'>
            <Text
              className='text-primary'
              style={{
                fontSize: 40,
                fontWeight: '700'
              }}
            >
              BondHub
            </Text>
            <Text className='text-foreground mt-1 text-lg font-semibold'>{t('auth.register.screenTitle')}</Text>
          </View>

          <View className='px-4'>
            {/* Email Input */}
            <View className='mb-4'>
              <Text className='text-foreground text-sm mb-2'>
                {t('auth.register.email')} <Text className='text-red-500'>*</Text>
              </Text>
              <View
                className={`flex-row items-center bg-muted rounded-full px-4 h-12 ${
                  errors.email ? 'border border-red-500' : ''
                }`}
              >
                <Ionicons name='mail-outline' size={20} color={colors.textSecondary} />
                <TextInput
                  placeholder={t('auth.register.emailPlaceholder')}
                  placeholderTextColor={isDark ? '#9AA3B2' : '#9ca3af'}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text)
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                  }}
                  keyboardType='email-address'
                  autoCapitalize='none'
                  autoComplete='email'
                  returnKeyType='next'
                  onSubmitEditing={() => fullNameRef.current?.focus()}
                  className='flex-1 text-base text-foreground ml-3'
                />
              </View>
              {errors.email && <Text className='text-red-500 text-xs mt-1 ml-4'>{errors.email}</Text>}
            </View>

            {/* Full Name Input */}
            <View className='mb-4'>
              <Text className='text-foreground text-sm mb-2'>
                {t('auth.register.fullName')} <Text className='text-red-500'>*</Text>
              </Text>
              <View
                className={`flex-row items-center bg-muted rounded-full px-4 h-12 ${
                  errors.fullName ? 'border border-red-500' : ''
                }`}
              >
                <Ionicons name='person-outline' size={20} color={colors.textSecondary} />
                <TextInput
                  ref={fullNameRef}
                  placeholder={t('auth.register.fullNamePlaceholder')}
                  placeholderTextColor={isDark ? '#9AA3B2' : '#9ca3af'}
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text)
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }))
                  }}
                  autoCapitalize='words'
                  returnKeyType='next'
                  onSubmitEditing={() => phoneRef.current?.focus()}
                  className='flex-1 text-base text-foreground ml-3'
                />
              </View>
              {errors.fullName && <Text className='text-red-500 text-xs mt-1 ml-4'>{errors.fullName}</Text>}
            </View>

            {/* Phone Number Input (Optional) */}
            <View className='mb-4'>
              <Text className='text-foreground text-sm mb-2'>{t('auth.register.phone')}</Text>
              <View
                className={`flex-row items-center bg-muted rounded-full px-4 h-12 ${
                  errors.phoneNumber ? 'border border-red-500' : ''
                }`}
              >
                <Ionicons name='call-outline' size={20} color={colors.textSecondary} />
                <TextInput
                  ref={phoneRef}
                  placeholder={t('auth.register.phonePlaceholder')}
                  placeholderTextColor={isDark ? '#9AA3B2' : '#9ca3af'}
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setPhoneNumber(text)
                    if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: undefined }))
                  }}
                  keyboardType='phone-pad'
                  returnKeyType='next'
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  className='flex-1 text-base text-foreground ml-3'
                />
              </View>
              {errors.phoneNumber && <Text className='text-red-500 text-xs mt-1 ml-4'>{errors.phoneNumber}</Text>}
            </View>

            {/* Password Input */}
            <View className='mb-4'>
              <Text className='text-foreground text-sm mb-2'>
                {t('auth.register.password')} <Text className='text-red-500'>*</Text>
              </Text>
              <View
                className={`flex-row items-center bg-muted rounded-full px-4 h-12 ${
                  errors.password ? 'border border-red-500' : ''
                }`}
              >
                <Ionicons name='lock-closed-outline' size={20} color={colors.textSecondary} />
                <TextInput
                  ref={passwordRef}
                  placeholder={t('auth.register.passwordPlaceholder')}
                  placeholderTextColor={isDark ? '#9AA3B2' : '#9ca3af'}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text)
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                  }}
                  secureTextEntry={!showPassword}
                  returnKeyType='next'
                  onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                  className='flex-1 text-base text-foreground ml-3'
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className='pl-2'>
                  <Text className='text-muted-foreground text-sm'>
                    {showPassword ? t('auth.login.hide') : t('auth.login.show')}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.password && <Text className='text-red-500 text-xs mt-1 ml-4'>{errors.password}</Text>}
            </View>

            {/* Confirm Password Input */}
            <View className='mb-4'>
              <Text className='text-foreground text-sm mb-2'>
                {t('auth.register.confirmPassword')} <Text className='text-red-500'>*</Text>
              </Text>
              <View
                className={`flex-row items-center bg-muted rounded-full px-4 h-12 ${
                  errors.confirmPassword ? 'border border-red-500' : ''
                }`}
              >
                <Ionicons name='lock-closed-outline' size={20} color={colors.textSecondary} />
                <TextInput
                  ref={confirmPasswordRef}
                  placeholder={t('auth.register.confirmPasswordPlaceholder')}
                  placeholderTextColor={isDark ? '#9AA3B2' : '#9ca3af'}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text)
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                  }}
                  secureTextEntry={!showConfirmPassword}
                  returnKeyType='done'
                  onSubmitEditing={handleRegister}
                  className='flex-1 text-base text-foreground ml-3'
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className='pl-2'>
                  <Text className='text-muted-foreground text-sm'>
                    {showConfirmPassword ? t('auth.login.hide') : t('auth.login.show')}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text className='text-red-500 text-xs mt-1 ml-4'>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Terms Agreement */}
            <TouchableOpacity
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              className='flex-row items-start mb-6'
              activeOpacity={0.7}
            >
              <View
                className={`w-5 h-5 rounded border-2 items-center justify-center mt-0.5 ${
                  agreedToTerms ? 'bg-primary border-primary' : 'border-muted-foreground'
                }`}
              >
                {agreedToTerms && <Ionicons name='checkmark' size={14} color='white' />}
              </View>
              <Text className='flex-1 text-muted-foreground text-sm ml-3 leading-5'>
                {t('auth.register.terms')} <Text className='text-primary'>{t('auth.register.termsOfService')}</Text>{' '}
                {t('auth.register.and')} <Text className='text-primary'>{t('auth.register.privacyPolicy')}</Text>{' '}
                {t('auth.register.ofZalo')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Bottom Section */}
      <View className='px-4 pb-4 pt-2 bg-background border-t border-border'>
        {/* Register Button */}
        <TouchableOpacity
          onPress={handleRegister}
          disabled={isPending || !agreedToTerms}
          className={`h-12 rounded-full justify-center items-center mb-3 ${
            isPending || !agreedToTerms ? 'bg-muted-foreground/40' : 'bg-primary'
          }`}
          activeOpacity={0.8}
        >
          {isPending ? (
            <ActivityIndicator color='white' />
          ) : (
            <Text className='text-white font-bold text-base'>{t('auth.register.registerButton')}</Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <View className='flex-row justify-center items-center'>
          <Text className='text-muted-foreground text-sm'>{t('auth.register.hasAccount')}</Text>
          <TouchableOpacity onPress={() => router.push('/auth/login' as any)}>
            <Text className='text-primary text-sm font-semibold ml-1'>{t('auth.register.login')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default RegisterForm
