import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'
import { getMessageSettings, updateMessageSettings } from '../api/message-settings.api'
import { settingsKeys } from '../../queries/keys'
import { getCurrentSettings, mergePatch, refreshSettingsQueries } from '../../queries/shared/settings-mutation.utils'
import type { MessageSettings, UserSettings } from '../../schemas'

export const useMessageSettingsQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: settingsKeys.message(),
    queryFn: async () => {
      const response = await getMessageSettings()
      return response.data.data ?? null
    },
    enabled
  })
}

export const useUpdateMessageSettingsMutation = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationKey: settingsKeys.updateMessage(),
    mutationFn: async (patch: Partial<MessageSettings>) => {
      const cachedSettings = queryClient.getQueryData<UserSettings | null>(settingsKeys.me())
      const current = cachedSettings ?? (await getCurrentSettings())
      return updateMessageSettings(mergePatch(current.messageSettings, patch))
    },
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.message() })
      await queryClient.cancelQueries({ queryKey: settingsKeys.me() })

      const previousSection = queryClient.getQueryData<MessageSettings | null>(settingsKeys.message())
      const previousMySettings = queryClient.getQueryData<UserSettings | null>(settingsKeys.me())

      if (previousSection) {
        queryClient.setQueryData<MessageSettings>(settingsKeys.message(), mergePatch(previousSection, patch))
      }

      if (previousMySettings) {
        queryClient.setQueryData<UserSettings>(settingsKeys.me(), {
          ...previousMySettings,
          messageSettings: mergePatch(previousMySettings.messageSettings, patch)
        })
      }

      return { previousSection, previousMySettings }
    },
    onError: (_error, _patch, context) => {
      if (context?.previousSection) {
        queryClient.setQueryData(settingsKeys.message(), context.previousSection)
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
