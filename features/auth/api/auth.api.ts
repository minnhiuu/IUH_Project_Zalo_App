import http from '@/lib/http'
import { API_ENDPOINTS } from '@/config/apiConfig'
import { storage } from '@/utils/storageUtils'
import type { ApiResponse } from '@/types/common.types'
import type { UserResponse } from '@/features/users/schemas/user.schema'
import type {
  LoginRequest,
  RegisterInitRequest,
  RegisterVerifyRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  RefreshRequest,
  LogoutRequest,
  QrMobileRequest,
  TokenResponse,
  RegisterInitResponse,
  ForgotPasswordResponse,
  QrGenerationResponse,
  QrStatusResponse,
  QrSessionStatus
} from '../schemas'

export const authApi = {
  login: (request: LoginRequest) => http.post<ApiResponse<TokenResponse>>(API_ENDPOINTS.AUTH.LOGIN, request),

  register: (request: RegisterInitRequest) =>
    http.post<ApiResponse<RegisterInitResponse>>(API_ENDPOINTS.AUTH.REGISTER, request),

  registerVerify: (request: RegisterVerifyRequest) =>
    http.post<ApiResponse<TokenResponse>>(API_ENDPOINTS.AUTH.REGISTER_VERIFY, request),

  forgotPassword: (request: ForgotPasswordRequest) =>
    http.post<ApiResponse<ForgotPasswordResponse>>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, request),

  resetPassword: (request: ResetPasswordRequest) =>
    http.post<ApiResponse<TokenResponse>>(API_ENDPOINTS.AUTH.RESET_PASSWORD, request),

  refresh: (request: RefreshRequest) => http.post<ApiResponse<TokenResponse>>(API_ENDPOINTS.AUTH.REFRESH, request),

  logout: (request: LogoutRequest) => http.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.LOGOUT, request),

  changePassword: (request: { oldPassword: string; newPassword: string }) =>
    http.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, request),

  validateToken: (token: string) =>
    http.get<ApiResponse<boolean>>(API_ENDPOINTS.AUTH.VALIDATE, {
      params: { token }
    }),

  generateQr: () => http.post<ApiResponse<QrGenerationResponse>>(API_ENDPOINTS.AUTH.QR.GENERATE),

  qrMobile: (request: QrMobileRequest) =>
    http.post<ApiResponse<TokenResponse | void>>(API_ENDPOINTS.AUTH.QR.MOBILE, request),

  getQrStatus: (qrId: string) => http.get<ApiResponse<QrStatusResponse>>(`${API_ENDPOINTS.AUTH.QR.STATUS}/${qrId}`),

  waitQrStatus: (qrId: string, expectedStatus: QrSessionStatus) =>
    http.get<ApiResponse<QrStatusResponse>>(`${API_ENDPOINTS.AUTH.QR.WAIT}/${qrId}`, {
      params: { expectedStatus }
    }),

  scanQr: (request: QrMobileRequest) => http.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.QR.SCAN, request),

  acceptQr: (request: QrMobileRequest) => http.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.QR.ACCEPT, request),

  rejectQr: (request: QrMobileRequest) => http.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.QR.REJECT, request),

  logoutOthers: () => http.post<ApiResponse<void>>('/auth/logout-others'),

  getStoredUser: async (): Promise<UserResponse | null> => {
    return await storage.get<UserResponse>('user_data')
  },

  setStoredUser: async (user: UserResponse): Promise<void> => {
    await storage.set('user_data', user)
  }
}
