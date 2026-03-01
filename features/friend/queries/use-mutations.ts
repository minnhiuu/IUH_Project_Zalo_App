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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendKeys.sentRequests() })

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
      // Invalidate both requests and friends list
      queryClient.invalidateQueries({ queryKey: friendKeys.receivedRequests() })
      queryClient.invalidateQueries({ queryKey: friendKeys.myFriends() })

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
    mutationFn: (friendshipId: string) => friendApi.cancelFriendRequest(friendshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: friendKeys.sentRequests() })

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
