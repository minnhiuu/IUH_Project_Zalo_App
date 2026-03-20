import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface PrivacyActionRowProps {
    icon: string
    title: string
    /** Optional value shown between title and chevron (e.g. "Everyone", "On") */
    value?: string
    onPress: () => void
}

/**
 * Privacy-screen style row: plain icon (no coloured bubble),
 * title, optional value text, and a chevron.
 */
export function PrivacyActionRow({ icon, title, value, onPress }: PrivacyActionRowProps) {
    return (
        <TouchableOpacity
            className="flex-row items-center px-4 py-3 gap-3 bg-background active:bg-secondary"
            onPress={onPress}
        >
            <View className="w-8 h-8 items-center justify-center">
                <Ionicons name={icon as any} size={22} color="#555" />
            </View>
            <Text className="flex-1 text-base text-foreground">{title}</Text>
            <View className="flex-row items-center gap-1">
                {value && <Text className="text-sm text-muted-foreground">{value}</Text>}
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </View>
        </TouchableOpacity>
    )
}
