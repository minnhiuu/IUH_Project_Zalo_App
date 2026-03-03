import React from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface ActivityRowProps {
    icon: string
    iconColor: string
    title: string
    time: string
}

export function ActivityRow({ icon, iconColor, title, time }: ActivityRowProps) {
    return (
        <View className="flex-row items-center px-4 py-3 gap-3 bg-white">
            <Ionicons name={icon as any} size={22} color={iconColor} />
            <View className="flex-1">
                <Text className="text-base text-gray-900">{title}</Text>
                <Text className="text-sm text-gray-500 mt-0.5">{time}</Text>
            </View>
        </View>
    )
}
