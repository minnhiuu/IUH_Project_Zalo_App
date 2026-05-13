import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { searchOptions } from './options'
import { MessageSearchFilter } from '../schemas'

export const useSearchUsers = (query: string) => {
  return useQuery(searchOptions.users(query))
}

export const useInfiniteSearchUsers = (query: string) => {
  return useInfiniteQuery(searchOptions.usersInfinite(query))
}

export const useInfiniteSearchContacts = (query: string, isGroup?: boolean) => {
  return useInfiniteQuery(searchOptions.contactsInfinite(query, isGroup))
}

export const useInfiniteSearchMessages = (query: string, filters: MessageSearchFilter[] = []) => {
  return useInfiniteQuery(searchOptions.messagesInfinite(query, filters))
}

export const useInfiniteSearchConversationMessages = (
  conversationId: string,
  query: string,
  filters: MessageSearchFilter[] = []
) => {
  return useInfiniteQuery(searchOptions.conversationMessagesInfinite(conversationId, query, filters))
}

export const useInfiniteSearchMessageGroups = (query: string, filters: MessageSearchFilter[] = []) => {
  return useInfiniteQuery(searchOptions.messageGroupsInfinite(query, filters))
}

export const useInfiniteSearchFiles = (query: string) => {
  return useInfiniteQuery(searchOptions.filesInfinite(query))
}

export const useRecentSearchItems = () => {
  return useQuery(searchOptions.recentItems())
}

export const useRecentSearchQueries = () => {
  return useQuery(searchOptions.recentQueries())
}
