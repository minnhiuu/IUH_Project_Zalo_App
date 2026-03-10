import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'
import { getNotificationSettings, updateNotificationSettings } from '../api/notification-settings.api'
import { settingsKeys } from '../../queries/keys'
import { getCurrentSettings, mergePatch, refreshSettingsQueries } from '../../queries/shared/settings-mutation.utils'
import type { NotificationSettings, UserSettings } from '../../schemas'

export const useNotificationSettingsQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: settingsKeys.notification(),
    queryFn: async () => {
      const response = await getNotificationSettings()
      return response.data.data ?? null
    },
    enabled
  })
}

export const useUpdateNotificationSettingsMutation = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationKey: settingsKeys.updateNotification(),
    mutationFn: async (patch: Partial<NotificationSettings>) => {
      const cachedSettings = queryClient.getQueryData<UserSettings | null>(settingsKeys.me())
      const current = cachedSettings ?? (await getCurrentSettings())
      return updateNotificationSettings(mergePatch(current.notificationSettings, patch))
    },
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.notification() })
      await queryClient.cancelQueries({ queryKey: settingsKeys.me() })

      const previousSection = queryClient.getQueryData<NotificationSettings | null>(settingsKeys.notification())
      const previousMySettings = queryClient.getQueryData<UserSettings | null>(settingsKeys.me())

      if (previousSection) {
        queryClient.setQueryData<NotificationSettings>(settingsKeys.notification(), mergePatch(previousSection, patch))
      }

      if (previousMySettings) {
        queryClient.setQueryData<UserSettings>(settingsKeys.me(), {
          ...previousMySettings,
          notificationSettings: mergePatch(previousMySettings.notificationSettings, patch)
        })
      }

      return { previousSection, previousMySettings }
    },
    onError: (_error, _patch, context) => {
      if (context?.previousSection) {
        queryClient.setQueryData(settingsKeys.notification(), context.previousSection)
      }

      if (context?.previousMySettings) {
        queryClient.setQueryData(settingsKeys.me(), context.previousMySettings)
      }

      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('common.unknownError')
      })
    },
    onSuccess: async () => {
      await refreshSettingsQueries(queryClient)
    }
  })
}
