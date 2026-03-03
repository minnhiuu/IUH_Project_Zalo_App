import React from 'react'
import { View, Text } from 'react-native'

interface SectionLabelProps {
    title: string
    /** Use blue brand color for the label (Zalo-style). Defaults to grey. */
    blue?: boolean
}

export function SectionLabel({ title, blue = false }: SectionLabelProps) {
    return (
        <View className="px-4 pt-5 pb-2">
            <Text
                className={`text-xs font-semibold uppercase tracking-wide ${blue ? 'text-blue-600' : 'text-gray-400'
                    }`}
            >
                {title}
            </Text>
        </View>
    )
}
