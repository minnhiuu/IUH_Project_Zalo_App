import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import SettingsDetailScreen from '@/components/settings-detail-screen'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useMyDevices } from '@/features/device/queries/use-queries'
import { useDeleteDevice } from '@/features/device/queries/use-mutations'
import { SectionLabel } from '@/features/settings'
import { ConfirmDialog } from '@/components/ui'
import {
  DeviceItem,
  DeviceDetailModal,
  useLogoutDevice,
  useLogoutOtherDevices
} from '@/features/settings/device-management'
import type { DeviceResponse } from '@/features/device/schemas/device.schema'

export default function DeviceManagementScreen() {
  const { t } = useTranslation()
  const { data: devices, isLoading } = useMyDevices()
  const deleteDeviceMutation = useDeleteDevice()
  const logoutOtherDevicesMutation = useLogoutOtherDevices()
  const logoutDeviceMutation = useLogoutDevice()
  const [selectedDevice, setSelectedDevice] = useState<DeviceResponse | null>(null)
  const [confirmConfig, setConfirmConfig] = useState<{
    visible: boolean
    message: string
    confirmText?: string
    onConfirm: () => void
  }>({ visible: false, message: '', onConfirm: () => { } })

  const handleDeleteDevice = (deviceId: string) => {
    setConfirmConfig({
      visible: true,
      message: t('settings.deviceManagement.deleteConfirm'),
      confirmText: t('common.delete'),
      onConfirm: () => {
        deleteDeviceMutation.mutate(deviceId)
        setConfirmConfig((prev) => ({ ...prev, visible: false }))
      }
    })
  }

  const handleLogoutDevice = (sessionId: string) => {
    setConfirmConfig({
      visible: true,
      message: t('settings.deviceManagement.logoutDeviceConfirm'),
      confirmText: t('common.logout'),
      onConfirm: () => {
        logoutDeviceMutation.mutate(sessionId)
        setConfirmConfig((prev) => ({ ...prev, visible: false }))
      }
    })
  }

  const handleLogoutOtherDevices = () => {
    setConfirmConfig({
      visible: true,
      message: t('settings.deviceManagement.logoutOthersConfirm'),
      confirmText: t('common.logout'),
      onConfirm: () => {
        logoutOtherDevicesMutation.mutate()
        setConfirmConfig((prev) => ({ ...prev, visible: false }))
      }
    })
  }

  const activeDevices = devices?.currentDevice || []
  const inactiveDevices = devices?.otherDevices || []
  const totalDevicesCount = activeDevices.length + inactiveDevices.length

  return (
    <SettingsDetailScreen title={t('settings.deviceManagement.title')}>
      <View className='p-4'>
        <Text className='text-sm text-gray-500 mb-4'>{t('settings.deviceManagement.description')}</Text>

        {isLoading ? (
          <View className='flex-row justify-center items-center py-8 gap-2'>
            <ActivityIndicator />
            <Text className='text-sm text-gray-500'>{t('settings.deviceManagement.loading')}</Text>
          </View>
        ) : totalDevicesCount > 0 ? (
          <View className='gap-6'>
            {activeDevices.length > 0 && (
              <View className='gap-2'>
                <SectionLabel blue title={t('settings.deviceManagement.activeDevices')} />
                {activeDevices.map((device) => (
                  <DeviceItem
                    key={device.id}
                    device={device}
                    activeLabel={t('settings.deviceManagement.activeStatus')}
                    currentLabel={t('settings.deviceManagement.currentDevice')}
                    onPressMore={() => setSelectedDevice(device)}
                  />
                ))}
              </View>
            )}

            {inactiveDevices.length > 0 && (
              <View className='gap-2'>
                <SectionLabel blue title={t('settings.deviceManagement.inactiveDevices')} />
                {inactiveDevices.map((device) => (
                  <DeviceItem
                    key={device.id}
                    device={device}
                    activeLabel={t('settings.deviceManagement.activeStatus')}
                    currentLabel={t('settings.deviceManagement.currentDevice')}
                    onPressMore={() => setSelectedDevice(device)}
                  />
                ))}
              </View>
            )}

            <View className='h-px bg-gray-200' />

            <TouchableOpacity
              onPress={handleLogoutOtherDevices}
              disabled={logoutOtherDevicesMutation.isPending || totalDevicesCount <= 1}
              className={`flex-row items-center justify-center gap-2 border rounded-lg py-3 px-4 ${logoutOtherDevicesMutation.isPending || totalDevicesCount <= 1
                ? 'border-gray-200 opacity-50'
                : 'border-red-200 bg-red-50'
                }`}
            >
              {logoutOtherDevicesMutation.isPending && <ActivityIndicator size='small' color='#EF4444' />}
              <Ionicons name='log-out-outline' size={20} color='#EF4444' />
              <Text className='text-red-600 font-medium text-sm'>{t('settings.deviceManagement.logoutOthers')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className='py-8 items-center'>
            <Ionicons name='phone-portrait-outline' size={40} color='#d1d5db' />
            <Text className='text-sm text-gray-400 mt-3'>{t('settings.deviceManagement.noDevices')}</Text>
          </View>
        )}
      </View>

      {selectedDevice && (
        <DeviceDetailModal
          device={selectedDevice}
          visible={!!selectedDevice}
          onClose={() => setSelectedDevice(null)}
          deleteLabel={t('common.delete')}
          isPendingDelete={deleteDeviceMutation.isPending}
          onDelete={handleDeleteDevice}
          logoutLabel={t('settings.deviceManagement.logoutDevice')}
          isPendingLogout={logoutDeviceMutation.isPending}
          onLogoutDevice={handleLogoutDevice}
        />
      )}

      <ConfirmDialog
        visible={confirmConfig.visible}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig((prev) => ({ ...prev, visible: false }))}
        destructive
        confirmText={confirmConfig.confirmText || t('common.confirm') || 'Confirm'}
        cancelText={t('common.cancel')}
      />
    </SettingsDetailScreen>
  )
}
