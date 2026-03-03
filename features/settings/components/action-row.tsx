import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface ActionRowProps {
    icon: string
    iconBg: string
    iconColor: string
    title: string
    subtitle?: string
    onPress: () => void
    /** Replace the default chevron with a custom right element */
    rightComponent?: React.ReactNode
    showChevron?: boolean
}

export function ActionRow({
    icon,
    iconBg,
    iconColor,
    title,
    subtitle,
    onPress,
    rightComponent,
    showChevron = true,
}: ActionRowProps) {
    return (
        <TouchableOpacity
            className="flex-row items-center px-4 py-3 gap-3 bg-white active:bg-gray-50"
            onPress={onPress}
        >
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

            {rightComponent ?? (showChevron && (
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            ))}
        </TouchableOpacity>
    )
}
