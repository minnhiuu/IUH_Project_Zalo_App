import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { notificationApi } from '../api/notification.api'
import { notificationKeys } from './keys'
import type { NotificationHistoryResponse, NotificationFlatHistoryResponse } from '../schemas/notification.schema'

export const useMyNotificationsQuery = (limit: number = 10, filter: 'all' | 'unread' = 'all') => {
  const apiFilter = filter === 'unread' ? 'UNREAD' : 'ALL'
  return useInfiniteQuery<NotificationHistoryResponse | NotificationFlatHistoryResponse>({
    queryKey: notificationKeys.my({ limit, filter: apiFilter }),
    queryFn: ({ pageParam = null }) => {
      const params = { cursor: pageParam as string | null, limit }
      return filter === 'unread'
        ? notificationApi.getUnreadHistory(params).then((res) => res.data.data)
        : notificationApi.getNotificationHistory(params).then((res) => res.data.data)
    },
    getNextPageParam: (lastPage) => {
      return (lastPage as any).nextCursor ?? undefined
    },
    initialPageParam: null as string | null,
    staleTime: 30 * 1000
  })
}

export const useNotificationStateQuery = () => {
  return useQuery({
    queryKey: notificationKeys.state(),
    queryFn: () => notificationApi.getNotificationState().then((res) => res.data.data),
    staleTime: 30 * 1000
  })
}
