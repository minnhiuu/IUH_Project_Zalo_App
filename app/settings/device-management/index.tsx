import React from 'react'
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native'
import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useMyDevices } from '@/features/device/queries/use-queries'
import { useDeleteDevice, useLogoutOtherDevices } from '@/features/device/queries/use-mutations'
import { format } from 'date-fns'
import { DeviceResponse, DeviceType } from '@/features/device/schemas/device.schema'

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
                    onPress: () => deleteDeviceMutation.mutate(deviceId)
                }
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
                    onPress: () => logoutOtherDevicesMutation.mutate()
                }
            ]
        )
    }

    const renderDeviceItem = (device: DeviceResponse) => {
        const isMobile = device.deviceType === DeviceType.MOBILE
        const isActive = device.isActive
        const isCurrent = device.isCurrentDevice

        return (
            <View
                key={device.id}
                className={`border rounded-xl p-3 mb-3 ${isCurrent ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}
            >
                <View className="flex-row items-start justify-between">
                    {/* Left: Icon + Info */}
                    <View className="flex-row items-center flex-1 gap-3">
                        {/* Device icon */}
                        <View
                            className="w-10 h-10 rounded-full items-center justify-center"
                            style={{ backgroundColor: isMobile ? '#E8F0FE' : '#F3E5F5' }}
                        >
                            <Ionicons
                                name={isMobile ? 'phone-portrait-outline' : 'desktop-outline'}
                                size={20}
                                color={isMobile ? '#0068FF' : '#9C27B0'}
                            />
                        </View>

                        {/* Device details */}
                        <View className="flex-1">
                            {/* Name + Badges */}
                            <View className="flex-row flex-wrap items-center gap-1.5 mb-0.5">
                                <Text className="text-sm font-bold text-gray-900">
                                    {device.deviceName || 'Unknown Device'}
                                </Text>

                                {isActive && (
                                    <View className="flex-row items-center gap-1 bg-green-100 px-2 py-0.5 rounded-full">
                                        <View className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        <Text className="text-xs text-green-700 font-medium">
                                            {t('settings.deviceManagement.activeStatus')}
                                        </Text>
                                    </View>
                                )}

                                {isCurrent && (
                                    <View className="bg-blue-100 px-2 py-0.5 rounded-full">
                                        <Text className="text-xs text-blue-700 font-medium">
                                            {t('settings.deviceManagement.currentDevice')}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* OS & Browser */}
                            <Text className="text-xs text-gray-500 mt-0.5">
                                {device.os || 'Unknown OS'} • {device.browser || 'Unknown Browser'}
                            </Text>

                            {/* Last active */}
                            {device.lastActiveTime && (
                                <Text className="text-xs text-gray-400 mt-0.5">
                                    {format(new Date(device.lastActiveTime), 'Pp')}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* Right: Delete button */}
                    {!isCurrent && (
                        <TouchableOpacity
                            onPress={() => handleDeleteDevice(device.id)}
                            disabled={deleteDeviceMutation.isPending}
                            className="p-2"
                        >
                            {deleteDeviceMutation.isPending ? (
                                <ActivityIndicator size="small" />
                            ) : (
                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        )
    }

    const activeDevices = devices?.filter(d => d.isActive) || []
    const inactiveDevices = devices?.filter(d => !d.isActive) || []

    return (
        <SettingsDetailScreen title={t('settings.deviceManagement.title')}>
            <View className="p-4">
                {/* Description */}
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
                        {/* Active Devices */}
                        {activeDevices.length > 0 && (
                            <View className="gap-2">
                                <Text className="text-xs text-gray-400 font-bold uppercase tracking-wide">
                                    {t('settings.deviceManagement.activeDevices')}
                                </Text>
                                {activeDevices.map(renderDeviceItem)}
                            </View>
                        )}

                        {/* Inactive Devices */}
                        {inactiveDevices.length > 0 && (
                            <View className="gap-2">
                                <Text className="text-xs text-gray-400 font-bold uppercase tracking-wide">
                                    {t('settings.deviceManagement.inactiveDevices')}
                                </Text>
                                {inactiveDevices.map(renderDeviceItem)}
                            </View>
                        )}

                        {/* Divider */}
                        <View className="h-px bg-gray-200" />

                        {/* Logout other devices */}
                        <TouchableOpacity
                            onPress={handleLogoutOtherDevices}
                            disabled={logoutOtherDevicesMutation.isPending || (devices.length <= 1)}
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
