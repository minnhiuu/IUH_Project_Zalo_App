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
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Application from 'expo-application'
import { isAxiosError } from 'axios'

import { useLoginMutation } from '../queries'
import { secureStorage } from '@/utils/storageUtils'
import { useTheme } from '@/context'
import { changeLanguage, type LanguageCode } from '@/i18n'
import { showCenteredToast } from '@/utils/centered-toast'

const mapLoginErrorMessage = (rawMessage: string | undefined, status: number | undefined, t: (key: string) => string) => {
  const normalized = (rawMessage || '').toLowerCase()

  if (status === 401 || normalized.includes('invalid credentials') || normalized.includes('bad credentials')) {
    return t('auth.errors.invalidCredentials')
  }

  if (status === 423 || normalized.includes('locked')) {
    return t('auth.errors.accountLocked')
  }

  if (status === 429 || normalized.includes('too many')) {
    return t('auth.errors.tooManyAttempts')
  }

  return t('auth.errors.serverError')
}

const LoginForm: React.FC = () => {
  const { t, i18n } = useTranslation()
  const router = useRouter()
  const { mutateAsync: login, isPending } = useLoginMutation()
  const { isDark, toggleTheme, colors } = useTheme()

  // Form state
  const [activeTab, setActiveTab] = useState<'email' | 'qr'>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Validation errors
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
  }>({})

  // Refs
  const passwordRef = useRef<TextInput>(null)

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: typeof errors = {}

    if (!email.trim()) {
      newErrors.email = t('auth.validation.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('auth.validation.emailInvalid')
    }

    if (!password.trim()) {
      newErrors.password = t('auth.validation.passwordRequired')
    } else if (password.length < 6) {
      newErrors.password = t('auth.validation.passwordMinLength')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [email, password, t])

  // Handle login
  const handleLogin = useCallback(async () => {
    if (!validateForm()) return

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
          deviceId = (await androidModule.getAndroidId()) || 'android-' + Date.now()
        }
      }
    } catch (error) {
      console.warn('Failed to get device ID:', error)
      deviceId = `${Platform.OS}-${Date.now()}`
    }

    // Save deviceId for token refresh later
    await secureStorage.setDeviceId(deviceId)

    try {
      await login({
        email: email.trim(),
        password,
        deviceId,
        deviceType: 'MOBILE' // Backend only accepts WEB or MOBILE
      })
    } catch (error) {
      const axiosMessage = isAxiosError(error) ? (error.response?.data?.message as string | undefined) : undefined
      const axiosStatus = isAxiosError(error) ? error.response?.status : undefined
      const message = mapLoginErrorMessage(axiosMessage, axiosStatus, t)

      showCenteredToast({
        type: 'error',
        text1: t('common.error'),
        text2: message
      })
    }
  }, [validateForm, login, email, password, t])

  // Handle login without password (OTP)
  const handleLoginWithoutPassword = useCallback(() => {
    if (!email.trim()) {
      setErrors({ email: t('auth.validation.emailRequired') })
      return
    }

    showCenteredToast({
      type: 'info',
      text1: t('auth.login.otpSent'),
      text2: t('auth.login.checkPhone')
    })
  }, [email, t])

  const toggleLanguage = useCallback(async () => {
    const next = (i18n.language === 'vi' ? 'en' : 'vi') as LanguageCode
    await changeLanguage(next)
  }, [i18n.language])

  // Render Email Tab Content
  const renderEmailTab = () => (
    <View className='flex-1 px-4'>
      {/* Email Input */}
      <View className='mb-3'>
        <View
          className={`flex-row items-center bg-muted rounded-full px-4 h-12 ${
            errors.email ? 'border border-red-500' : ''
          }`}
        >
          <Ionicons name='mail-outline' size={20} color={colors.textSecondary} />
          <TextInput
            placeholder={t('auth.login.emailPlaceholder')}
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
            onSubmitEditing={() => passwordRef.current?.focus()}
            className='flex-1 text-base text-foreground ml-3'
          />
        </View>
        {errors.email && <Text className='text-red-500 text-xs mt-1 ml-4'>{errors.email}</Text>}
      </View>

      {/* Password Input */}
      <View className='mb-6'>
        <View
          className={`flex-row items-center bg-muted rounded-full px-4 h-12 ${
            errors.password ? 'border border-red-500' : ''
          }`}
        >
          <Ionicons name='lock-closed-outline' size={20} color={colors.textSecondary} />
          <TextInput
            ref={passwordRef}
            placeholder={t('auth.login.passwordPlaceholder')}
            placeholderTextColor={isDark ? '#9AA3B2' : '#9ca3af'}
            value={password}
            onChangeText={(text) => {
              setPassword(text)
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
            }}
            secureTextEntry={!showPassword}
            returnKeyType='done'
            onSubmitEditing={handleLogin}
            className='flex-1 text-base text-foreground ml-3'
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className='pl-2'>
            <Text className='text-muted-foreground text-sm'>{showPassword ? t('auth.login.hide') : t('auth.login.show')}</Text>
          </TouchableOpacity>
        </View>
        {errors.password && <Text className='text-red-500 text-xs mt-1 ml-4'>{errors.password}</Text>}
      </View>

      {/* Login Button */}
      <TouchableOpacity
        onPress={handleLogin}
        disabled={isPending}
        className={`h-12 rounded-full justify-center items-center mb-4 ${isPending ? 'bg-blue-300' : 'bg-[#0068FF]'}`}
        activeOpacity={0.8}
      >
        {isPending ? (
          <ActivityIndicator color='white' />
        ) : (
          <Text className='text-white font-bold text-sm'>{t('auth.login.loginWithPassword')}</Text>
        )}
      </TouchableOpacity>

      {/* Divider */}
      <View className='flex-row items-center my-4'>
        <View className='flex-1 h-px bg-border' />
        <Text className='mx-4 text-muted-foreground text-sm'>{t('auth.login.or')}</Text>
        <View className='flex-1 h-px bg-border' />
      </View>

      {/* Login without Password Button */}
      <TouchableOpacity
        onPress={handleLoginWithoutPassword}
        className='h-12 rounded-full justify-center items-center border-2 border-foreground mb-6'
        activeOpacity={0.8}
      >
        <Text className='text-foreground font-bold text-sm'>{t('auth.login.loginWithoutPassword')}</Text>
      </TouchableOpacity>

      {/* Links */}
      <View className='gap-y-3'>
        <TouchableOpacity
          onPress={() => {
            router.push('/auth/forgot-password' as any)
          }}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className='text-primary text-sm'>{t('auth.login.forgotPassword')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  // Render QR Tab Content
  const renderQRTab = () => (
    <View className='flex-1 items-center justify-center px-5 py-10'>
      <View className='w-48 h-48 bg-white border-2 border-gray-200 rounded-xl items-center justify-center mb-6'>
        <Ionicons name='qr-code' size={120} color='#333' />
      </View>
      <Text className='text-gray-600 text-center text-base px-6 leading-6'>{t('auth.login.qrInstruction')}</Text>
    </View>
  )

  return (
    <SafeAreaView className='flex-1 bg-background' edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className='flex-1'
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          className='flex-1'
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps='handled'
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        >
          <View className='flex-row justify-end items-center px-4 pt-3 gap-3'>
            <Pressable
              onPress={toggleLanguage}
              className='px-3 py-1.5 rounded-full border border-border bg-card'
            >
              <Text className='text-foreground text-xs font-medium'>{i18n.language === 'vi' ? 'VI' : 'EN'}</Text>
            </Pressable>
            <Pressable onPress={toggleTheme} className='w-9 h-9 rounded-full border border-border bg-card items-center justify-center'>
              <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={18} color={colors.text} />
            </Pressable>
          </View>

          {/* Logo */}
          <View className='items-center pt-4 pb-4'>
            <Text
              className='text-primary'
              style={{
                fontSize: 40,
                fontWeight: '700'
              }}
            >
              BondHub
            </Text>
          </View>

          {/* Tab Navigation */}
          <View className='flex-row mx-4 mb-4 border-b border-border'>
            <TouchableOpacity
              onPress={() => setActiveTab('email')}
              className={`flex-1 py-3 ${activeTab === 'email' ? 'border-b-2 border-primary' : ''}`}
            >
              <Text
                className={`text-center font-semibold text-xs ${
                  activeTab === 'email' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {t('auth.login.emailTab')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('qr')}
              className={`flex-1 py-3 ${activeTab === 'qr' ? 'border-b-2 border-primary' : ''}`}
            >
              <Text
                className={`text-center font-semibold text-xs ${
                  activeTab === 'qr' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {t('auth.login.qrTab')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'email' ? renderEmailTab() : renderQRTab()}

          {/* Register Link */}
          <View className='flex-row justify-center items-center py-6 mt-auto'>
            <Text className='text-muted-foreground text-sm'>{t('auth.login.noAccount')}</Text>
            <TouchableOpacity onPress={() => router.push('/auth/register' as any)}>
              <Text className='text-primary text-sm font-semibold ml-1'>{t('auth.login.register')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default LoginForm
