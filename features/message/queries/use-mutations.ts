import { useMutation, useQueryClient } from '@tanstack/react-query'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'

import { messageApi } from '../api/message.api'
import { messageKeys } from './keys'
import { handleErrorApi } from '@/utils/error-handler'
import type { MessageSendRequest, ConversationResponse } from '../schemas'

export const useSendMessage = () => {
  return useMutation({
    mutationFn: (request: MessageSendRequest) => messageApi.sendMessage(request),
    // No invalidation here - WebSocket subscription handles cache updates
    // to avoid duplicate messages from both WS event + refetch
    onError: (error: Error) => {
      handleErrorApi({ error })
    }
  })
}

export const useMarkAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationId: string) => messageApi.markAsRead(conversationId),
    onMutate: async (conversationId) => {
      await queryClient.cancelQueries({ queryKey: messageKeys.conversations() })
      const previousData = queryClient.getQueriesData({ queryKey: messageKeys.conversations() })

      // Optimistic update: set unreadCount to 0
      queryClient.setQueriesData({ queryKey: messageKeys.conversations() }, (oldData: any) => {
        if (!oldData?.data) return oldData
        return {
          ...oldData,
          data: Array.isArray(oldData.data)
            ? oldData.data.map((conv: ConversationResponse) =>
                conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
              )
            : oldData.data
        }
      })

      return { previousData }
    },
    onError: (error: Error, _conversationId, context) => {
      // Rollback on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data)
        })
      }
      handleErrorApi({ error })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() })
    }
  })
}

export const useRevokeMessage = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ messageId, conversationId }: { messageId: string; conversationId: string }) =>
      messageApi.revokeMessage(messageId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.messages(variables.conversationId) })
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() })

      Toast.show({
        type: 'success',
        text1: t('message.toast.revokeSuccess'),
        visibilityTime: 2000
      })
    },
    onError: (error: Error) => {
      handleErrorApi({ error })
    }
  })
}

export const useDeleteMessageForMe = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ messageId, conversationId }: { messageId: string; conversationId: string }) =>
      messageApi.deleteMessageForMe(messageId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.messages(variables.conversationId) })

      Toast.show({
        type: 'success',
        text1: t('message.toast.deleteSuccess'),
        visibilityTime: 2000
      })
    },
    onError: (error: Error) => {
      handleErrorApi({ error })
    }
  })
}
