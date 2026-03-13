import { useQuery } from '@tanstack/react-query'
import { getMySettings } from '../api/settings.api'
import { settingsKeys } from '../../queries/keys'

export const useMySettingsQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: settingsKeys.me(),
    queryFn: async () => {
      const response = await getMySettings()
      return response.data.data ?? null
    },
    enabled
  })
}
