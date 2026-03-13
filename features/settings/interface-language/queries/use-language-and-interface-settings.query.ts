import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'
import { getLanguageAndInterfaceSettings, updateLanguageAndInterfaceSettings } from '../api/interface-language.api'
import { settingsKeys } from '../../queries/keys'
import { refreshSettingsQueries } from '../../queries/shared/settings-mutation.utils'
import type { LanguageAndInterfaceSettings, UserSettings } from '../../schemas'

export const useLanguageAndInterfaceSettingsQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: settingsKeys.languageAndInterface(),
    queryFn: async () => {
      const response = await getLanguageAndInterfaceSettings()
      return response.data.data ?? null
    },
    enabled
  })
}

export const useUpdateLanguageAndInterfaceMutation = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationKey: settingsKeys.updateLanguageAndInterface(),
    mutationFn: (request: Partial<LanguageAndInterfaceSettings>) => updateLanguageAndInterfaceSettings(request),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.languageAndInterface() })
      await queryClient.cancelQueries({ queryKey: settingsKeys.me() })

      const previousSection = queryClient.getQueryData<LanguageAndInterfaceSettings | null>(
        settingsKeys.languageAndInterface()
      )
      const previousMySettings = queryClient.getQueryData<UserSettings | null>(settingsKeys.me())

      if (previousSection) {
        queryClient.setQueryData<LanguageAndInterfaceSettings>(settingsKeys.languageAndInterface(), {
          ...previousSection,
          ...patch
        })
      }

      if (previousMySettings) {
        queryClient.setQueryData<UserSettings>(settingsKeys.me(), {
          ...previousMySettings,
          languageAndInterface: { ...previousMySettings.languageAndInterface, ...patch }
        })
      }

      return { previousSection, previousMySettings }
    },
    onError: (_error, _patch, context) => {
      if (context?.previousSection) {
        queryClient.setQueryData(settingsKeys.languageAndInterface(), context.previousSection)
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
