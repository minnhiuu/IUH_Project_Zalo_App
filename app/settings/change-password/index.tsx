import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'

import SettingsDetailScreen from '@/components/SettingsDetailScreen'
import { changePasswordRequestSchema } from '@/features/auth/schemas'
import { useChangePasswordMutation } from '@/features/auth/queries/use-mutations'

function PasswordField({ label, value, onChangeText, placeholder, show, onToggleShow, error, disabled }: {
    label: string; value: string; onChangeText: (v: string) => void
    placeholder: string; show: boolean; onToggleShow: () => void
    error?: string; disabled: boolean
}) {
    return (
        <View className="gap-1.5">
            <Text className="text-sm font-medium text-gray-600">{label}</Text>
            <View className={`flex-row items-center border rounded-lg px-3 py-2.5 bg-white ${error ? 'border-red-400' : 'border-gray-300'}`}>
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
                    <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
                </TouchableOpacity>
            </View>
            {error && <Text className="text-xs text-red-500">{error}</Text>}
        </View>
    )
}

export default function ChangePasswordScreen() {
    const { t } = useTranslation()
    const changePasswordMutation = useChangePasswordMutation()

    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showOldPassword, setShowOldPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const handleSubmit = async () => {
        const result = changePasswordRequestSchema.safeParse({ oldPassword, newPassword, confirmPassword })
        if (!result.success) {
            const fieldErrors: Record<string, string> = {}
            result.error.issues.forEach((error) => {
                if (error.path[0]) fieldErrors[error.path[0] as string] = error.message
            })
            setErrors(fieldErrors)
            return
        }
        setErrors({})
        await changePasswordMutation.mutateAsync({ oldPassword, newPassword })
    }

    const isSubmitting = changePasswordMutation.isPending

    return (
        <SettingsDetailScreen title={t('settings.changePassword.title')}>
            <View className="bg-white mt-3 px-4 py-6 gap-5">
                <PasswordField
                    label={t('settings.changePassword.currentPassword')}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    placeholder={t('settings.changePassword.currentPasswordPlaceholder')}
                    show={showOldPassword}
                    onToggleShow={() => setShowOldPassword(!showOldPassword)}
                    error={errors.oldPassword}
                    disabled={isSubmitting}
                />
                <PasswordField
                    label={t('settings.changePassword.newPassword')}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder={t('settings.changePassword.newPasswordPlaceholder')}
                    show={showNewPassword}
                    onToggleShow={() => setShowNewPassword(!showNewPassword)}
                    error={errors.newPassword}
                    disabled={isSubmitting}
                />
                <PasswordField
                    label={t('settings.changePassword.confirmPassword')}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder={t('settings.changePassword.confirmPasswordPlaceholder')}
                    show={showConfirmPassword}
                    onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
                    error={errors.confirmPassword}
                    disabled={isSubmitting}
                />

                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    className={`rounded-lg py-3.5 items-center flex-row justify-center gap-2 ${isSubmitting ? 'opacity-60' : ''}`}
                    style={{ backgroundColor: '#0068FF' }}
                >
                    {isSubmitting && <ActivityIndicator size="small" color="#ffffff" />}
                    <Text className="text-white text-base font-semibold">
                        {isSubmitting ? t('settings.changePassword.changing') : t('settings.changePassword.changeButton')}
                    </Text>
                </TouchableOpacity>
            </View>

            <View className="h-8" />
        </SettingsDetailScreen>
    )
}
