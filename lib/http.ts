import axios, { AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import { isTokenExpiringSoon } from '@/utils/jwt'
import apiConfig, { API_ENDPOINTS } from '@/config/apiConfig'
import { secureStorage } from '@/utils/storageUtils'
import i18n from '@/i18n'

export const getAccessToken = async (): Promise<string | null> => {
  try {
    return await secureStorage.getAccessToken()
  } catch (error) {
    console.error('[http] getAccessToken error:', error)
    return null
  }
}

export const setAccessToken = async (token: string | null): Promise<void> => {
  try {
    if (token) {
      await secureStorage.setAccessToken(token)
    } else {
      await secureStorage.clearTokens()
    }
  } catch (error) {
    console.error('[http] setAccessToken error:', error)
    throw error
  }
}

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await secureStorage.getRefreshToken()
  } catch (error) {
    console.error('[http] getRefreshToken error:', error)
    return null
  }
}

export const setRefreshToken = async (token: string | null): Promise<void> => {
  try {
    if (token) {
      await secureStorage.setRefreshToken(token)
    } else {
      await secureStorage.clearTokens()
    }
  } catch (error) {
    console.error('[http] setRefreshToken error:', error)
    throw error
  }
}

export const clearTokens = async (): Promise<void> => {
  try {
    await secureStorage.clearTokens()
  } catch (error) {
    console.error('[http] clearTokens error:', error)
    throw error
  }
}

type UnauthorizedHandler = () => void | Promise<void>

let unauthorizedHandler: UnauthorizedHandler | null = null
let isHandlingUnauthorized = false

export const setUnauthorizedHandler = (handler: UnauthorizedHandler | null): void => {
  unauthorizedHandler = handler
}

const handleUnauthorizedSession = async (): Promise<void> => {
  if (isHandlingUnauthorized) return

  isHandlingUnauthorized = true
  try {
    await clearTokens()
    await unauthorizedHandler?.()
  } catch (error) {
    console.error('[http] handleUnauthorizedSession error:', error)
  } finally {
    setTimeout(() => {
      isHandlingUnauthorized = false
    }, 300)
  }
}

// Refresh token logic
let isRefreshing = false
let refreshPromise: Promise<string | null> | null = null
let failedQueue: {
  resolve: (token: string | null) => void
  reject: (error: Error) => void
}[] = []

const processQueue = (error: Error | null, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

const performRefresh = async (): Promise<string | null> => {
  try {
    const refreshToken = await getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const deviceId = (await secureStorage.getDeviceId()) || 'mobile-device'
    const response = await axios.post(`${apiConfig.apiUrl}${API_ENDPOINTS.AUTH.REFRESH}`, { deviceId, refreshToken })

    // Backend returns camelCase: accessToken, refreshToken
    const { accessToken, refreshToken: newRefreshToken } = response.data.data

    if (accessToken) {
      await setAccessToken(accessToken)
      await setRefreshToken(newRefreshToken)
    }

    return accessToken
  } catch (error) {
    await clearTokens()
    throw error
  }
}

export const silentRefresh = async (): Promise<string | null> => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  isRefreshing = true
  refreshPromise = performRefresh()
    .then((token) => {
      processQueue(null, token)
      return token
    })
    .catch((error) => {
      processQueue(error as Error, null)
      throw error
    })
    .finally(() => {
      isRefreshing = false
      refreshPromise = null
    })

  return refreshPromise
}

// Create HTTP instance
const http = axios.create({
  baseURL: apiConfig.apiUrl,
  timeout: apiConfig.timeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

// Request interceptor
http.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData
    if (isFormData && config.headers) {
      delete (config.headers as any)['Content-Type']
      delete (config.headers as any)['content-type']
    }

    const isAuthEndpoint =
      config.url?.includes('/auth/login') ||
      config.url?.includes('/auth/refresh') ||
      config.url?.includes('/auth/register')

    if (isAuthEndpoint) return config

    let token = await getAccessToken()

    // Skip token expiry check for QR endpoints (they need current token, not refreshed)
    const isQrEndpoint =
      config.url?.includes('/auth/qr/scan') ||
      config.url?.includes('/auth/qr/accept') ||
      config.url?.includes('/auth/qr/reject')

    if (token && !isQrEndpoint && isTokenExpiringSoon(token)) {
      try {
        token = isRefreshing && refreshPromise ? await refreshPromise : await silentRefresh()
      } catch (error) {
        console.error('Token refresh failed:', error)
      }
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    const deviceId = await secureStorage.getDeviceId()
    if (deviceId && config.headers) {
      config.headers['X-Device-Id'] = deviceId
    }

    // Inject Accept-Language from SecureStore (saved from user's general settings),
    // falling back to the active i18n locale for unauthenticated / first-load requests.
    const storedLang = await secureStorage.getAcceptLanguage()
    config.headers['Accept-Language'] = storedLang ?? i18n.language ?? 'vi'

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor
http.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    const isAuthRequest =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh')

    const isFileUploadRequest =
      originalRequest?.url?.includes('/files/upload') ||
      originalRequest?.url?.includes('/api/files/upload')

    // Handle 401 - try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/refresh')) {
        await handleUnauthorizedSession()
        return Promise.reject(error)
      }

      if (isAuthRequest) {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: async (token) => {
              if (token && originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`
              }
              resolve(http(originalRequest))
            },
            reject: (err) => reject(err)
          })
        })
      }

      originalRequest._retry = true

      try {
        const newToken = await silentRefresh()
        if (newToken && originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }
        return http(originalRequest)
      } catch (refreshError) {
        if (isFileUploadRequest) {
          return Promise.reject(error)
        }
        await handleUnauthorizedSession()
        return Promise.reject(refreshError)
      }
    }

    if (error.response?.status === 401 && !isAuthRequest && !isFileUploadRequest) {
      await handleUnauthorizedSession()
    }

    return Promise.reject(error)
  }
)

export default http
