import React from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface PasswordFieldProps {
    label: string
    value: string
    onChangeText: (v: string) => void
    placeholder: string
    show: boolean
    onToggleShow: () => void
    error?: string
    disabled?: boolean
}

export function PasswordField({
    label,
    value,
    onChangeText,
    placeholder,
    show,
    onToggleShow,
    error,
    disabled = false,
}: PasswordFieldProps) {
    return (
        <View className="gap-1.5">
            <Text className="text-sm font-medium text-gray-600">{label}</Text>
            <View
                className={`flex-row items-center border rounded-lg px-3 py-2.5 bg-white ${error ? 'border-red-400' : 'border-gray-300'
                    }`}
            >
                <TextInput
                    className="flex-1 text-base text-gray-900"
                    placeholder={placeholder}
                    placeholderTextColor="#9CA3AF"
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={!show}
                    autoCapitalize="none"
                    editable={!disabled}
                />
                <TouchableOpacity onPress={onToggleShow} className="pl-2">
                    <Ionicons
                        name={show ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#9CA3AF"
                    />
                </TouchableOpacity>
            </View>
            {error && <Text className="text-xs text-red-500">{error}</Text>}
        </View>
    )
}
