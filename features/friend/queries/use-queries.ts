import { useQuery } from '@tanstack/react-query'
import { friendKeys } from './keys'
import { friendApi } from '../api/friend.api'

export const useReceivedFriendRequests = (enabled: boolean = true) => {
  return useQuery({
    queryKey: friendKeys.receivedRequests(),
    queryFn: async () => {
      const response = await friendApi.getReceivedFriendRequests()
      // Extract data from PageResponse structure
      return (response.data?.data as any)?.data ?? []
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export const useSentFriendRequests = (enabled: boolean = true) => {
  return useQuery({
    queryKey: friendKeys.sentRequests(),
    queryFn: async () => {
      const response = await friendApi.getSentFriendRequests()
      // Extract data from PageResponse structure
      return (response.data?.data as any)?.data ?? []
    },
    enabled,
    staleTime: 30 * 1000,
  })
}

export const useMyFriends = (enabled: boolean = true) => {
  return useQuery({
    queryKey: friendKeys.myFriends(),
    queryFn: async () => {
      const response = await friendApi.getMyFriends()
      // Extract data from PageResponse structure
      return (response.data?.data as any)?.data ?? []
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useFriendshipStatus = (userId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: friendKeys.status(userId),
    queryFn: async () => {
      const response = await friendApi.checkFriendshipStatus(userId)
      return response.data.data
    },
    enabled: enabled && !!userId,
    staleTime: 60 * 1000, // 1 minute
  })
}

export const useMutualFriends = (userId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: friendKeys.mutual(userId),
    queryFn: async () => {
      const response = await friendApi.getMutualFriends(userId)
      return response.data.data
    },
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

export const useMutualFriendsCount = (userId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: friendKeys.mutualCount(userId),
    queryFn: async () => {
      const response = await friendApi.getMutualFriendsCount(userId)
      return response.data.data
    },
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000,
  })
}
