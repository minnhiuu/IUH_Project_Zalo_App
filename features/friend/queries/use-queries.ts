import { useQuery } from '@tanstack/react-query'
import { friendKeys } from './keys'
import { friendApi } from '../api/friend.api'

export const useReceivedFriendRequests = (page: number = 0, size: number = 10, enabled: boolean = true) => {
  return useQuery({
    queryKey: friendKeys.receivedRequests(page, size),
    queryFn: async () => {
      const response = await friendApi.getReceivedFriendRequests(page, size)
      const pageResponse = response.data.data
      return Array.isArray(pageResponse) ? pageResponse : pageResponse?.data || []
    },
    enabled,
    staleTime: 30 * 1000 // 30 seconds
  })
}

export const useSentFriendRequests = (page: number = 0, size: number = 10, enabled: boolean = true) => {
  return useQuery({
    queryKey: friendKeys.sentRequests(page, size),
    queryFn: async () => {
      const response = await friendApi.getSentFriendRequests(page, size)
      const pageResponse = response.data.data
      return Array.isArray(pageResponse) ? pageResponse : pageResponse?.data || []
    },
    enabled,
    staleTime: 30 * 1000
  })
}

export const useMyFriends = (page: number = 0, size: number = 10, enabled: boolean = true) => {
  return useQuery({
    queryKey: friendKeys.myFriends(page, size),
    queryFn: async () => {
      const response = await friendApi.getMyFriends(page, size)
      const pageResponse = response.data.data
      return Array.isArray(pageResponse) ? pageResponse : pageResponse?.data || []
    },
    enabled,
    staleTime: 2 * 60 * 1000 // 2 minutes
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
    staleTime: 0, // Always refetch to get fresh status
    refetchOnMount: true
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
    staleTime: 2 * 60 * 1000
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
    staleTime: 2 * 60 * 1000
  })
}

export const useBatchFriendshipStatus = (targetUserIds: string[], enabled: boolean = true) => {
  return useQuery({
    queryKey: friendKeys.batchStatus(targetUserIds),
    queryFn: async () => {
      const response = await friendApi.batchCheckFriendshipStatus(targetUserIds)
      return response.data.data || {}
    },
    enabled: enabled && targetUserIds.length > 0,
    staleTime: 30 * 1000
  })
}

export const useUnifiedSuggestions = (page: number = 0, size: number = 20, enabled: boolean = true) => {
  return useQuery({
    queryKey: friendKeys.unifiedSuggestions(page, size),
    queryFn: async () => {
      const response = await friendApi.getUnifiedSuggestions(page, size)
      const pageResponse = response.data.data
      if (Array.isArray(pageResponse)) return pageResponse
      return pageResponse?.data || []
    },
    enabled,
    staleTime: 2 * 60 * 1000
  })
}

export const useGraphSuggestions = (page: number = 0, size: number = 20, enabled: boolean = true) => {
  return useQuery({
    queryKey: friendKeys.graphSuggestions(page, size),
    queryFn: async () => {
      const response = await friendApi.getGraphSuggestions(page, size)
      const pageResponse = response.data.data
      if (Array.isArray(pageResponse)) return pageResponse
      return pageResponse?.data || []
    },
    enabled,
    staleTime: 2 * 60 * 1000
  })
}

export const useContactSuggestions = (page: number = 0, size: number = 20, enabled: boolean = true) => {
  return useQuery({
    queryKey: friendKeys.contactSuggestions(page, size),
    queryFn: async () => {
      const response = await friendApi.getContactSuggestions(page, size)
      const pageResponse = response.data.data
      if (Array.isArray(pageResponse)) return pageResponse
      return pageResponse?.data || []
    },
    enabled,
    staleTime: 2 * 60 * 1000
  })
}
