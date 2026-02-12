import { UserAvatar } from '@/components/common/user-avatar'
import { UserResponse } from '@/features/user'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Animated, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'

interface UserProfileDetailsProps {
  user: UserResponse
}

const HEADER_HEIGHT = 350

export function UserProfileDetails({ user }: UserProfileDetailsProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const scrollY = React.useRef(new Animated.Value(0)).current

  const headerTranslateY = scrollY.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0, -1]
  })

  const headerScale = scrollY.interpolate({
    inputRange: [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
    outputRange: [5.0, 1, 0.9],
    extrapolate: 'clamp'
  })

  return (
    <View className='flex-1 bg-white'>
      <Animated.Image
        source={{ uri: 'https://picsum.photos/seed/cover/800/600' }}
        className='absolute top-0 z-0'
        resizeMode='cover'
        style={{
          width: '125%',
          left: '-12.5%',
          height: HEADER_HEIGHT,
          transform: [{ translateY: headerTranslateY }, { scale: headerScale }]
        }}
      />

      <View className='absolute top-12 left-4 z-20'>
        <TouchableOpacity onPress={() => router.back()} className='bg-black/20 p-2 rounded-full'>
          <Ionicons name='arrow-back' size={24} color='white' />
        </TouchableOpacity>
      </View>

      <View className='absolute top-12 right-4 z-20 flex-row gap-4'>
        <TouchableOpacity className='bg-black/20 p-2 rounded-full'>
          <Ionicons name='call-outline' size={24} color='white' />
        </TouchableOpacity>
        <TouchableOpacity className='bg-black/20 p-2 rounded-full'>
          <Ionicons name='ellipsis-horizontal' size={24} color='white' />
        </TouchableOpacity>
      </View>
      <Animated.ScrollView
        className='flex-1 z-10'
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT - 32
        }}
      >
        <View className='bg-white rounded-t-3xl -mt-8 pt-20 pb-4 items-center px-4 min-h-screen'>
          <View className='absolute -top-16 p-1 bg-white rounded-full'>
            <UserAvatar className='rounded-full border-4 border-white' name={user.fullName} size='4xl' />
          </View>

          <View className='flex-row items-center mt-2'>
            <Text className='text-2xl font-bold'>{user.fullName}</Text>
            <Ionicons name='pencil' size={16} color='gray' style={{ marginLeft: 8 }} />
          </View>

          <Text className='text-gray-500 text-center mt-4 px-8'>
            {t('user.profile.timelinePostRestriction', { name: user.fullName })}
          </Text>

          <View className='flex-row w-full mt-6 gap-3 px-4'>
            <TouchableOpacity className='flex-1 bg-blue-100 py-3 rounded-full flex-row justify-center items-center gap-2'>
              <Ionicons name='chatbubble-ellipses-outline' size={24} color='#0068FF' />
              <Text className='text-blue-600 font-bold text-lg'>{t('common.chat')}</Text>
            </TouchableOpacity>
            <TouchableOpacity className='bg-gray-100 p-3 rounded-full w-14 items-center justify-center'>
              <Ionicons name='person-add-outline' size={24} color='black' />
            </TouchableOpacity>
          </View>

          <View className='w-full mt-8 mb-10'>
            <View className='flex-row justify-between items-center mb-4 px-2'>
              <Text className='font-bold text-lg'>{t('user.recommendedFriends')}</Text>
              <Text className='text-blue-500'>{t('common.seeMore')}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className='pl-1 pb-4'>
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  className='w-40 bg-white shadow-sm p-3 rounded-lg border border-gray-100 items-center mr-4'
                >
                  <TouchableOpacity className='absolute top-1 right-1 z-10'>
                    <Ionicons name='close' size={16} color='gray' />
                  </TouchableOpacity>
                  <Image source={{ uri: `https://i.pravatar.cc/150?u=${i}` }} className='w-16 h-16 rounded-full mb-2' />
                  <Text className='font-medium mb-2 text-center' numberOfLines={1}>
                    User {i}
                  </Text>
                  <TouchableOpacity className='bg-blue-100 py-1.5 px-4 rounded-full w-full items-center'>
                    <Text className='text-blue-600 font-medium text-xs'>{t('common.add')}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  )
}
