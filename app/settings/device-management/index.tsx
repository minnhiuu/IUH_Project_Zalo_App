import React from 'react'
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useMyDevices } from '@/features/device/queries/use-queries'
import { useDeleteDevice, useLogoutOtherDevices } from '@/features/device/queries/use-mutations'
import { SectionLabel } from '@/features/settings'
import { DeviceItem } from '@/features/settings/device-management'

export default function DeviceManagementScreen() {
    const { t } = useTranslation()
    const { data: devices, isLoading } = useMyDevices()
    const deleteDeviceMutation = useDeleteDevice()
    const logoutOtherDevicesMutation = useLogoutOtherDevices()

    const handleDeleteDevice = (deviceId: string) => {
        Alert.alert(
            t('settings.deviceManagement.deleteConfirm'),
            '',
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: () => deleteDeviceMutation.mutate(deviceId),
                },
            ]
        )
    }

    const handleLogoutOtherDevices = () => {
        Alert.alert(
            t('settings.deviceManagement.logoutOthersConfirm'),
            '',
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.logout'),
                    style: 'destructive',
                    onPress: () => logoutOtherDevicesMutation.mutate(),
                },
            ]
        )
    }

    const activeDevices = devices?.filter((d) => d.isActive) || []
    const inactiveDevices = devices?.filter((d) => !d.isActive) || []

    return (
        <SettingsDetailScreen title={t('settings.deviceManagement.title')}>
            <View className="p-4">
                <Text className="text-sm text-gray-500 mb-4">
                    {t('settings.deviceManagement.description')}
                </Text>

                {isLoading ? (
                    <View className="flex-row justify-center items-center py-8 gap-2">
                        <ActivityIndicator />
                        <Text className="text-sm text-gray-500">
                            {t('settings.deviceManagement.loading')}
                        </Text>
                    </View>
                ) : devices && devices.length > 0 ? (
                    <View className="gap-6">
                        {activeDevices.length > 0 && (
                            <View className="gap-2">
                                <SectionLabel title={t('settings.deviceManagement.activeDevices')} />
                                {activeDevices.map((device) => (
                                    <DeviceItem
                                        key={device.id}
                                        device={device}
                                        activeLabel={t('settings.deviceManagement.activeStatus')}
                                        currentLabel={t('settings.deviceManagement.currentDevice')}
                                        deleteLabel={t('common.delete')}
                                        isPendingDelete={deleteDeviceMutation.isPending}
                                        onDelete={handleDeleteDevice}
                                    />
                                ))}
                            </View>
                        )}

                        {inactiveDevices.length > 0 && (
                            <View className="gap-2">
                                <SectionLabel title={t('settings.deviceManagement.inactiveDevices')} />
                                {inactiveDevices.map((device) => (
                                    <DeviceItem
                                        key={device.id}
                                        device={device}
                                        activeLabel={t('settings.deviceManagement.activeStatus')}
                                        currentLabel={t('settings.deviceManagement.currentDevice')}
                                        deleteLabel={t('common.delete')}
                                        isPendingDelete={deleteDeviceMutation.isPending}
                                        onDelete={handleDeleteDevice}
                                    />
                                ))}
                            </View>
                        )}

                        <View className="h-px bg-gray-200" />

                        <TouchableOpacity
                            onPress={handleLogoutOtherDevices}
                            disabled={logoutOtherDevicesMutation.isPending || devices.length <= 1}
                            className={`flex-row items-center justify-center gap-2 border rounded-lg py-3 px-4 ${logoutOtherDevicesMutation.isPending || devices.length <= 1
                                    ? 'border-gray-200 opacity-50'
                                    : 'border-red-200 bg-red-50'
                                }`}
                        >
                            {logoutOtherDevicesMutation.isPending && (
                                <ActivityIndicator size="small" color="#EF4444" />
                            )}
                            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                            <Text className="text-red-600 font-medium text-sm">
                                {t('settings.deviceManagement.logoutOthers')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View className="py-8 items-center">
                        <Ionicons name="phone-portrait-outline" size={40} color="#d1d5db" />
                        <Text className="text-sm text-gray-400 mt-3">
                            {t('settings.deviceManagement.noDevices')}
                        </Text>
                    </View>
                )}
            </View>
        </SettingsDetailScreen>
    )
}
