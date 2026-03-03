import React from 'react'
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'

import { useLogoutMutation } from '../queries'

interface LogoutButtonProps {
  className?: string
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ className }) => {
  const { t } = useTranslation()
  const { mutate: logout, isPending } = useLogoutMutation()
  const [showConfirm, setShowConfirm] = React.useState(false)

  const handleLogout = () => {
    setShowConfirm(false)
    logout()
  }

  return (
    <>
      <TouchableOpacity
        onPress={() => setShowConfirm(true)}
        disabled={isPending}
        className={`bg-red-500 rounded-xl py-3 px-6 items-center ${className}`}
      >
        {isPending ? (
          <ActivityIndicator color='white' />
        ) : (
          <Text className='text-white font-semibold'>{t('auth.logout.logoutButton')}</Text>
        )}
      </TouchableOpacity>

      {/* Confirmation Modal */}
      <Modal visible={showConfirm} transparent animationType='fade' onRequestClose={() => setShowConfirm(false)}>
        <View className='flex-1 bg-black/50 justify-center items-center px-6'>
          <View className='bg-white rounded-2xl p-6 w-full max-w-sm'>
            <Text className='text-xl font-semibold text-gray-800 text-center mb-4'>
              {t('auth.logout.confirmTitle')}
            </Text>
            <Text className='text-gray-600 text-center mb-6'>{t('auth.logout.confirmMessage')}</Text>

            <View className='flex-row space-x-3'>
              <TouchableOpacity
                className='flex-1 bg-gray-200 rounded-xl py-3 items-center mr-2'
                onPress={() => setShowConfirm(false)}
              >
                <Text className='text-gray-700 font-medium'>{t('auth.logout.cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity className='flex-1 bg-red-500 rounded-xl py-3 items-center ml-2' onPress={handleLogout}>
                <Text className='text-white font-medium'>{t('auth.logout.confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
}

export default LogoutButton
