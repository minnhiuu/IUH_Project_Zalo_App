import React from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface LastBackupBannerProps {
    label: string
    timestamp: string
}

export function LastBackupBanner({ label, timestamp }: LastBackupBannerProps) {
    return (
        <View className="bg-white mt-3 px-4 py-3 flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
                <Ionicons name="time-outline" size={22} color="#0068FF" />
            </View>
            <View className="flex-1">
                <Text className="text-sm text-gray-500">{label}</Text>
                <Text className="text-base font-medium text-gray-900">{timestamp}</Text>
            </View>
        </View>
    )
}
