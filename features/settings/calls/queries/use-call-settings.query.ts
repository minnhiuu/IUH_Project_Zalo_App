import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'
import { getCallSettings, updateCallSettings } from '../api/call-settings.api'
import { settingsKeys } from '../../queries/keys'
import { getCurrentSettings, mergePatch, refreshSettingsQueries } from '../../queries/shared/settings-mutation.utils'
import type { CallSettings, UserSettings } from '../../schemas'

export const useCallSettingsQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: settingsKeys.call(),
    queryFn: async () => {
      const response = await getCallSettings()
      return response.data.data ?? null
    },
    enabled
  })
}

export const useUpdateCallSettingsMutation = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationKey: settingsKeys.updateCall(),
    mutationFn: async (patch: Partial<CallSettings>) => {
      const cachedSettings = queryClient.getQueryData<UserSettings | null>(settingsKeys.me())
      const current = cachedSettings ?? (await getCurrentSettings())
      return updateCallSettings(mergePatch(current.callSettings, patch))
    },
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.call() })
      await queryClient.cancelQueries({ queryKey: settingsKeys.me() })

      const previousSection = queryClient.getQueryData<CallSettings | null>(settingsKeys.call())
      const previousMySettings = queryClient.getQueryData<UserSettings | null>(settingsKeys.me())

      if (previousSection) {
        queryClient.setQueryData<CallSettings>(settingsKeys.call(), mergePatch(previousSection, patch))
      }

      if (previousMySettings) {
        queryClient.setQueryData<UserSettings>(settingsKeys.me(), {
          ...previousMySettings,
          callSettings: mergePatch(previousMySettings.callSettings, patch)
        })
      }

      return { previousSection, previousMySettings }
    },
    onError: (_error, _patch, context) => {
      if (context?.previousSection) {
        queryClient.setQueryData(settingsKeys.call(), context.previousSection)
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
