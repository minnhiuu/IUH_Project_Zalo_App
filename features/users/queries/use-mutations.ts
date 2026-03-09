import { useMutation, useQueryClient } from '@tanstack/react-query'
import Toast from 'react-native-toast-message'
import { userApi } from '../api/user.api'
import { blockApi } from '../api/block.api'
import { userKeys, blockKeys } from './keys'
import { handleErrorApi } from '@/utils/error-handler'
import type { BlockUserRequest, UpdateBlockPreferenceRequest } from '../schemas/block.schema'

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => userApi.updateProfile(id, data),
    onSuccess: (response) => {
      const userData = response.data.data

      // Invalidate and refetch profile queries
      queryClient.invalidateQueries({ queryKey: userKeys.profile() })
      queryClient.invalidateQueries({ queryKey: userKeys.byId(userData.id) })

      Toast.show({
        type: 'success',
        text1: 'Cập nhật thông tin thành công',
        visibilityTime: 2000
      })
    },
    onError: (error: Error) => {
      handleErrorApi({ error })
    }
  })
}

export const useBlockUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: BlockUserRequest) => blockApi.blockUser(body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.byId(variables.blockedUserId) })
      queryClient.invalidateQueries({ queryKey: blockKeys.detail(variables.blockedUserId) })
      queryClient.invalidateQueries({ queryKey: blockKeys.myBlocks() })
      Toast.show({ type: 'success', text1: 'Đã chặn người dùng', visibilityTime: 2000 })
    },
    onError: (error: Error) => {
      handleErrorApi({ error })
    }
  })
}

export const useUnblockUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (blockedUserId: string) => blockApi.unblockUser(blockedUserId),
    onSuccess: (_, blockedUserId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.byId(blockedUserId) })
      queryClient.invalidateQueries({ queryKey: blockKeys.detail(blockedUserId) })
      queryClient.invalidateQueries({ queryKey: blockKeys.myBlocks() })
      Toast.show({ type: 'success', text1: 'Đã bỏ chặn người dùng', visibilityTime: 2000 })
    },
    onError: (error: Error) => {
      handleErrorApi({ error })
    }
  })
}

export const useUpdateBlockPreference = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ blockedUserId, body }: { blockedUserId: string; body: UpdateBlockPreferenceRequest }) =>
      blockApi.updateBlockPreference(blockedUserId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: blockKeys.detail(variables.blockedUserId) })
      queryClient.invalidateQueries({ queryKey: blockKeys.myBlocks() })
      Toast.show({ type: 'success', text1: 'Đã cập nhật cài đặt chặn', visibilityTime: 2000 })
    },
    onError: (error: Error) => {
      handleErrorApi({ error })
    }
  })
}
