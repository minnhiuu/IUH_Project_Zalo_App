import { useQuery } from '@tanstack/react-query'
import { deviceApi } from '../api/device.api'
import { deviceKeys } from './keys'

export const useMyDevices = () => {
  return useQuery({
    queryKey: deviceKeys.myDevices(),
    queryFn: async () => {
      const response = await deviceApi.getMyDevices()
      return response.data.data
    }
  })
}
