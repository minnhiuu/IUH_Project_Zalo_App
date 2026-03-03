import React from 'react'
import { View, Text, Switch } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface ToggleRowProps {
    icon: string
    iconBg: string
    iconColor: string
    title: string
    subtitle?: string
    value: boolean
    onValueChange: (value: boolean) => void
}

export function ToggleRow({
    icon,
    iconBg,
    iconColor,
    title,
    subtitle,
    value,
    onValueChange,
}: ToggleRowProps) {
    return (
        <View className="flex-row items-center px-4 py-3 gap-3 bg-white">
            <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: iconBg }}
            >
                <Ionicons name={icon as any} size={22} color={iconColor} />
            </View>

            <View className="flex-1">
                <Text className="text-base text-gray-900">{title}</Text>
                {subtitle && (
                    <Text className="text-sm text-gray-500 mt-0.5">{subtitle}</Text>
                )}
            </View>

            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ true: '#0068FF' }}
            />
        </View>
    )
}
