import React, { useState, useCallback, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useRegisterMutation } from '../queries'

const RegisterForm: React.FC = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { mutate: register, isPending } = useRegisterMutation()

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
  const handleRegister = useCallback(() => {
    if (!validateForm()) return
    if (!agreedToTerms) return

    // Backend RegisterInitRequest needs: email, password, confirmPassword, fullName, phoneNumber
    register({
      email: email.trim(),
      password,
      confirmPassword,
      fullName: fullName.trim(),
      phoneNumber: phoneNumber ? phoneNumber.replace(/\D/g, '') : undefined
    })
  }, [validateForm, register, email, password, confirmPassword, fullName, phoneNumber, agreedToTerms])

  return (
    <SafeAreaView className='flex-1 bg-white' edges={['top', 'bottom']}>
      {/* Header */}
      <View className='flex-row items-center px-4 py-3 border-b border-gray-100'>
        <TouchableOpacity onPress={() => router.back()} className='p-2 -ml-2' activeOpacity={0.7}>
          <Ionicons name='arrow-back' size={24} color='#333' />
        </TouchableOpacity>
        <Text className='text-gray-800 text-lg font-semibold ml-2'>{t('auth.register.title')}</Text>
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
          {/* Subtitle */}
          <View className='px-4 py-4'>
            <Text className='text-gray-600 text-sm text-center'>{t('auth.register.subtitle')}</Text>
          </View>

          <View className='px-4'>
            {/* Email Input */}
            <View className='mb-4'>
              <Text className='text-gray-800 text-sm mb-2'>
                {t('auth.register.email')} <Text className='text-red-500'>*</Text>
              </Text>
              <View
                className={`flex-row items-center bg-gray-100 rounded-full px-4 h-12 ${
                  errors.email ? 'border border-red-500' : ''
                }`}
              >
                <Ionicons name='mail-outline' size={20} color='#666' />
                <TextInput
                  placeholder={t('auth.register.emailPlaceholder')}
                  placeholderTextColor='#9ca3af'
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
                  className='flex-1 text-base text-gray-800 ml-3'
                />
              </View>
              {errors.email && <Text className='text-red-500 text-xs mt-1 ml-4'>{errors.email}</Text>}
            </View>

            {/* Full Name Input */}
            <View className='mb-4'>
              <Text className='text-gray-800 text-sm mb-2'>
                {t('auth.register.fullName')} <Text className='text-red-500'>*</Text>
              </Text>
              <View
                className={`flex-row items-center bg-gray-100 rounded-full px-4 h-12 ${
                  errors.fullName ? 'border border-red-500' : ''
                }`}
              >
                <Ionicons name='person-outline' size={20} color='#666' />
                <TextInput
                  ref={fullNameRef}
                  placeholder={t('auth.register.fullNamePlaceholder')}
                  placeholderTextColor='#9ca3af'
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text)
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }))
                  }}
                  autoCapitalize='words'
                  returnKeyType='next'
                  onSubmitEditing={() => phoneRef.current?.focus()}
                  className='flex-1 text-base text-gray-800 ml-3'
                />
              </View>
              {errors.fullName && <Text className='text-red-500 text-xs mt-1 ml-4'>{errors.fullName}</Text>}
            </View>

            {/* Phone Number Input (Optional) */}
            <View className='mb-4'>
              <Text className='text-gray-800 text-sm mb-2'>
                {t('auth.register.phone')} <Text className='text-gray-400'>(tùy chọn)</Text>
              </Text>
              <View
                className={`flex-row items-center bg-gray-100 rounded-full px-4 h-12 ${
                  errors.phoneNumber ? 'border border-red-500' : ''
                }`}
              >
                <Ionicons name='call-outline' size={20} color='#666' />
                <TextInput
                  ref={phoneRef}
                  placeholder={t('auth.register.phonePlaceholder')}
                  placeholderTextColor='#9ca3af'
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setPhoneNumber(text)
                    if (errors.phoneNumber) setErrors((prev) => ({ ...prev, phoneNumber: undefined }))
                  }}
                  keyboardType='phone-pad'
                  returnKeyType='next'
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  className='flex-1 text-base text-gray-800 ml-3'
                />
              </View>
              {errors.phoneNumber && <Text className='text-red-500 text-xs mt-1 ml-4'>{errors.phoneNumber}</Text>}
            </View>

            {/* Password Input */}
            <View className='mb-4'>
              <Text className='text-gray-800 text-sm mb-2'>
                {t('auth.register.password')} <Text className='text-red-500'>*</Text>
              </Text>
              <View
                className={`flex-row items-center bg-gray-100 rounded-full px-4 h-12 ${
                  errors.password ? 'border border-red-500' : ''
                }`}
              >
                <Ionicons name='lock-closed-outline' size={20} color='#666' />
                <TextInput
                  ref={passwordRef}
                  placeholder={t('auth.register.passwordPlaceholder')}
                  placeholderTextColor='#9ca3af'
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text)
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                  }}
                  secureTextEntry={!showPassword}
                  returnKeyType='next'
                  onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                  className='flex-1 text-base text-gray-800 ml-3'
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className='pl-2'>
                  <Text className='text-gray-500 text-sm'>
                    {showPassword ? t('auth.login.hide') : t('auth.login.show')}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.password && <Text className='text-red-500 text-xs mt-1 ml-4'>{errors.password}</Text>}
            </View>

            {/* Confirm Password Input */}
            <View className='mb-4'>
              <Text className='text-gray-800 text-sm mb-2'>
                {t('auth.register.confirmPassword')} <Text className='text-red-500'>*</Text>
              </Text>
              <View
                className={`flex-row items-center bg-gray-100 rounded-full px-4 h-12 ${
                  errors.confirmPassword ? 'border border-red-500' : ''
                }`}
              >
                <Ionicons name='lock-closed-outline' size={20} color='#666' />
                <TextInput
                  ref={confirmPasswordRef}
                  placeholder={t('auth.register.confirmPasswordPlaceholder')}
                  placeholderTextColor='#9ca3af'
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text)
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                  }}
                  secureTextEntry={!showConfirmPassword}
                  returnKeyType='done'
                  onSubmitEditing={handleRegister}
                  className='flex-1 text-base text-gray-800 ml-3'
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className='pl-2'>
                  <Text className='text-gray-500 text-sm'>
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
                  agreedToTerms ? 'bg-[#0068FF] border-[#0068FF]' : 'border-gray-400'
                }`}
              >
                {agreedToTerms && <Ionicons name='checkmark' size={14} color='white' />}
              </View>
              <Text className='flex-1 text-gray-600 text-sm ml-3 leading-5'>
                {t('auth.register.terms')} <Text className='text-[#0068FF]'>{t('auth.register.termsOfService')}</Text>{' '}
                {t('auth.register.and')} <Text className='text-[#0068FF]'>{t('auth.register.privacyPolicy')}</Text>{' '}
                {t('auth.register.ofZalo')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Bottom Section */}
      <View className='px-4 pb-4 pt-2 bg-white border-t border-gray-100'>
        {/* Register Button */}
        <TouchableOpacity
          onPress={handleRegister}
          disabled={isPending || !agreedToTerms}
          className={`h-12 rounded-full justify-center items-center mb-3 ${
            isPending || !agreedToTerms ? 'bg-gray-300' : 'bg-[#0068FF]'
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
          <Text className='text-gray-600 text-sm'>{t('auth.register.hasAccount')}</Text>
          <TouchableOpacity onPress={() => router.push('/auth/login' as any)}>
            <Text className='text-[#0068FF] text-sm font-semibold ml-1'>{t('auth.register.login')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default RegisterForm
