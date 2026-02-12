import { AnimatedScreen } from '@/components/common/animated-screen'
import { UserProfileDetails } from '@/features/user/components/user-profile-details'
import { useUserById } from '@/features/user/queries/use-queries'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, StatusBar, Text, TouchableOpacity, View } from 'react-native'

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { t } = useTranslation()
  const { data: user, isLoading } = useUserById(id || '')

  if (isLoading) {
    return (
      <View className='flex-1 items-center justify-center bg-white'>
        <ActivityIndicator size='large' color='#0068FF' />
      </View>
    )
  }

  if (!user) {
    return (
      <View className='flex-1 items-center justify-center bg-white'>
        <Stack.Screen options={{ headerShown: true, title: t('common.error') }} />
        <Text>{t('user.notFound')}</Text>
        <TouchableOpacity onPress={() => router.back()} className='mt-4'>
          <Text className='text-blue-500'>{t('common.goBack')}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <AnimatedScreen animationType='slide_horizontal' style={{ backgroundColor: 'white' }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle='light-content' translucent backgroundColor='transparent' />
      <UserProfileDetails user={user} />
    </AnimatedScreen>
  )
}
