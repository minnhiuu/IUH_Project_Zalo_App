import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'

import SettingsDetailScreen from '@/components/settings-detail-screen'
import { PasswordField } from '@/features/settings/change-password'
import { changePasswordRequestSchema } from '@/features/auth/schemas'
import { useChangePasswordMutation } from '@/features/auth/queries/use-mutations'

export default function ChangePasswordScreen() {
  const { t } = useTranslation()
  const changePasswordMutation = useChangePasswordMutation()

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [logoutOtherDevices, setLogoutOtherDevices] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async () => {
    const result = changePasswordRequestSchema.safeParse({ oldPassword, newPassword, confirmPassword })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((error) => {
        if (error.path[0]) fieldErrors[error.path[0] as string] = t(error.message as any)
      })
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    await changePasswordMutation.mutateAsync({ oldPassword, newPassword, confirmPassword, logoutOtherDevices })
  }

  const isSubmitting = changePasswordMutation.isPending

  return (
    <SettingsDetailScreen title={t('settings.changePassword.title')}>
      <View className='bg-white mt-3 px-4 py-6 gap-5'>
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
          onPress={() => setLogoutOtherDevices(!logoutOtherDevices)}
          disabled={isSubmitting}
          activeOpacity={0.7}
          className='flex-row items-center justify-between py-2'
        >
          <Text className='text-sm font-medium text-gray-700'>{t('settings.deviceManagement.logoutOthers')}</Text>
          <View
            className={`w-11 h-6 rounded-full justify-center px-1 transition-colors ${logoutOtherDevices ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <View
              className={`w-4 h-4 rounded-full bg-white transition-transform ${logoutOtherDevices ? 'translate-x-5' : 'translate-x-0'}`}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          className={`rounded-lg py-3.5 items-center flex-row justify-center gap-2 ${isSubmitting ? 'opacity-60' : ''}`}
          style={{ backgroundColor: '#0068FF' }}
        >
          {isSubmitting && <ActivityIndicator size='small' color='#ffffff' />}
          <Text className='text-white text-base font-semibold'>
            {isSubmitting ? t('settings.changePassword.changing') : t('settings.changePassword.changeButton')}
          </Text>
        </TouchableOpacity>
      </View>

      <View className='h-8' />
    </SettingsDetailScreen>
  )
}
