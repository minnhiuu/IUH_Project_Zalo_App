import { searchApi } from '../api/search.api'
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

  usersInfinite: (query: string) => ({
    queryKey: searchKeys.usersInfinite(query),
    queryFn: async ({ pageParam = 0 }) => {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const response = await searchApi.searchUsers(query, pageParam as number, 10)
      return response.data.data
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage: any) => {
      const nextPage = lastPage.page + 1
      return nextPage < lastPage.totalPages ? nextPage : undefined
    },
    enabled: !!query
  })
}
