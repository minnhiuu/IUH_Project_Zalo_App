import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'
import { getBackupRestoreSettings, updateBackupRestoreSettings } from '../api/backup-restore-settings.api'
import { settingsKeys } from '../../queries/keys'
import { getCurrentSettings, mergePatch, refreshSettingsQueries } from '../../queries/shared/settings-mutation.utils'
import type { BackupRestoreSettings, UserSettings } from '../../schemas'

export const useBackupRestoreSettingsQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: settingsKeys.backupRestore(),
    queryFn: async () => {
      const response = await getBackupRestoreSettings()
      return response.data.data ?? null
    },
    enabled
  })
}

export const useUpdateBackupRestoreSettingsMutation = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationKey: settingsKeys.updateBackupRestore(),
    mutationFn: async (patch: Partial<BackupRestoreSettings>) => {
      const cachedSettings = queryClient.getQueryData<UserSettings | null>(settingsKeys.me())
      const current = cachedSettings ?? (await getCurrentSettings())
      return updateBackupRestoreSettings(mergePatch(current.backupRestoreSettings, patch))
    },
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.backupRestore() })
      await queryClient.cancelQueries({ queryKey: settingsKeys.me() })

      const previousSection = queryClient.getQueryData<BackupRestoreSettings | null>(settingsKeys.backupRestore())
      const previousMySettings = queryClient.getQueryData<UserSettings | null>(settingsKeys.me())

      if (previousSection) {
        queryClient.setQueryData<BackupRestoreSettings>(
          settingsKeys.backupRestore(),
          mergePatch(previousSection, patch)
        )
      }

      if (previousMySettings) {
        queryClient.setQueryData<UserSettings>(settingsKeys.me(), {
          ...previousMySettings,
          backupRestoreSettings: mergePatch(previousMySettings.backupRestoreSettings, patch)
        })
      }

      return { previousSection, previousMySettings }
    },
    onError: (_error, _patch, context) => {
      if (context?.previousSection) {
        queryClient.setQueryData(settingsKeys.backupRestore(), context.previousSection)
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
