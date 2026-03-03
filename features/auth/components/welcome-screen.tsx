import React from 'react'
import { View, Text, TouchableOpacity, StatusBar } from 'react-native'
import { useTranslation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

export const WelcomeScreen: React.FC = () => {
  const { t, i18n } = useTranslation()
  const router = useRouter()

  const handleLogin = () => {
    router.push('/auth/login')
  }

  const handleRegister = () => {
    router.push('/auth/register')
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi'
    i18n.changeLanguage(newLang)
  }

  return (
    <View className='flex-1 bg-[#0068FF]'>
      <StatusBar barStyle='light-content' backgroundColor='#0068FF' />

      <SafeAreaView className='flex-1'>
        {/* Language Selector - Top Right */}
        <View className='flex-row justify-end px-5 pt-3'>
          <TouchableOpacity onPress={toggleLanguage} className='flex-row items-center' activeOpacity={0.7}>
            <Text className='text-white text-base font-medium'>
              {i18n.language === 'vi' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Center Content - Logo & Text */}
        <View className='flex-1 items-center justify-center px-8'>
          {/* Zalo Logo Box */}
          <View className='w-20 h-20 bg-white rounded-2xl items-center justify-center mb-3 shadow-lg'>
            <Text className='text-[#0068FF] text-4xl font-bold'>Z</Text>
          </View>

          {/* Zalo Text */}
          <Text className='text-white text-2xl font-semibold mb-6'>Zalo</Text>

          {/* Subtitle */}
          <Text className='text-white text-xl text-center leading-8'>{t('auth.welcome.subtitle')}</Text>
        </View>

        {/* Bottom Buttons */}
        <View className='px-8 pb-6'>
          {/* Login Button - White background */}
          <TouchableOpacity
            onPress={handleLogin}
            className='bg-white rounded-full h-14 items-center justify-center mb-3'
            activeOpacity={0.9}
          >
            <Text className='text-[#0068FF] text-lg font-semibold'>{t('auth.welcome.loginButton')}</Text>
          </TouchableOpacity>

          {/* Register Button - Transparent with border */}
          <TouchableOpacity
            onPress={handleRegister}
            className='border-2 border-white rounded-full h-14 items-center justify-center'
            activeOpacity={0.8}
          >
            <Text className='text-white text-lg font-semibold'>{t('auth.welcome.registerButton')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  )
}

export default WelcomeScreen
