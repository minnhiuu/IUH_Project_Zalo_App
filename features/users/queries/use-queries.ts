import { useQuery } from '@tanstack/react-query'
import { userKeys, blockKeys } from './keys'
import { userApi } from '../api/user.api'
import { blockApi } from '../api/block.api'

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

export const useSearchUsers = (keyword: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: userKeys.search(keyword),
    queryFn: async () => {
      const response = await userApi.searchUsers(keyword)
      return response.data.data.data ?? response.data.data
    },
    enabled: enabled && keyword.length >= 2,
    staleTime: 30 * 1000
  })
}

export const useUserById = (userId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: userKeys.byId(userId),
    queryFn: async () => {
      const response = await userApi.getUserById(userId)
      return response.data.data
    },
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000
  })
}

export const useBlockDetails = (userId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: blockKeys.detail(userId),
    queryFn: async () => {
      try {
        const response = await blockApi.getBlockDetails(userId)
        return response.data.data ?? null
      } catch {
        return null
      }
    },
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000
  })
}

export const useMyBlockedUsers = () => {
  return useQuery({
    queryKey: blockKeys.myBlocks(),
    queryFn: async () => {
      const response = await blockApi.getMyBlockedUsersWithDetails()
      return response.data.data ?? []
    },
    staleTime: 2 * 60 * 1000
  })
}
