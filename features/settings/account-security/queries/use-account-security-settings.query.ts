import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'
import { getAccountSecuritySettings, updateAccountSecuritySettings } from '../api/account-security-settings.api'
import { settingsKeys } from '../../queries/keys'
import { getCurrentSettings, mergePatch, refreshSettingsQueries } from '../../queries/shared/settings-mutation.utils'
import type { AccountSecuritySettings, UserSettings } from '../../schemas'

export const useAccountSecuritySettingsQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: settingsKeys.accountSecurity(),
    queryFn: async () => {
      const response = await getAccountSecuritySettings()
      return response.data.data ?? null
    },
    enabled
  })
}

export const useUpdateAccountSecuritySettingsMutation = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationKey: settingsKeys.updateAccountSecurity(),
    mutationFn: async (patch: Partial<AccountSecuritySettings>) => {
      const cachedSettings = queryClient.getQueryData<UserSettings | null>(settingsKeys.me())
      const current = cachedSettings ?? (await getCurrentSettings())
      return updateAccountSecuritySettings(mergePatch(current.accountSecuritySettings, patch))
    },
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.accountSecurity() })
      await queryClient.cancelQueries({ queryKey: settingsKeys.me() })

      const previousAccountSecurity = queryClient.getQueryData<AccountSecuritySettings | null>(
        settingsKeys.accountSecurity()
      )
      const previousMySettings = queryClient.getQueryData<UserSettings | null>(settingsKeys.me())

      if (previousAccountSecurity) {
        queryClient.setQueryData<AccountSecuritySettings>(
          settingsKeys.accountSecurity(),
          mergePatch(previousAccountSecurity, patch)
        )
      }

      if (previousMySettings) {
        queryClient.setQueryData<UserSettings>(settingsKeys.me(), {
          ...previousMySettings,
          accountSecuritySettings: mergePatch(previousMySettings.accountSecuritySettings, patch)
        })
      }

      return { previousAccountSecurity, previousMySettings }
    },
    onError: (_error, _patch, context) => {
      if (context?.previousAccountSecurity) {
        queryClient.setQueryData(settingsKeys.accountSecurity(), context.previousAccountSecurity)
      }

      if (context?.previousMySettings) {
        queryClient.setQueryData(settingsKeys.me(), context.previousMySettings)
      }

      Toast.show({
        type: 'error',
        text1: t('common.error'),
        text2: t('settings.accountSecurity.updateFailed')
      })
    },
    onSuccess: async () => {
      await refreshSettingsQueries(queryClient)
    }
  })
}
