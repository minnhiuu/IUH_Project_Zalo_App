import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { messageKeys } from './keys'
import { messageApi } from '../api/message.api'

export const useConversations = (page: number = 0, size: number = 20, enabled: boolean = true) => {
  return useQuery({
    queryKey: messageKeys.conversationList(page, size),
    queryFn: async () => {
      const response = await messageApi.getConversations(page, size)
      return response.data.data?.data ?? []
    },
    enabled,
    staleTime: 30 * 1000,
  })
}

export const useMessages = (conversationId: string, page: number = 0, size: number = 20, enabled: boolean = true) => {
  return useQuery({
    queryKey: messageKeys.messageList(conversationId, page, size),
    queryFn: async () => {
      const response = await messageApi.getMessages(conversationId, page, size)
      return response.data.data
    },
    enabled: enabled && !!conversationId,
    staleTime: 0,
  })
}

export const useInfiniteMessages = (conversationId: string, size: number = 20, enabled: boolean = true) => {
  return useInfiniteQuery({
    queryKey: messageKeys.messages(conversationId),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await messageApi.getMessages(conversationId, pageParam, size)
      return response.data.data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages - 1) {
        return lastPage.page + 1
      }
      return undefined
    },
    enabled: enabled && !!conversationId,
    staleTime: 0,
  })
}

export const usePartnerConversation = (partnerId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: messageKeys.partnerConversation(partnerId),
    queryFn: async () => {
      const response = await messageApi.getOrCreateConversation(partnerId)
      return response.data.data
    },
    enabled: enabled && !!partnerId,
    staleTime: 5 * 60 * 1000,
  })
}
