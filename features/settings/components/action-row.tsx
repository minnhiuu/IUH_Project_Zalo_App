import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { cssInterop } from 'nativewind'

cssInterop(Ionicons, {
    className: {
        target: 'style',
        nativeStyleToProp: { color: true },
    },
})

interface ActionRowProps {
    icon: string
    iconBgClass?: string
    iconColorClass?: string
    title: string
    subtitle?: string
    onPress: () => void
    /** Replace the default chevron with a custom right element */
    rightComponent?: React.ReactNode
    showChevron?: boolean
}

export function ActionRow({
    icon,
    iconBgClass = 'bg-secondary',
    iconColorClass = 'text-icon-secondary',
    title,
    subtitle,
    onPress,
    rightComponent,
    showChevron = true,
}: ActionRowProps) {
    return (
        <TouchableOpacity
            className="flex-row items-center px-4 py-3 gap-3 bg-background active:bg-secondary"
            onPress={onPress}
        >
            <View
                className={`w-10 h-10 rounded-full items-center justify-center ${iconBgClass}`}
            >
                <Ionicons name={icon as any} size={22} className={iconColorClass} />
            </View>

            <View className="flex-1">
                <Text className="text-base text-foreground">{title}</Text>
                {subtitle && (
                    <Text className="text-sm text-muted-foreground mt-0.5">{subtitle}</Text>
                )}
            </View>

            {rightComponent ?? (showChevron && (
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            ))}
        </TouchableOpacity>
    )
}
