import React from 'react'
import { View } from 'react-native'

export function StorageBar() {
    return (
        <View className="h-2 rounded-full flex-row overflow-hidden bg-gray-200 mt-4">
            <View style={{ flex: 0.35, backgroundColor: '#0068FF' }} />
            <View style={{ flex: 0.25, backgroundColor: '#34D399' }} />
            <View style={{ flex: 0.15, backgroundColor: '#FBBF24' }} />
            <View style={{ flex: 0.25, backgroundColor: '#E5E7EB' }} />
        </View>
    )
}
