import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deviceManagementApi } from '../api/device-management.api'
import { deviceKeys } from '@/features/device/queries/keys'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'

export const useLogoutDevice = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (sessionId: string) => deviceManagementApi.logoutDevice(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: deviceKeys.myDevices() })
      Toast.show({
        type: 'success',
        text1: t('settings.deviceManagement.logoutDeviceSuccess')
      })
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: t('settings.deviceManagement.logoutDeviceError')
      })
    }
  })
}
