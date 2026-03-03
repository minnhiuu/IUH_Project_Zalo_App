import React from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { DeviceResponse, DeviceType } from '@/features/device/schemas/device.schema'

interface DeviceItemProps {
    device: DeviceResponse
    deleteLabel: string
    activeLabel: string
    currentLabel: string
    isPendingDelete: boolean
    onDelete?: (id: string) => void
}

export function DeviceItem({
    device,
    deleteLabel,
    activeLabel,
    currentLabel,
    isPendingDelete,
    onDelete,
}: DeviceItemProps) {
    const isMobile = device.deviceType === DeviceType.MOBILE
    const isActive = device.isActive
    const isCurrent = device.isCurrentDevice

    return (
        <View
            className={`border rounded-xl p-3 mb-3 ${isCurrent ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                }`}
        >
            <View className="flex-row items-start justify-between">
                {/* Icon + Info */}
                <View className="flex-row items-center flex-1 gap-3">
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

                    <View className="flex-1">
                        <View className="flex-row flex-wrap items-center gap-1.5 mb-0.5">
                            <Text className="text-sm font-bold text-gray-900">
                                {device.deviceName || 'Unknown Device'}
                            </Text>
                            {isActive && (
                                <View className="flex-row items-center gap-1 bg-green-100 px-2 py-0.5 rounded-full">
                                    <View className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    <Text className="text-xs text-green-700 font-medium">{activeLabel}</Text>
                                </View>
                            )}
                            {isCurrent && (
                                <View className="bg-blue-100 px-2 py-0.5 rounded-full">
                                    <Text className="text-xs text-blue-700 font-medium">{currentLabel}</Text>
                                </View>
                            )}
                        </View>
                        <Text className="text-xs text-gray-500 mt-0.5">
                            {device.os || 'Unknown OS'} • {device.browser || 'Unknown Browser'}
                        </Text>
                        {device.lastActiveTime && (
                            <Text className="text-xs text-gray-400 mt-0.5">
                                {format(new Date(device.lastActiveTime), 'Pp')}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Delete button */}
                {!isCurrent && onDelete && (
                    <TouchableOpacity
                        onPress={() => onDelete(device.id)}
                        disabled={isPendingDelete}
                        className="p-2"
                    >
                        {isPendingDelete ? (
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
