import { useQueryClient } from '@tanstack/react-query'
import { settingsKeys } from '../keys'
import { getMySettings } from '../../general/api/settings.api'
import type { UserSettings } from '../../schemas'

export const mergePatch = <T extends object>(base: T, patch: Partial<T>): T => ({
  ...base,
  ...patch
})

export const refreshSettingsQueries = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await queryClient.invalidateQueries({ queryKey: settingsKeys.me() })
  await queryClient.invalidateQueries({ queryKey: settingsKeys.languageAndInterface() })
  await queryClient.invalidateQueries({ queryKey: settingsKeys.notification() })
  await queryClient.invalidateQueries({ queryKey: settingsKeys.message() })
  await queryClient.invalidateQueries({ queryKey: settingsKeys.call() })
  await queryClient.invalidateQueries({ queryKey: settingsKeys.privacy() })
  await queryClient.invalidateQueries({ queryKey: settingsKeys.contact() })
  await queryClient.invalidateQueries({ queryKey: settingsKeys.backupRestore() })
  await queryClient.invalidateQueries({ queryKey: settingsKeys.accountSecurity() })
  await queryClient.invalidateQueries({ queryKey: settingsKeys.journal() })
  await queryClient.invalidateQueries({ queryKey: settingsKeys.dataOnDevice() })
}

export const getCurrentSettings = async (): Promise<UserSettings> => {
  const response = await getMySettings()
  const data = response.data.data
  if (!data) throw new Error('Failed to load current settings')
  return data
}
