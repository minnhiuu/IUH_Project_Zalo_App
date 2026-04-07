import { useMutation, useQueryClient } from '@tanstack/react-query'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'

import { friendApi } from '../api/friend.api'
import { friendKeys } from './keys'
import { handleErrorApi } from '@/utils/error-handler'
import type { FriendRequestSendRequest } from '../schemas'

export const useSendFriendRequest = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: FriendRequestSendRequest) => friendApi.sendFriendRequest(request),
    onSuccess: (_data, variables) => {
      // Invalidate and immediately refetch status for the receiver
      queryClient.invalidateQueries({ queryKey: friendKeys.sentRequests() })
      queryClient.refetchQueries({ queryKey: friendKeys.status(variables.receiverId) })

      Toast.show({
        type: 'success',
        text1: t('friend.toast.sendSuccess'),
        visibilityTime: 2000,
      })
    },
    onError: (error: Error) => {
      handleErrorApi({ error })
    },
  })
}

export const useAcceptFriendRequest = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (friendshipId: string) => friendApi.acceptFriendRequest(friendshipId),
    onSuccess: () => {
      // Invalidate requests, friends list, and all status caches
      queryClient.invalidateQueries({ queryKey: friendKeys.receivedRequests() })
      queryClient.invalidateQueries({ queryKey: friendKeys.myFriends() })
      queryClient.invalidateQueries({ queryKey: friendKeys.all })

      // Backend automatically creates 1:1 conversation on ADDED event
      // and pushes ConversationResponse to both users via /queue/conversations WebSocket.
      // Invalidate conversations cache as fallback in case WS event is missed.
      import('@/features/message/queries/keys').then(({ messageKeys }) => {
        queryClient.invalidateQueries({ queryKey: messageKeys.conversations() })
      })

      Toast.show({
        type: 'success',
        text1: t('friend.toast.acceptSuccess'),
        visibilityTime: 2000,
      })
    },
    onError: (error: Error) => {
      handleErrorApi({ error })
    },
  })
}

export const useDeclineFriendRequest = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (friendshipId: string) => friendApi.declineFriendRequest(friendshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendKeys.receivedRequests() })
      queryClient.invalidateQueries({ queryKey: friendKeys.all })

      Toast.show({
        type: 'success',
        text1: t('friend.toast.declineSuccess'),
        visibilityTime: 2000,
      })
    },
    onError: (error: Error) => {
      handleErrorApi({ error })
    },
  })
}

export const useCancelFriendRequest = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ friendshipId }: { friendshipId: string; userId?: string }) =>
      friendApi.cancelFriendRequest(friendshipId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: friendKeys.sentRequests() })
      queryClient.invalidateQueries({ queryKey: friendKeys.all })
      // Refetch status for the specific user if provided
      if (variables.userId) {
        queryClient.refetchQueries({ queryKey: friendKeys.status(variables.userId) })
      }

      Toast.show({
        type: 'success',
        text1: t('friend.toast.cancelSuccess'),
        visibilityTime: 2000,
      })
    },
    onError: (error: Error) => {
      handleErrorApi({ error })
    },
  })
}

export const useUnfriend = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (friendId: string) => friendApi.unfriend(friendId),
    onSuccess: (_data, friendId) => {
      queryClient.invalidateQueries({ queryKey: friendKeys.myFriends() })
      queryClient.invalidateQueries({ queryKey: friendKeys.status(friendId) })

      Toast.show({
        type: 'success',
        text1: t('friend.toast.unfriendSuccess'),
        visibilityTime: 2000,
      })
    },
    onError: (error: Error) => {
      handleErrorApi({ error })
    },
  })
}
