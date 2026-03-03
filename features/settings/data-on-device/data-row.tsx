import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface DataRowProps {
    icon: string
    iconColor: string
    title: string
    size: string
    cleanupLabel?: string
    onCleanup?: () => void
}

export function DataRow({ icon, iconColor, title, size, cleanupLabel = 'Dọn dẹp', onCleanup }: DataRowProps) {
    return (
        <View className="flex-row items-center px-4 py-3.5 border-b border-gray-100">
            <Ionicons name={icon as any} size={24} color={iconColor} />
            <Text className="flex-1 text-base text-gray-800 ml-3">{title}</Text>
            <View className="flex-row items-center gap-3">
                <Text className="text-sm text-gray-500">{size}</Text>
                {onCleanup && (
                    <TouchableOpacity onPress={onCleanup} className="px-3 py-1 rounded-full bg-gray-100">
                        <Text className="text-sm font-medium" style={{ color: '#0068FF' }}>{cleanupLabel}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}
