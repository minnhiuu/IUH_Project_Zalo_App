import { useMutation, useQueryClient } from '@tanstack/react-query'
import Toast from 'react-native-toast-message'
import { useTranslation } from 'react-i18next'
import { userApi } from '../api/user.api'
import { userKeys } from './keys'
import { handleErrorApi } from '@/utils/error-handler'
import type { UserUpdateRequest } from '../schemas/user.schema'

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
