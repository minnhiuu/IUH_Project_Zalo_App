import { useMutation, useQueryClient } from '@tanstack/react-query'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'

import { messageApi } from '../api/message.api'
import { messageKeys } from './keys'
import { notificationApi } from '@/features/notifications/api/notification.api'
import { handleErrorApi } from '@/utils/error-handler'
import type { MessageSendRequest, ConversationResponse, MessageResponse, ReminderRequest } from '../schemas'
import type { InfiniteData } from '@tanstack/react-query'
import { injectReminderMessage } from '@/features/notifications/utils/reminder-message'
import { useAuthStore } from '@/store'

const invalidateGroupConversationScopes = (queryClient: ReturnType<typeof useQueryClient>, conversationId: string) => {
  queryClient.invalidateQueries({ queryKey: messageKeys.messages(conversationId) })
  queryClient.invalidateQueries({ queryKey: messageKeys.conversations() })
  queryClient.invalidateQueries({ queryKey: messageKeys.groupMembers(conversationId, '') })
  queryClient.invalidateQueries({ queryKey: messageKeys.groupAdmins(conversationId) })
  queryClient.invalidateQueries({ queryKey: messageKeys.joinRequests(conversationId) })
  queryClient.invalidateQueries({ queryKey: messageKeys.blockedMembers(conversationId) })
  queryClient.invalidateQueries({ queryKey: messageKeys.myGroups('', 'activity_newest', 'all', 0) })
}

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

export const useCreateReminder = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: (request: ReminderRequest) => messageApi.createReminder(request),
    onSuccess: (response) => {
      const data = response.data.data
      if (data?.conversationId && data?.id) {
        injectReminderMessage(
          queryClient,
          {
            conversationId: data.conversationId,
            reminderId: data.id,
            message: data.title,
            title: data.title,
            remindAt: data.remindAt,
            isTriggerMessage: false
          },
          {
            id: currentUser?.id || null,
            name: currentUser?.fullName || 'Người dùng',
            avatar: currentUser?.avatar || null
          }
        )
      }

      Toast.show({
        type: 'success',
        text1: t('message.reminder.createSuccess', { defaultValue: 'Đã tạo nhắc hẹn' }),
        visibilityTime: 2000
      })
    },
    onError: (error: Error) => {
      handleErrorApi({ error })
      Toast.show({
        type: 'error',
        text1: t('message.reminder.createFailed', { defaultValue: 'Tạo nhắc hẹn thất bại' }),
        visibilityTime: 2000
      })
    }
  })
}

export const useUpdateReminder = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reminderId, request }: { reminderId: string; request: ReminderRequest }) =>
      messageApi.updateReminder(reminderId, request),
    onSuccess: (_response, variables) => {
      const conversationId = variables.request.conversationId
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: messageKeys.messages(conversationId) })
        queryClient.invalidateQueries({ queryKey: messageKeys.conversations() })
      }

      Toast.show({
        type: 'success',
        text1: t('message.reminder.updateSuccess', { defaultValue: 'Đã cập nhật nhắc hẹn' }),
        visibilityTime: 2000
      })
    },
    onError: (error: Error) => {
      handleErrorApi({ error })
      Toast.show({
        type: 'error',
        text1: t('message.reminder.updateFailed', { defaultValue: 'Cập nhật nhắc hẹn thất bại' }),
        visibilityTime: 2000
      })
    }
  })
}

export const useDeleteReminder = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reminderId }: { reminderId: string; conversationId?: string | null }) =>
      messageApi.deleteReminder(reminderId),
    onSuccess: (_response, variables) => {
      const conversationId = variables.conversationId || null
      if (conversationId) {
        queryClient.setQueryData(messageKeys.messages(conversationId), (oldData: InfiniteData<any> | undefined) => {
          if (!oldData) return oldData

          const updatedPages = oldData.pages.map((page: any) => {
            const updatedData = page.data.map((item: MessageResponse) => {
              const meta = (item.metadata || {}) as Record<string, unknown>
              if (String(meta.action || '') !== 'REMINDER') return item
              const payload = (meta.payload || {}) as Record<string, unknown>
              const reminderId = String(
                payload.reminderId || (payload as any).reminder_id || (payload as any).referenceId || ''
              )
              if (!reminderId || reminderId !== variables.reminderId) return item

              return {
                ...item,
                metadata: {
                  ...meta,
                  payload: {
                    ...payload,
                    deleteAction: true,
                    hasTriggered: true
                  }
                }
              }
            })

            return { ...page, data: updatedData }
          })

          return { ...oldData, pages: updatedPages }
        })
      }

      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() })
      Toast.show({
        type: 'success',
        text1: t('message.reminder.deleteSuccess', { defaultValue: 'Đã xóa nhắc hẹn' }),
        visibilityTime: 2000
      })
    },
    onError: (error: Error) => {

      handleErrorApi({ error })
      Toast.show({
        type: 'error',
        text1: t('message.reminder.deleteFailed', { defaultValue: 'Xóa nhắc hẹn thất bại' }),
        visibilityTime: 2000
      })
    }
  })
}

export const useMarkAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (conversationId: string) => {
      await messageApi.markAsRead(conversationId)
      await notificationApi.markChatConversationAsRead(conversationId).catch((error) => {
        console.warn('[Notification] Failed to mark chat notification as read:', error)
      })
    },
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

export const useToggleReaction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string; conversationId: string; userId: string }) =>
      messageApi.toggleReaction(messageId, emoji),
    onMutate: async ({ messageId, emoji, conversationId, userId }) => {
      await queryClient.cancelQueries({ queryKey: messageKeys.messages(conversationId) })

      queryClient.setQueryData(messageKeys.messages(conversationId), (oldData: InfiniteData<any> | undefined) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((m: MessageResponse) => {
              if (m.id !== messageId) return m
              const reactions = { ...(m.reactions || {}) }
              const existingEmoji = Object.entries(reactions).find(([, users]) => (users as string[]).includes(userId))
              if (existingEmoji) {
                const [oldEmoji, oldUsers] = existingEmoji
                if (oldEmoji === emoji) {
                  // Remove reaction
                  reactions[oldEmoji] = (oldUsers as string[]).filter((u) => u !== userId)
                  if (reactions[oldEmoji].length === 0) delete reactions[oldEmoji]
                } else {
                  // Switch reaction
                  reactions[oldEmoji] = (oldUsers as string[]).filter((u) => u !== userId)
                  if (reactions[oldEmoji].length === 0) delete reactions[oldEmoji]
                  reactions[emoji] = [...((reactions[emoji] as string[]) || []), userId]
                }
              } else {
                reactions[emoji] = [...((reactions[emoji] as string[]) || []), userId]
              }
              return { ...m, reactions }
            })
          }))
        }
      })
    },
    onError: (_error, { conversationId }, _context) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.messages(conversationId) })
    }
  })
}

export const useRemoveAllMyReactions = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ messageId }: { messageId: string; conversationId: string; userId: string }) =>
      messageApi.removeAllMyReactions(messageId),
    onMutate: async ({ messageId, conversationId, userId }) => {
      await queryClient.cancelQueries({ queryKey: messageKeys.messages(conversationId) })

      queryClient.setQueryData(messageKeys.messages(conversationId), (oldData: InfiniteData<any> | undefined) => {
        if (!oldData) return oldData
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((m: MessageResponse) => {
              if (m.id !== messageId) return m
              const reactions: Record<string, string[]> = {}
              Object.entries(m.reactions || {}).forEach(([emoji, users]) => {
                const filtered = (users as string[]).filter((u) => u !== userId)
                if (filtered.length > 0) reactions[emoji] = filtered
              })
              return { ...m, reactions }
            })
          }))
        }
      })
    },
    onError: (_error, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.messages(conversationId) })
    }
  })
}

export const usePinMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ conversationId, messageId }: { conversationId: string; messageId: string }) =>
      messageApi.pinMessage(conversationId, messageId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.pins(variables.conversationId) })
      queryClient.invalidateQueries({ queryKey: messageKeys.messages(variables.conversationId) })
    },
    onError: (error: Error) => {
      handleErrorApi({ error })
    }
  })
}

export const useUnpinMessage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ conversationId, messageId }: { conversationId: string; messageId: string }) =>
      messageApi.unpinMessage(conversationId, messageId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.pins(variables.conversationId) })
      queryClient.invalidateQueries({ queryKey: messageKeys.messages(variables.conversationId) })
    },
    onError: (error: Error) => {
      handleErrorApi({ error })
    }
  })
}

export const useClearConversationHistory = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationId: string) => messageApi.clearConversationHistory(conversationId),
    onSuccess: (_data, conversationId) => {
      queryClient.setQueriesData({ queryKey: messageKeys.conversations() }, (oldData: any) => {
        if (!oldData?.data || !Array.isArray(oldData.data)) return oldData
        return {
          ...oldData,
          data: oldData.data.map((conv: ConversationResponse) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  unreadCount: 0,
                  lastMessage: null,
                  lastMessageId: null,
                  lastMessageTime: null,
                  isLastMessageFromMe: null,
                  lastMessageType: null,
                  lastMessageStatus: null
                }
              : conv
          )
        }
      })

      queryClient.setQueryData(messageKeys.messages(conversationId), {
        pages: [],
        pageParams: [0]
      })

      queryClient.invalidateQueries({ queryKey: messageKeys.messages(conversationId) })
      queryClient.invalidateQueries({ queryKey: messageKeys.media(conversationId, ['IMAGE', 'VIDEO']) })
      queryClient.invalidateQueries({ queryKey: messageKeys.media(conversationId, ['FILE']) })
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() })

      Toast.show({
        type: 'success',
        text1: t('message.toast.clearHistorySuccess'),
        visibilityTime: 2000
      })
    },
    onError: (error: Error) => {
      handleErrorApi({ error })
    }
  })
}

export const useDeleteConversation = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (conversationId: string) => messageApi.deleteConversation(conversationId),
    onSuccess: (_data, conversationId) => {
      queryClient.setQueriesData({ queryKey: messageKeys.conversations() }, (oldData: any) => {
        if (!oldData?.data || !Array.isArray(oldData.data)) return oldData
        return {
          ...oldData,
          data: oldData.data.filter((conv: ConversationResponse) => conv.id !== conversationId)
        }
      })
      queryClient.removeQueries({ queryKey: messageKeys.messages(conversationId) })
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() })

      Toast.show({
        type: 'success',
        text1: t('message.toast.deleteConversationSuccess'),
        visibilityTime: 2000
      })
    },
    onError: (error: Error) => {
      handleErrorApi({ error })
    }
  })
}

export const useCreateGroupConversation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: messageApi.createGroupConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() })
      queryClient.invalidateQueries({ queryKey: messageKeys.myGroups('', 'activity_newest', 'all', 0) })
    },
    onError: (error: Error) => handleErrorApi({ error })
  })
}

export const useSendGroupInvites = () => {
  return useMutation({
    mutationFn: ({ conversationId, userIds }: { conversationId: string; userIds: string[] }) =>
      messageApi.sendGroupInvites(conversationId, userIds),
    onError: (error: Error) => handleErrorApi({ error })
  })
}

export const useUpdateGroupName = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, name }: { conversationId: string; name: string }) =>
      messageApi.updateGroupName(conversationId, name),
    onSuccess: (_data, variables) => invalidateGroupConversationScopes(queryClient, variables.conversationId),
    onError: (error: Error) => handleErrorApi({ error })
  })
}

export const useUpdateGroupAvatar = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      conversationId,
      uri,
      mimeType,
      fileName
    }: {
      conversationId: string
      uri: string
      mimeType: string
      fileName: string
    }) => messageApi.updateGroupAvatar(conversationId, uri, mimeType, fileName),
    onSuccess: (_data, variables) => invalidateGroupConversationScopes(queryClient, variables.conversationId),
    onError: (error: Error) => handleErrorApi({ error })
  })
}

export const useDisbandGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (conversationId: string) => messageApi.disbandGroup(conversationId),
    onSuccess: (_data, conversationId) => {
      queryClient.removeQueries({ queryKey: messageKeys.messages(conversationId) })
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() })
      queryClient.invalidateQueries({ queryKey: messageKeys.myGroups('', 'activity_newest', 'all', 0) })
    },
    onError: (error: Error) => handleErrorApi({ error })
  })
}

export const useLeaveGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      conversationId,
      transferOwnershipToUserId
    }: {
      conversationId: string
      transferOwnershipToUserId?: string
    }) => messageApi.leaveGroup(conversationId, { transferOwnershipToUserId }),
    onSuccess: (_data, variables) => {
      queryClient.removeQueries({ queryKey: messageKeys.messages(variables.conversationId) })
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() })
      queryClient.invalidateQueries({ queryKey: messageKeys.myGroups('', 'activity_newest', 'all', 0) })
    },
    onError: (error: Error) => handleErrorApi({ error })
  })
}

export const useAddMembersToGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, memberIds }: { conversationId: string; memberIds: string[] }) =>
      messageApi.addMembersToGroup(conversationId, memberIds),
    onSuccess: (_data, variables) => invalidateGroupConversationScopes(queryClient, variables.conversationId),
    onError: (error: Error) => handleErrorApi({ error })
  })
}

export const useRemoveMemberFromGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      conversationId,
      targetUserId,
      blockFromGroup
    }: {
      conversationId: string
      targetUserId: string
      blockFromGroup?: boolean
    }) => messageApi.removeMemberFromGroup(conversationId, targetUserId, blockFromGroup),
    onSuccess: (_data, variables) => invalidateGroupConversationScopes(queryClient, variables.conversationId),
    onError: (error: Error) => handleErrorApi({ error })
  })
}

export const usePromoteToAdmin = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, targetUserId }: { conversationId: string; targetUserId: string }) =>
      messageApi.promoteToAdmin(conversationId, targetUserId),
    onSuccess: (_data, variables) => invalidateGroupConversationScopes(queryClient, variables.conversationId),
    onError: (error: Error) => handleErrorApi({ error })
  })
}

export const useDemoteFromAdmin = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, targetUserId }: { conversationId: string; targetUserId: string }) =>
      messageApi.demoteFromAdmin(conversationId, targetUserId),
    onSuccess: (_data, variables) => invalidateGroupConversationScopes(queryClient, variables.conversationId),
    onError: (error: Error) => handleErrorApi({ error })
  })
}

export const useTransferOwner = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, targetUserId }: { conversationId: string; targetUserId: string }) =>
      messageApi.transferOwner(conversationId, targetUserId),
    onSuccess: (_data, variables) => invalidateGroupConversationScopes(queryClient, variables.conversationId),
    onError: (error: Error) => handleErrorApi({ error })
  })
}

export const useUpdateGroupSettings = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, settings }: { conversationId: string; settings: Record<string, unknown> }) =>
      messageApi.updateGroupSettings(conversationId, settings),
    onSuccess: (_data, variables) => invalidateGroupConversationScopes(queryClient, variables.conversationId),
    onError: (error: Error) => handleErrorApi({ error })
  })
}

export const useRefreshJoinLink = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (conversationId: string) => messageApi.refreshJoinLink(conversationId),
    onSuccess: (_data, conversationId) => invalidateGroupConversationScopes(queryClient, conversationId),
    onError: (error: Error) => handleErrorApi({ error })
  })
}

export const useGenerateJoinLink = () => {
  return useMutation({
    mutationFn: (conversationId: string) => messageApi.generateJoinLink(conversationId),
    onError: (error: Error) => handleErrorApi({ error })
  })
}

export const useJoinGroupByLink = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ token, joinAnswer }: { token: string; joinAnswer?: string }) =>
      messageApi.joinByLink(token, joinAnswer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() })
      queryClient.invalidateQueries({ queryKey: messageKeys.myGroups('', 'activity_newest', 'all', 0) })
    },
    onError: (error: Error) => handleErrorApi({ error })
  })
}

export const useUpdateJoinQuestion = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, question }: { conversationId: string; question: string }) =>
      messageApi.updateJoinQuestion(conversationId, question),
    onSuccess: (_data, variables) => invalidateGroupConversationScopes(queryClient, variables.conversationId),
    onError: (error: Error) => handleErrorApi({ error })
  })
}

export const useApproveJoinRequest = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, requestId }: { conversationId: string; requestId: string }) =>
      messageApi.approveJoinRequest(conversationId, requestId),
    onSuccess: (_data, variables) => invalidateGroupConversationScopes(queryClient, variables.conversationId),
    onError: (error: Error) => handleErrorApi({ error })
  })
}

export const useRejectJoinRequest = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, requestId }: { conversationId: string; requestId: string }) =>
      messageApi.rejectJoinRequest(conversationId, requestId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: messageKeys.joinRequests(variables.conversationId) })
      queryClient.invalidateQueries({ queryKey: messageKeys.messages(variables.conversationId) })
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() })
    },
    onError: (error: Error) => handleErrorApi({ error })
  })
}

export const useCancelMyJoinRequest = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (conversationId: string) => messageApi.cancelMyJoinRequest(conversationId),
    onSuccess: (_data, conversationId) => invalidateGroupConversationScopes(queryClient, conversationId),
    onError: (error: Error) => handleErrorApi({ error })
  })
}

export const useBlockMemberFromGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, targetUserId }: { conversationId: string; targetUserId: string }) =>
      messageApi.blockMemberFromGroup(conversationId, targetUserId),
    onSuccess: (_data, variables) => invalidateGroupConversationScopes(queryClient, variables.conversationId),
    onError: (error: Error) => handleErrorApi({ error })
  })
}

export const useUnblockMemberFromGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, targetUserId }: { conversationId: string; targetUserId: string }) =>
      messageApi.unblockMemberFromGroup(conversationId, targetUserId),
    onSuccess: (_data, variables) => invalidateGroupConversationScopes(queryClient, variables.conversationId),
    onError: (error: Error) => handleErrorApi({ error })
  })
}
