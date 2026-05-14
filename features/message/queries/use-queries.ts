import { keepPreviousData, useQuery, useInfiniteQuery, type InfiniteData } from '@tanstack/react-query'
import type { CursorPageResponse } from '@/types/common.types'
import { messageKeys } from './keys'
import { messageApi } from '../api/message.api'
import type { MessageResponse } from '../schemas'

type MessageCursorPageParam = {
  cursor?: string | null
  limit?: number
  direction?: 'OLDER' | 'NEWER'
  aroundMessageId?: string | null
}

export const useFriendsDirectory = (conversationId?: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: messageKeys.friendsDirectory(conversationId),
    queryFn: async () => {
      const response = await messageApi.getFriendsDirectory(conversationId)
      return response.data.data ?? {}
    },
    enabled
  })
}

export const useSearchMembersInfinite = (query: string, conversationId?: string | null, enabled: boolean = true) => {
  return useInfiniteQuery({
    queryKey: messageKeys.searchMembers(query, conversationId),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await messageApi.searchMembersToAdd(query, pageParam as number, 20, conversationId)
      return response.data.data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage && lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: enabled && !!query
  })
}

export const useConversations = (page: number = 0, size: number = 20, enabled: boolean = true) => {
  return useQuery({
    queryKey: messageKeys.conversationList(page, size),
    queryFn: async () => {
      const response = await messageApi.getConversations(page, size)
      return response.data.data?.data ?? []
    },
    enabled,
    staleTime: 30 * 1000
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
    placeholderData: keepPreviousData,
    staleTime: 0
  })
}

export const useInfiniteMessages = (
  conversationId: string,
  size: number = 20,
  enabled: boolean = true,
  aroundMessageId?: string | null
) => {
  const queryKey = messageKeys.messages(conversationId, aroundMessageId)
  const initialPageParam: MessageCursorPageParam = aroundMessageId
    ? { limit: size, aroundMessageId }
    : { limit: size, direction: 'OLDER', cursor: null }

  return useInfiniteQuery<
    CursorPageResponse<MessageResponse>,
    Error,
    InfiniteData<CursorPageResponse<MessageResponse>, MessageCursorPageParam>,
    typeof queryKey,
    MessageCursorPageParam
  >({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const params = pageParam ?? initialPageParam
      const response = await messageApi.getMessagesV2(conversationId, params)
      return response.data.data
    },
    initialPageParam,
    getNextPageParam: (lastPage) => {
      if (typeof lastPage?.olderCursor === 'string' && lastPage.hasMoreOlder) {
        return { cursor: lastPage.olderCursor, direction: 'OLDER', limit: size }
      }
      return undefined
    },
    getPreviousPageParam: (firstPage) => {
      if (typeof firstPage?.newerCursor === 'string' && firstPage.hasMoreNewer) {
        return { cursor: firstPage.newerCursor, direction: 'NEWER', limit: size }
      }
      return undefined
    },
    enabled: enabled && !!conversationId,
    staleTime: 0
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
    staleTime: 5 * 60 * 1000
  })
}

export const useMediaMessages = (
  conversationId: string,
  types: string[] = ['IMAGE', 'VIDEO'],
  page: number = 0,
  size: number = 50,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: messageKeys.media(conversationId, types),
    queryFn: async () => {
      const response = await messageApi.getMediaMessages(conversationId, types, page, size)
      return response.data.data?.data ?? []
    },
    enabled: enabled && !!conversationId,
    staleTime: 30 * 1000
  })
}

export const usePinnedMessages = (conversationId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: messageKeys.pins(conversationId),
    queryFn: async () => {
      const response = await messageApi.getPinnedMessages(conversationId)
      return response.data.data ?? []
    },
    enabled: enabled && !!conversationId,
    staleTime: 15 * 1000
  })
}

export const useConversationParticipants = (conversationId: string, query: string = '', enabled: boolean = true) => {
  return useQuery({
    queryKey: messageKeys.participants(conversationId, query),
    queryFn: async () => {
      const response = await messageApi.getConversationParticipants(conversationId, { query, page: 0, size: 50 })
      return response.data.data?.data ?? []
    },
    enabled: enabled && !!conversationId,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  })
}

export const useGroupMembersInfinite = (conversationId: string, query: string, enabled: boolean = true) => {
  return useInfiniteQuery({
    queryKey: messageKeys.groupMembers(conversationId, query),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await messageApi.getGroupMembers(conversationId, { query, page: pageParam as number, size: 20 })
      return response.data.data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage && lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: enabled && !!conversationId
  })
}

export const useGroupAdminsInfinite = (conversationId: string, enabled: boolean = true) => {
  return useInfiniteQuery({
    queryKey: messageKeys.groupAdmins(conversationId),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await messageApi.getGroupAdmins(conversationId, pageParam as number, 20)
      return response.data.data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage && lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: enabled && !!conversationId
  })
}

export const useAdminCandidatesInfinite = (conversationId: string, query: string, enabled: boolean = true) => {
  return useInfiniteQuery({
    queryKey: messageKeys.adminCandidates(conversationId, query),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await messageApi.getAdminCandidates(conversationId, query, pageParam as number, 20)
      return response.data.data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage && lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: enabled && !!conversationId
  })
}

export const useJoinPreview = (token: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: messageKeys.joinPreview(token),
    queryFn: async () => {
      const response = await messageApi.getJoinPreview(token)
      return response.data.data
    },
    enabled: enabled && !!token
  })
}

export const useJoinRequestsInfinite = (conversationId: string, enabled: boolean = true) => {
  return useInfiniteQuery({
    queryKey: messageKeys.joinRequests(conversationId),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await messageApi.getJoinRequests(conversationId, pageParam as number, 20)
      return response.data.data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage && lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: enabled && !!conversationId
  })
}

export const useBlockedMembersInfinite = (conversationId: string, enabled: boolean = true) => {
  return useInfiniteQuery({
    queryKey: messageKeys.blockedMembers(conversationId),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await messageApi.getBlockedMembers(conversationId, pageParam as number, 20)
      return response.data.data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage && lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: enabled && !!conversationId
  })
}

export const useBlockCandidatesInfinite = (conversationId: string, query: string, enabled: boolean = true) => {
  return useInfiniteQuery({
    queryKey: messageKeys.blockCandidates(conversationId, query),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await messageApi.getBlockCandidates(conversationId, query, pageParam as number, 20)
      return response.data.data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage && lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
    enabled: enabled && !!conversationId
  })
}

export const useMyGroups = (
  query: string,
  sort: string,
  filter: string,
  page: number,
  size = 20,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: messageKeys.myGroups(query, sort, filter, page),
    queryFn: async () => {
      const response = await messageApi.getMyGroupConversations({ query, sort, filter, page, size })
      return response.data.data
    },
    enabled
  })
}
