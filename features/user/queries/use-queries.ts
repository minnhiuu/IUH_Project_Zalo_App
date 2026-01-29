import { useQuery } from '@tanstack/react-query'
import { userKeys } from './keys'
import { userApi } from '../api/user.api'

export const useMyProfile = () => {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: async () => {
      const response = await userApi.getMyProfile()
      return response.data.data
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  })
}
