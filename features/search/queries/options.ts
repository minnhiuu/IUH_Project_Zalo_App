import { searchApi } from '../api/search.api'
import { MessageSearchFilter } from '../schemas'
import { searchKeys } from './keys'

export const searchOptions = {
  users: (query: string) => ({
    queryKey: searchKeys.users(query),
    queryFn: async () => {
      const response = await searchApi.searchUsers(query, 0, 10)
      return response.data.data
    },
    enabled: !!query,
    staleTime: 1000 * 60
  }),

  usersInfinite: (query: string, enabled: boolean = true) => ({
    queryKey: searchKeys.usersInfinite(query),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await searchApi.searchUsers(query, pageParam as number, 10)
      return response.data.data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: any) => {
      const nextPage = lastPage.page + 1
      return nextPage < lastPage.totalPages ? nextPage : undefined
    },
    enabled: enabled && !!query,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  }),

  contactsInfinite: (query: string, isGroup?: boolean, enabled: boolean = true) => ({
    queryKey: searchKeys.contactsInfinite(query, isGroup),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await searchApi.searchContacts(query, pageParam as number, 10, isGroup)
      return response.data.data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: any) => {
      const nextPage = lastPage.page + 1
      return nextPage < lastPage.totalPages ? nextPage : undefined
    },
    enabled: enabled && !!query
  }),

  messagesInfinite: (query: string, filters: MessageSearchFilter[] = [], enabled: boolean = true) => ({
    queryKey: searchKeys.messagesInfinite(query, filters),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await searchApi.searchMessages({ keyword: query, filters }, pageParam as number, 10)
      return response.data.data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: any) => {
      const nextPage = lastPage.page + 1
      return nextPage < lastPage.totalPages ? nextPage : undefined
    },
    enabled: enabled && !!query,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  }),

  conversationMessagesInfinite: (conversationId: string, query: string, filters: MessageSearchFilter[] = []) => ({
    queryKey: searchKeys.conversationMessagesInfinite(conversationId, query, filters),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await searchApi.searchMessages(
        { keyword: query, conversationId, filters },
        pageParam as number,
        20
      )
      return response.data.data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: any) => {
      const nextPage = lastPage.page + 1
      return nextPage < lastPage.totalPages ? nextPage : undefined
    },
    enabled: !!query && !!conversationId
  }),

  messageGroupsInfinite: (query: string, filters: MessageSearchFilter[] = [], enabled: boolean = true) => ({
    queryKey: searchKeys.messageGroupsInfinite(query, filters),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await searchApi.searchMessageGroups({ keyword: query, filters }, pageParam as number, 10)
      return response.data.data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: any) => {
      const nextPage = lastPage.page + 1
      return nextPage < lastPage.totalPages ? nextPage : undefined
    },
    enabled: enabled && !!query,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  }),

  messageSenders: (query: string, enabled: boolean = true) => ({
    queryKey: searchKeys.messageSenders(query),
    queryFn: async () => {
      const response = await searchApi.searchMessageSenders(query)
      return response.data.data
    },
    enabled: enabled && !!query,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  }),

  filesInfinite: (query: string) => ({
    queryKey: searchKeys.filesInfinite(query),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await searchApi.searchFiles({ keyword: query }, pageParam as number, 10)
      return response.data.data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: any) => {
      const nextPage = lastPage.page + 1
      return nextPage < lastPage.totalPages ? nextPage : undefined
    },
    enabled: !!query
  }),

  recentItems: () => ({
    queryKey: searchKeys.recentItems(),
    queryFn: async () => {
      const response = await searchApi.getRecentItems()
      return response.data.data
    },
    staleTime: 1000 * 30
  }),

  recentQueries: () => ({
    queryKey: searchKeys.recentQueries(),
    queryFn: async () => {
      const response = await searchApi.getRecentQueries()
      return response.data.data
    },
    staleTime: 1000 * 30
  })
}
