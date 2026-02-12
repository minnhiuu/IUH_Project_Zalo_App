import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { searchApi } from '../api/search.api'
import { searchKeys } from './keys'

export const useSearchUsers = (query: string) => {
  return useQuery({
    queryKey: searchKeys.users(query),
    queryFn: async () => {
      const response = await searchApi.searchUsers(query, 0, 10)
      return response.data.data
    },
    enabled: !!query,
    staleTime: 1000 * 60
  })
}

export const useInfiniteSearchUsers = (query: string) => {
  return useInfiniteQuery({
    queryKey: searchKeys.usersInfinite(query),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await searchApi.searchUsers(query, pageParam as number, 10)
      return response.data.data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1
      return nextPage < lastPage.totalPages ? nextPage : undefined
    },
    enabled: !!query
  })
}
