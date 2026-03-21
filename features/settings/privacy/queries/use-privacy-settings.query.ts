import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'
import { getPrivacySettings, updatePrivacySettings } from '../api/privacy-settings.api'
import { settingsKeys } from '../../queries/keys'
import { getCurrentSettings, mergePatch, refreshSettingsQueries } from '../../queries/shared/settings-mutation.utils'
import type { PrivacySettings, UserSettings } from '../../schemas'

export const usePrivacySettingsQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: settingsKeys.privacy(),
    queryFn: async () => {
      const response = await getPrivacySettings()
      return response.data.data ?? null
    },
    enabled
  })
}

export const useUpdatePrivacySettingsMutation = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationKey: settingsKeys.updatePrivacy(),
    mutationFn: async (patch: Partial<PrivacySettings>) => {
      const cachedSettings = queryClient.getQueryData<UserSettings | null>(settingsKeys.me())
      const current = cachedSettings ?? (await getCurrentSettings())
      return updatePrivacySettings(mergePatch(current.privacySettings, patch))
    },
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.privacy() })
      await queryClient.cancelQueries({ queryKey: settingsKeys.me() })

      const previousSection = queryClient.getQueryData<PrivacySettings | null>(settingsKeys.privacy())
      const previousMySettings = queryClient.getQueryData<UserSettings | null>(settingsKeys.me())

      if (previousSection) {
        queryClient.setQueryData<PrivacySettings>(settingsKeys.privacy(), mergePatch(previousSection, patch))
      }

      if (previousMySettings) {
        queryClient.setQueryData<UserSettings>(settingsKeys.me(), {
          ...previousMySettings,
          privacySettings: mergePatch(previousMySettings.privacySettings, patch)
        })
      }

      return { previousSection, previousMySettings }
    },
    onError: (_error, _patch, context) => {
      if (context?.previousSection) {
        queryClient.setQueryData(settingsKeys.privacy(), context.previousSection)
      }

      if (context?.previousMySettings) {
        queryClient.setQueryData(settingsKeys.me(), context.previousMySettings)
      }

      if (isAxiosError(_error) && _error.response?.status === 401) {
        return
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
