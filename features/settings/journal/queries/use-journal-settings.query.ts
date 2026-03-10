import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'
import { getJournalSettings, updateJournalSettings } from '../api/journal-settings.api'
import { settingsKeys } from '../../queries/keys'
import { getCurrentSettings, mergePatch, refreshSettingsQueries } from '../../queries/shared/settings-mutation.utils'
import type { JournalSettings, UserSettings } from '../../schemas'

export const useJournalSettingsQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: settingsKeys.journal(),
    queryFn: async () => {
      const response = await getJournalSettings()
      return response.data.data ?? null
    },
    enabled
  })
}

export const useUpdateJournalSettingsMutation = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationKey: settingsKeys.updateJournal(),
    mutationFn: async (patch: Partial<JournalSettings>) => {
      const cachedSettings = queryClient.getQueryData<UserSettings | null>(settingsKeys.me())
      const current = cachedSettings ?? (await getCurrentSettings())
      return updateJournalSettings(mergePatch(current.journalSettings, patch))
    },
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.journal() })
      await queryClient.cancelQueries({ queryKey: settingsKeys.me() })

      const previousSection = queryClient.getQueryData<JournalSettings | null>(settingsKeys.journal())
      const previousMySettings = queryClient.getQueryData<UserSettings | null>(settingsKeys.me())

      if (previousSection) {
        queryClient.setQueryData<JournalSettings>(settingsKeys.journal(), mergePatch(previousSection, patch))
      }

      if (previousMySettings) {
        queryClient.setQueryData<UserSettings>(settingsKeys.me(), {
          ...previousMySettings,
          journalSettings: mergePatch(previousMySettings.journalSettings, patch)
        })
      }

      return { previousSection, previousMySettings }
    },
    onError: (_error, _patch, context) => {
      if (context?.previousSection) {
        queryClient.setQueryData(settingsKeys.journal(), context.previousSection)
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
