import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { searchOptions } from './options'

export const useSearchUsers = (query: string) => {
  return useQuery(searchOptions.users(query))
}

export const useInfiniteSearchUsers = (query: string) => {
  return useInfiniteQuery(searchOptions.usersInfinite(query))
}

export const useRecentSearchItems = () => {
  return useQuery(searchOptions.recentItems())
}

export const useRecentSearchQueries = () => {
  return useQuery(searchOptions.recentQueries())
}
