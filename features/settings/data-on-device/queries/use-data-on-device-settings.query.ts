import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'
import { getDataOnDeviceSettings, updateDataOnDeviceSettings } from '../api/data-on-device-settings.api'
import { settingsKeys } from '../../queries/keys'
import { getCurrentSettings, mergePatch, refreshSettingsQueries } from '../../queries/shared/settings-mutation.utils'
import type { DataOnDeviceSettings, UserSettings } from '../../schemas'

export const useDataOnDeviceSettingsQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: settingsKeys.dataOnDevice(),
    queryFn: async () => {
      const response = await getDataOnDeviceSettings()
      return response.data.data ?? null
    },
    enabled
  })
}

export const useUpdateDataOnDeviceSettingsMutation = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationKey: settingsKeys.updateDataOnDevice(),
    mutationFn: async (patch: Partial<DataOnDeviceSettings>) => {
      const cachedSettings = queryClient.getQueryData<UserSettings | null>(settingsKeys.me())
      const current = cachedSettings ?? (await getCurrentSettings())
      return updateDataOnDeviceSettings(mergePatch(current.dataOnDeviceSettings, patch))
    },
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.dataOnDevice() })
      await queryClient.cancelQueries({ queryKey: settingsKeys.me() })

      const previousSection = queryClient.getQueryData<DataOnDeviceSettings | null>(settingsKeys.dataOnDevice())
      const previousMySettings = queryClient.getQueryData<UserSettings | null>(settingsKeys.me())

      if (previousSection) {
        queryClient.setQueryData<DataOnDeviceSettings>(settingsKeys.dataOnDevice(), mergePatch(previousSection, patch))
      }

      if (previousMySettings) {
        queryClient.setQueryData<UserSettings>(settingsKeys.me(), {
          ...previousMySettings,
          dataOnDeviceSettings: mergePatch(previousMySettings.dataOnDeviceSettings, patch)
        })
      }

      return { previousSection, previousMySettings }
    },
    onError: (_error, _patch, context) => {
      if (context?.previousSection) {
        queryClient.setQueryData(settingsKeys.dataOnDevice(), context.previousSection)
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
