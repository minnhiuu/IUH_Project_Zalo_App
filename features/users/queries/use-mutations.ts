import { useMutation, useQueryClient } from '@tanstack/react-query'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'
import { userApi } from '../api/user.api'
import { blockApi } from '../api/block.api'
import { userKeys, blockKeys } from './keys'
import { settingsKeys } from '../../settings/queries/keys'
import { handleErrorApi } from '@/utils/error-handler'
import type { UserUpdateRequest } from '../schemas/user.schema'
import type { BlockUserRequest, UpdateBlockPreferenceRequest } from '../schemas/block.schema'

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: UserUpdateRequest) => userApi.updateProfile(data),
    onSuccess: (response) => {
      const userData = response.data.data

      // Invalidate and refetch profile queries
      queryClient.invalidateQueries({ queryKey: userKeys.profile() })
      queryClient.invalidateQueries({ queryKey: userKeys.byId(userData.id) })

      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('profile.owner.updateSuccess'),
        visibilityTime: 2000
      })
    },
    onError: (error: Error) => {
      handleErrorApi({ error })
      console.log(error);

    }
  })
}

export const useUpdateBio = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (bio: string) => userApi.updateBio(bio),
    onSuccess: (response) => {
      const userData = response.data.data

      // Invalidate and refetch profile queries
      queryClient.invalidateQueries({ queryKey: userKeys.profile() })
      queryClient.invalidateQueries({ queryKey: userKeys.byId(userData.id) })

      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('profile.owner.updateSuccess'),
        visibilityTime: 2000
      })
    },
    onError: (error: Error) => {
      handleErrorApi({ error })
    }
  })
}

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (formData: FormData) => userApi.updateAvatar(formData),
    onSuccess: () => {
      // Invalidate all user queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: userKeys.all })

      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('profile.avatar.updateSuccess'),
        visibilityTime: 2000
      })
    },
    onError: (error: Error) => {
      handleErrorApi({ error })
    }
  })
}

export const useUpdateBackground = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ formData, y }: { formData: FormData; y?: number }) =>
      userApi.updateBackground(formData, y),
    onSuccess: () => {
      // Invalidate all user queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: userKeys.all })

      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('profile.cover.updateSuccess'),
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
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (data: BlockUserRequest) => blockApi.blockUser(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: blockKeys.all })
      queryClient.invalidateQueries({ queryKey: blockKeys.myBlocks() })
      queryClient.invalidateQueries({ queryKey: blockKeys.detail(variables.blockedUserId) })
      queryClient.invalidateQueries({ queryKey: settingsKeys.all() })
      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('settings.privacy.blockSuccess')
      })
    },
    onError: (error: Error) => {
      handleErrorApi({ error })
    }
  })
}

export const useUnblockUser = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: (userId: string) => blockApi.unblockUser(userId),
    onSuccess: (_, userId) => {
      // Update cache immediately to reflect unblocked state
      queryClient.setQueryData(blockKeys.detail(userId), null)

      queryClient.invalidateQueries({ queryKey: blockKeys.all })
      queryClient.invalidateQueries({ queryKey: blockKeys.myBlocks() })
      queryClient.invalidateQueries({ queryKey: settingsKeys.all() })

      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('settings.privacy.unblockSuccess')
      })
    },
    onError: (error: Error) => {
      handleErrorApi({ error })
    }
  })
}

export const useUpdateBlockPreference = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: ({ blockedUserId, body }: { blockedUserId: string; body: UpdateBlockPreferenceRequest }) =>
      blockApi.updateBlockPreference(blockedUserId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: blockKeys.detail(variables.blockedUserId) })
      Toast.show({
        type: 'success',
        text1: t('common.success'),
        text2: t('settings.privacy.updateBlockSuccess')
      })
    },
    onError: (error: Error) => {
      handleErrorApi({ error })
    }
  })
}
