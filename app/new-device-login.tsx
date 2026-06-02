import React, { useState } from 'react'
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { Header } from '@/components/ui/header'
import { Text } from '@/components'
import { ConfirmDialog } from '@/components/ui'
import { useLogoutDevice } from '@/features/settings/device-management'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@/context'
import { useTranslation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function NewDeviceLoginScreen() {
  const { deviceName, ipAddress, loginTime, sessionId } = useLocalSearchParams<{
    deviceName: string
    ipAddress: string
    loginTime: string
    sessionId: string
  }>()
  const [confirmVisible, setConfirmVisible] = useState(false)
  const logoutDeviceMutation = useLogoutDevice()
  const { colors, isDark } = useTheme()
  const { t } = useTranslation()
  const router = useRouter()

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return 'Unknown'
    try {
      const date = new Date(timeStr)
      if (isNaN(date.getTime())) return timeStr
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return timeStr
    }
  }

  const handleLogout = () => {
    if (!sessionId) return
    logoutDeviceMutation.mutate(sessionId, {
      onSuccess: () => {
        setConfirmVisible(false)
        router.back()
      }
    })
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title={t('notification.newDeviceLogin.title')}
        showBackButton
        showSearch={false}
      />
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        <View className="items-center mb-8 mt-4">
          <View className="w-20 h-20 rounded-full bg-orange-100 items-center justify-center mb-4">
            <Ionicons name="warning" size={40} color="#f97316" />
          </View>
          <Text className="text-xl font-bold text-center mb-2" style={{ color: colors.text }}>
            {t('notification.newDeviceLogin.title')}
          </Text>
          <Text className="text-center text-sm leading-5 px-4" style={{ color: colors.textSecondary }}>
            {t('notification.newDeviceLogin.description')}
          </Text>
        </View>

        <View className="p-4 rounded-2xl mb-8" style={{ backgroundColor: colors.backgroundSecondary }}>
          <View className="flex-row items-start mb-4">
            <View className="mt-0.5">
              <Ionicons name="laptop-outline" size={22} color={colors.textSecondary} />
            </View>
            <View className="ml-3 flex-1 border-b border-gray-100 dark:border-gray-800 pb-3">
              <Text className="text-xs mb-1 font-medium uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                {t('notification.newDeviceLogin.device')}
              </Text>
              <Text className="text-base font-medium" style={{ color: colors.text }}>
                {deviceName || t('notification.newDeviceLogin.unknown')}
              </Text>
            </View>
          </View>

          <View className="flex-row items-start mb-4">
            <View className="mt-0.5">
              <Ionicons name="location-outline" size={22} color={colors.textSecondary} />
            </View>
            <View className="ml-3 flex-1 border-b border-gray-100 dark:border-gray-800 pb-3">
              <Text className="text-xs mb-1 font-medium uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                {t('notification.newDeviceLogin.ipAddress')}
              </Text>
              <Text className="text-base font-medium" style={{ color: colors.text }}>
                {ipAddress || t('notification.newDeviceLogin.unknown')}
              </Text>
            </View>
          </View>

          <View className="flex-row items-start">
            <View className="mt-0.5">
              <Ionicons name="time-outline" size={22} color={colors.textSecondary} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xs mb-1 font-medium uppercase tracking-wider" style={{ color: colors.textSecondary }}>
                {t('notification.newDeviceLogin.time')}
              </Text>
              <Text className="text-base font-medium" style={{ color: colors.text }}>
                {formatTime(loginTime)}
              </Text>
            </View>
          </View>
        </View>

        <View className="p-4 rounded-xl border border-red-200 mb-4" style={{ backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2' }}>
          <View className="flex-row items-start">
            <Ionicons name="shield-checkmark-outline" size={20} color="#ef4444" style={{ marginTop: 2 }} />
            <Text className="ml-2 text-[13px] leading-5 flex-1" style={{ color: isDark ? '#fca5a5' : '#b91c1c' }}>
              {t('notification.newDeviceLogin.warning')}
            </Text>
          </View>
        </View>

        {sessionId ? (
          <TouchableOpacity
            onPress={() => setConfirmVisible(true)}
            disabled={logoutDeviceMutation.isPending}
            className={`flex-row items-center justify-center gap-2 border rounded-xl py-3.5 px-4 mt-2 ${
              logoutDeviceMutation.isPending ? 'opacity-50' : ''
            }`}
            style={{ 
              backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
              borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca'
            }}
          >
            {logoutDeviceMutation.isPending && <ActivityIndicator size="small" color={isDark ? '#fca5a5' : '#ef4444'} />}
            <Ionicons name="log-out-outline" size={20} color={isDark ? '#fca5a5' : '#ef4444'} />
            <Text className="font-semibold text-sm" style={{ color: isDark ? '#fca5a5' : '#dc2626' }}>
              {t('notification.newDeviceLogin.logoutButton')}
            </Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      <ConfirmDialog
        visible={confirmVisible}
        message={t('notification.newDeviceLogin.logoutConfirmMessage')}
        onConfirm={handleLogout}
        onCancel={() => setConfirmVisible(false)}
        destructive
        confirmText={t('notification.newDeviceLogin.logout')}
        cancelText={t('notification.newDeviceLogin.cancel')}
      />
    </View>
  )
}
