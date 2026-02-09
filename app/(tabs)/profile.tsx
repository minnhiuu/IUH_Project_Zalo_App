import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuthStore } from '@/store'
import { useLogoutMutation } from '@/features/auth/queries'

// Menu Item Component
interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap
  iconColor?: string
  iconBgColor?: string
  title: string
  subtitle?: string
  onPress?: () => void
  showArrow?: boolean
  badge?: string
}

const MenuItem = ({
  icon,
  iconColor = '#0068FF',
  iconBgColor,
  title,
  subtitle,
  onPress,
  showArrow = true,
  badge
}: MenuItemProps) => (
  <TouchableOpacity onPress={onPress} className='flex-row items-center px-4 py-3 bg-white active:bg-gray-50'>
    <View
      className='w-10 h-10 rounded-full items-center justify-center mr-3'
      style={{ backgroundColor: iconBgColor || '#E8F0FE' }}
    >
      <Ionicons name={icon} size={22} color={iconColor} />
    </View>
    <View className='flex-1'>
      <Text className='text-base text-gray-900 font-medium'>{title}</Text>
      {subtitle && <Text className='text-sm text-gray-500 mt-0.5'>{subtitle}</Text>}
    </View>
    {badge && (
      <View className='bg-red-500 rounded-full px-2 py-0.5 mr-2'>
        <Text className='text-white text-xs font-bold'>{badge}</Text>
      </View>
    )}
    {showArrow && <Ionicons name='chevron-forward' size={20} color='#ccc' />}
  </TouchableOpacity>
)

// Section Divider
const SectionDivider = () => <View className='h-2 bg-gray-100' />

// Line Divider
const LineDivider = () => <View className='h-[0.5px] bg-gray-200 ml-16' />

export default function ProfileScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { user } = useAuthStore()
  const logoutMutation = useLogoutMutation()

  // Get user name from store (set during registration)
  const userName = user?.fullName || 'Người dùng'
  const userAvatar = user?.avatar

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => logoutMutation.mutate()
      }
    ])
  }

  return (
    <View className='flex-1 bg-gray-100'>
      {/* Header with Gradient covering status bar */}
      <LinearGradient
        colors={['#0068FF', '#0055DD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top }}
      >
        <View className='flex-row items-center justify-between px-4 py-2.5'>
          <TouchableOpacity className='mr-3'>
            <Ionicons name='search' size={24} color='white' />
          </TouchableOpacity>
          <View className='flex-1'>
            <Text className='text-white text-base opacity-90'>Tìm kiếm</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Ionicons name='settings-outline' size={24} color='white' />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <TouchableOpacity className='flex-row items-center px-4 py-4 bg-white' activeOpacity={0.7}>
          {/* Avatar */}
          <View className='relative'>
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} className='w-16 h-16 rounded-full' />
            ) : (
              <View className='w-16 h-16 rounded-full bg-gray-300 items-center justify-center'>
                <Ionicons name='person' size={32} color='#666' />
              </View>
            )}
            {/* Edit avatar button */}
            <View className='absolute -bottom-1 -right-1 bg-gray-200 rounded-full p-1.5 border-2 border-white'>
              <Ionicons name='camera' size={12} color='#666' />
            </View>
          </View>

          {/* User Name */}
          <View className='flex-1 ml-4'>
            <Text className='text-xl font-semibold text-gray-900'>{userName}</Text>
          </View>
        </TouchableOpacity>

        <SectionDivider />

        {/* Cloud Services */}
        <View className='bg-white'>
          <MenuItem
            icon='cloud-outline'
            iconColor='#0068FF'
            iconBgColor='#E8F0FE'
            title='zCloud'
            subtitle='Không gian lưu trữ dữ liệu trên đám mây'
            onPress={() => {}}
          />
          <LineDivider />
          <MenuItem
            icon='color-palette-outline'
            iconColor='#FF6B35'
            iconBgColor='#FFF0EB'
            title='zStyle – Nổi bật trên Zalo'
            subtitle='Hình nền và nhạc cho cuộc gọi Zalo'
            onPress={() => {}}
          />
        </View>

        <SectionDivider />

        {/* Documents & Data */}
        <View className='bg-white'>
          <MenuItem
            icon='folder-outline'
            iconColor='#4CAF50'
            iconBgColor='#E8F5E9'
            title='My Documents'
            subtitle='Lưu trữ các tin nhắn quan trọng'
            onPress={() => {}}
          />
          <LineDivider />
          <MenuItem
            icon='time-outline'
            iconColor='#9C27B0'
            iconBgColor='#F3E5F5'
            title='Dữ liệu trên máy'
            subtitle='Quản lý dữ liệu Zalo của bạn'
            onPress={() => {}}
          />
          <LineDivider />
          <MenuItem
            icon='qr-code-outline'
            iconColor='#2196F3'
            iconBgColor='#E3F2FD'
            title='Ví QR'
            subtitle='Lưu trữ và xuất trình các mã QR quan trọng'
            onPress={() => {}}
          />
        </View>

        <SectionDivider />

        {/* Security */}
        <View className='bg-white'>
          <MenuItem
            icon='shield-checkmark-outline'
            iconColor='#0068FF'
            iconBgColor='#E8F0FE'
            title='Tài khoản và bảo mật'
            onPress={() => {}}
          />
          <LineDivider />
          <MenuItem
            icon='lock-closed-outline'
            iconColor='#607D8B'
            iconBgColor='#ECEFF1'
            title='Quyền riêng tư'
            onPress={() => {}}
          />
        </View>

        <SectionDivider />

        {/* Logout Button */}
        <View className='bg-white mt-4 mb-8'>
          <TouchableOpacity onPress={handleLogout} className='flex-row items-center justify-center py-4'>
            <Ionicons name='log-out-outline' size={22} color='#FF3B30' />
            <Text className='text-base font-medium text-red-500 ml-2'>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}
