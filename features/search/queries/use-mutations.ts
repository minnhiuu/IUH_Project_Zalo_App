import { useMutation, useQueryClient } from '@tanstack/react-query'
import { searchApi } from '../api/search.api'
import { searchKeys } from './keys'
import { RecentSearchRequest } from '../schemas/search-schema'
import { SearchType } from '@/constants/enum'

export const useAddRecentSearch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: RecentSearchRequest) => searchApi.addSearchItem(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.recentItems() })
      queryClient.invalidateQueries({ queryKey: searchKeys.recentQueries() })
    }
  })
}

export const useRemoveRecentSearch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, type }: { id: string; type: SearchType }) => searchApi.removeItem(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.recentItems() })
      queryClient.invalidateQueries({ queryKey: searchKeys.recentQueries() })
    }
  })
}

export const useClearAllRecentSearch = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => searchApi.clearAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: searchKeys.recentItems() })
      queryClient.invalidateQueries({ queryKey: searchKeys.recentQueries() })
    }
  })
}
