import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query'
import { notificationApi } from '../api/notification.api'
import { notificationKeys } from './keys'
import type {
  NotificationHistoryResponse,
  NotificationFlatHistoryResponse,
  NotificationGroupResponse,
  UserNotificationStateResponse
} from '../schemas/notification.schema'

export const useRegisterDeviceMutation = () =>
  useMutation({
    mutationFn: notificationApi.registerDevice
  })

export const useUnregisterDeviceMutation = () =>
  useMutation({
    mutationFn: (token: string) => notificationApi.unregisterDevice(token)
  })

export const useMarkHistoryAsCheckedMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: notificationApi.markHistoryAsChecked,
    onSuccess: () => {
      queryClient.setQueriesData<UserNotificationStateResponse>({ queryKey: notificationKeys.state() }, (oldState) => {
        if (!oldState) return oldState
        return { ...oldState, unreadCount: 0 }
      })
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    }
  })
}

export const useMarkAsReadMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: (_, notificationId) => {
      queryClient.setQueriesData<InfiniteData<NotificationHistoryResponse | NotificationFlatHistoryResponse>>(
        { queryKey: [...notificationKeys.all, 'my'] },
        (old) => {
          if (!old || !old.pages) return old

          const newPages = old.pages.map((page) => {
            if ('items' in page) {
              return {
                ...page,
                items: page.items.filter((item: NotificationGroupResponse) => item.id !== notificationId)
              }
            }
            const updateList = (list: NotificationGroupResponse[]) =>
              list.map((n) => (n.id === notificationId && !n.read ? { ...n, read: true } : n))
            return {
              ...page,
              newest: updateList(page.newest ?? []),
              today: updateList(page.today ?? []),
              previous: updateList(page.previous ?? [])
            }
          })

          return { ...old, pages: newPages }
        }
      )
    }
  })
}

export const useMarkAllAsReadMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.setQueriesData<InfiniteData<NotificationHistoryResponse | NotificationFlatHistoryResponse>>(
        { queryKey: [...notificationKeys.all, 'my'] },
        (old) => {
          if (!old || !old.pages) return old

          const newPages = old.pages.map((page) => {
            if ('items' in page) {
              return { ...page, items: [] }
            }
            const markRead = (list: NotificationGroupResponse[]) => list.map((n) => ({ ...n, read: true }))
            return {
              ...page,
              newest: markRead(page.newest ?? []),
              today: markRead(page.today ?? []),
              previous: markRead(page.previous ?? [])
            }
          })

          return { ...old, pages: newPages }
        }
      )

      queryClient.setQueriesData<UserNotificationStateResponse>({ queryKey: notificationKeys.state() }, (old) =>
        old ? { ...old, unreadCount: 0 } : old
      )
    }
  })
}
