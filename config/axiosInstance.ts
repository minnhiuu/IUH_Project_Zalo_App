import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import * as SecureStore from 'expo-secure-store'
import i18n from '@/i18n'
import apiConfig, { API_ENDPOINTS } from './apiConfig'
import { secureStorage } from '@/utils/storageUtils'

const axiosInstance = axios.create({
  baseURL: apiConfig.apiUrl,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

let isRefreshing = false

let failedQueue: Array<{
  resolve: (token: string | null) => void
  reject: (error: AxiosError) => void
}> = []

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve(token)
    }
  })
  failedQueue = []
}

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync('access_token')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error('Error getting token:', error)
    }

    // Inject Accept-Language from SecureStore (synced from user's general settings),
    // falling back to the active i18n locale for unauthenticated / first-load requests.
    try {
      const storedLang = await secureStorage.getAcceptLanguage()
      config.headers['Accept-Language'] = storedLang ?? i18n.language ?? 'vi'
      
      const deviceId = await secureStorage.getDeviceId()
      if (deviceId) {
        config.headers['X-Device-Id'] = deviceId
      }
    } catch {
      config.headers['Accept-Language'] = i18n.language ?? 'vi'
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const t = i18n.t

    if (error.response?.status === 401 && !originalRequest._retry) {
      // Avoid refreshing for the refresh endpoint itself
      if (originalRequest.url?.includes(API_ENDPOINTS.AUTH.REFRESH)) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              if (token && originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`
              }
              resolve(axiosInstance(originalRequest))
            },
            reject: (err) => {
              reject(err)
            }
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token')

        if (!refreshToken) {
          throw new Error(t('auth.refresh.refreshFailed'))
        }

        const response = await axios.post(`${apiConfig.apiUrl}${API_ENDPOINTS.AUTH.REFRESH}`, {
          refreshToken
        })

        if (response.data.success) {
          const { accessToken, refreshToken: newRefreshToken } = response.data.data

          await SecureStore.setItemAsync('access_token', accessToken)
          await SecureStore.setItemAsync('refresh_token', newRefreshToken)

          processQueue(null, accessToken)

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
          }

          return axiosInstance(originalRequest)
        } else {
          throw new Error(t('auth.refresh.refreshFailed'))
        }
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null)

        await SecureStore.deleteItemAsync('access_token')
        await SecureStore.deleteItemAsync('refresh_token')

        console.error('Token refresh failed:', refreshError)

        return Promise.reject(new Error(t('auth.errors.sessionExpired')))
      } finally {
        isRefreshing = false
      }
    }

    if (error.response) {
      const status = error.response.status
      const data = error.response.data as { message?: string }

      let errorMessage: string

      switch (status) {
        case 400:
          errorMessage = data?.message || t('common.error')
          break
        case 403:
          errorMessage = t('auth.errors.unauthorized')
          break
        case 404:
          errorMessage = data?.message || t('common.error')
          break
        case 429:
          errorMessage = t('auth.errors.tooManyAttempts')
          break
        case 500:
        default:
          errorMessage = t('auth.errors.serverError')
          break
      }

      console.error('API Error:', errorMessage)
    } else if (error.request) {
      console.error('Network Error:', t('common.networkError'))
    } else {
      console.error('Error:', error.message)
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
