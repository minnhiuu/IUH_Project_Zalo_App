import React, { useState } from 'react'
import { Box, VStack, HStack, Text, Input, InputField, InputSlot, Button, ButtonText } from '@/components/ui'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity } from 'react-native'

import SettingsDetailScreen from '@/components/SettingsDetailScreen'
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

 const [errors, setErrors] = useState<Record<string, string>>({})

 const handleSubmit = async () => {
 // Validate form
 const result = changePasswordRequestSchema.safeParse({
 oldPassword,
 newPassword,
 confirmPassword
 })

 if (!result.success) {
 // Extract errors
 const fieldErrors: Record<string, string> = {}
 result.error.issues.forEach((error) => {
 if (error.path[0]) {
 fieldErrors[error.path[0] as string] = error.message
 }
 })
 setErrors(fieldErrors)
 return
 }

 // Clear errors and submit
 setErrors({})
 await changePasswordMutation.mutateAsync({
 oldPassword,
 newPassword
 })
 }

 const isSubmitting = changePasswordMutation.isPending

 return (
 <SettingsDetailScreen title={t('settings.changePassword.title')}>
 <Box className="bg-white mt-2 px-4 py-6">
 <VStack space="lg">
 {/* Current Password */}
 <VStack space="xs">
 <Text size="sm" className="text-gray-600 font-medium">
 {t('settings.changePassword.currentPassword')}
 </Text>
 <Input isInvalid={!!errors.oldPassword} isDisabled={isSubmitting}>
 <InputField
 placeholder={t('settings.changePassword.currentPasswordPlaceholder')}
 value={oldPassword}
 onChangeText={setOldPassword}
 secureTextEntry={!showOldPassword}
 autoCapitalize='none'
 />
 <InputSlot className="pr-3">
 <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
 <Ionicons name={showOldPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color='#9CA3AF' />
 </TouchableOpacity>
 </InputSlot>
 </Input>
 {errors.oldPassword && (
 <Text size='xs' className="text-red-500">
 {errors.oldPassword}
 </Text>
 )}
 </VStack>

 {/* New Password */}
 <VStack space="xs">
 <Text size="sm" className="text-gray-600 font-medium">
 {t('settings.changePassword.newPassword')}
 </Text>
 <Input isInvalid={!!errors.newPassword} isDisabled={isSubmitting}>
 <InputField
 placeholder={t('settings.changePassword.newPasswordPlaceholder')}
 value={newPassword}
 onChangeText={setNewPassword}
 secureTextEntry={!showNewPassword}
 autoCapitalize='none'
 />
 <InputSlot className="pr-3">
 <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
 <Ionicons name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color='#9CA3AF' />
 </TouchableOpacity>
 </InputSlot>
 </Input>
 {errors.newPassword && (
 <Text size='xs' className="text-red-500">
 {errors.newPassword}
 </Text>
 )}
 </VStack>

 {/* Confirm Password */}
 <VStack space="xs">
 <Text size="sm" className="text-gray-600 font-medium">
 {t('settings.changePassword.confirmPassword')}
 </Text>
 <Input isInvalid={!!errors.confirmPassword} isDisabled={isSubmitting}>
 <InputField
 placeholder={t('settings.changePassword.confirmPasswordPlaceholder')}
 value={confirmPassword}
 onChangeText={setConfirmPassword}
 secureTextEntry={!showConfirmPassword}
 autoCapitalize='none'
 />
 <InputSlot className="pr-3">
 <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
 <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color='#9CA3AF' />
 </TouchableOpacity>
 </InputSlot>
 </Input>
 {errors.confirmPassword && (
 <Text size='xs' className="text-red-500">
 {errors.confirmPassword}
 </Text>
 )}
 </VStack>

 {/* Submit Button */}
 <Box className="mt-4">
 <Button
 onPress={handleSubmit}
 isDisabled={isSubmitting}
 style={{
 backgroundColor: '#0068FF',
 borderRadius: 8,
 paddingVertical: 14,
 alignItems: 'center',
 opacity: isSubmitting ? 0.6 : 1
 }}
 >
 <ButtonText style={{ color: '#ffffff', fontSize: 16, fontWeight: '600' }}>
 {isSubmitting ? t('settings.changePassword.changing') : t('settings.changePassword.changeButton')}
 </ButtonText>
 </Button>
 </Box>
 </VStack>
 </Box>
 </SettingsDetailScreen>
 )
}
