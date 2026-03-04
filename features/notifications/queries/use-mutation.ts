import { notificationApi } from '@/features/notifications/api/notification.api'
import { useMutation } from '@tanstack/react-query'

export const useRegisterDeviceMutation = () =>
  useMutation({
    mutationFn: notificationApi.registerDevice
  })

export const useUnregisterDeviceMutation = () =>
  useMutation({
    mutationFn: (token: string) => notificationApi.unregisterDevice(token)
  })
