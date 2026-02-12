// API Configuration
// URLs are loaded from .env file (EXPO_PUBLIC_* variables)
// Backend uses Spring Cloud Gateway at port 8080

export type Environment = 'development' | 'staging' | 'production'

interface ApiConfigType {
  apiUrl: string
  socketUrl: string
}

const ENV: Environment = (process.env.EXPO_PUBLIC_ENV as Environment) || 'development'

const getApiUrl = (): string => {
  return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api'
}

const getSocketUrl = (): string => {
  return process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:8080'
}

const API_CONFIG: Record<Environment, ApiConfigType> = {
  development: {
    apiUrl: getApiUrl(),
    socketUrl: getSocketUrl()
  },
  staging: {
    apiUrl: 'https://staging-api.bondhub.com',
    socketUrl: 'https://staging-api.bondhub.com'
  },
  production: {
    apiUrl: 'https://api.bondhub.com',
    socketUrl: 'https://api.bondhub.com'
  }
}

// API Endpoints - Based on Gateway routes (StripPrefix=1)
// Matching backend auth-service AuthController endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login', // POST - LoginRequest
    REGISTER: '/auth/register', // POST - RegisterInitRequest (2-step with OTP)
    REGISTER_VERIFY: '/auth/register/verify', // POST - RegisterVerifyRequest
    REFRESH: '/auth/refresh', // POST - RefreshTokenRequest
    LOGOUT: '/auth/logout', // POST - LogoutRequest
    VALIDATE: '/auth/validate', // GET ?token=xxx
    FORGOT_PASSWORD: '/auth/forgot-password', // POST - Request OTP for password reset
    RESET_PASSWORD: '/auth/reset-password', // POST - Reset password with OTP
    QR: {
      GENERATE: '/auth/qr/generate',
      WAIT: (qrId: string) => `/auth/qr/wait/${qrId}`,
      SCAN: '/auth/qr/scan',
      ACCEPT: '/auth/qr/accept',
      REJECT: '/auth/qr/reject'
    }
  },
  USER: {
    PROFILE: '/user/me',
    UPDATE_PROFILE: '/user/me',
    SEARCH: '/users/search',
    GET_BY_ID: (id: string) => `/users/${id}`
  },
  MESSAGE: {
    CONVERSATIONS: '/message/conversations',
    MESSAGES: (conversationId: string) => `/message/conversations/${conversationId}/messages`,
    SEND: '/message/send'
  },
  NOTIFICATION: {
    LIST: '/notification',
    MARK_READ: (id: string) => `/notification/${id}/read`
  }
} as const

const apiConfig = {
  ...API_CONFIG[ENV],
  env: ENV,
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  endpoints: API_ENDPOINTS
}

// Log config in development for debugging
if (__DEV__) {
  console.log('[apiConfig] Environment:', ENV)
  console.log('[apiConfig] API URL:', apiConfig.apiUrl)
}

export default apiConfig
