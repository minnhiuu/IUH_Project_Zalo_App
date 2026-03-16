import Toast from 'react-native-toast-message'
import { isAxiosError } from 'axios'
import { getErrorMessage } from '@/constants/error-messages'

export class EntityError extends Error {
  status: 422
  payload: {
    message: string
    errors: { field: string; message: string }[]
  }

  constructor(payload: { message: string; errors: { field: string; message: string }[] }) {
    super('Entity Error')
    this.status = 422
    this.payload = payload
  }
}

interface HandleErrorOptions {
  error: unknown
  setError?: (field: string, error: { type: string; message: string }) => void
  duration?: number
  showToast?: boolean
}

/**
 * Handle API errors consistently
 */
export const handleErrorApi = ({ error, setError, duration = 4000, showToast = true }: HandleErrorOptions): void => {
  // Handle EntityError (validation errors)
  if (error instanceof EntityError && setError) {
    error.payload.errors.forEach((err) => {
      setError(err.field, {
        type: 'server',
        message: err.message
      })
    })
    return
  }

  // Handle Axios errors
  if (isAxiosError(error)) {
    if (error.response?.status === 401) {
      return
    }

    const data = error.response?.data
    const message = getErrorMessage(data?.code, data?.message)

    if (showToast) {
      Toast.show({
        type: 'error',
        text1: 'Thất bại',
        text2: message,
        visibilityTime: duration
      })
    }
    return
  }

  // Handle generic errors
  if (error instanceof Error) {
    if (showToast) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message,
        visibilityTime: duration
      })
    }
    return
  }

  // Unknown error
  if (showToast) {
    Toast.show({
      type: 'error',
      text1: 'Lỗi không xác định',
      text2: 'Đã có lỗi xảy ra, vui lòng thử lại sau',
      visibilityTime: duration
    })
  }
}

export default handleErrorApi
