import { z } from 'zod'
import { DeviceType, QrSessionStatus } from '@/constants/enum'

export const loginRequestSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
  deviceId: z.string().min(1, 'Device ID không được để trống'),
  deviceType: z.enum(['WEB', 'MOBILE'])
})

export type LoginRequest = z.infer<typeof loginRequestSchema>

export const registerInitRequestSchema = z
  .object({
    email: z.string().email('Email không hợp lệ'),
    password: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Mật khẩu phải bao gồm chữ thường, chữ hoa, số và ký tự đặc biệt'
      ),
    confirmPassword: z.string().min(1, 'Mật khẩu nhập lại không được để trống'),
    fullName: z.string().min(1, 'Họ và tên không được để trống').max(100, 'Họ và tên quá dài'),
    phoneNumber: z
      .string()
      .regex(/^[0-9]{10,15}$/, 'Số điện thoại phải có 10-15 chữ số')
      .optional()
      .or(z.literal(''))
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })

export type RegisterInitRequest = z.infer<typeof registerInitRequestSchema>

export const registerVerifyRequestSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  otp: z.string().regex(/^[0-9]{6}$/, 'Mã OTP phải có 6 chữ số'),
  deviceId: z.string().min(1, 'Device ID không được để trống'),
  deviceType: z.enum(['WEB', 'MOBILE'])
})

export type RegisterVerifyRequest = z.infer<typeof registerVerifyRequestSchema>

export const forgotPasswordRequestSchema = z.object({
  email: z.string().email('Email không hợp lệ')
})

export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>

export const resetPasswordRequestSchema = z
  .object({
    email: z.string().email('Email không hợp lệ'),
    otp: z.string().regex(/^[0-9]{6}$/, 'Mã OTP phải có 6 chữ số'),
    newPassword: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Mật khẩu phải bao gồm chữ thường, chữ hoa, số và ký tự đặc biệt'
      ),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận lại mật khẩu')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })

export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>

export const changePasswordRequestSchema = z
  .object({
    oldPassword: z.string().min(1, 'Mật khẩu hiện tại không được để trống'),
    newPassword: z
      .string()
      .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Mật khẩu phải bao gồm chữ thường, chữ hoa, số và ký tự đặc biệt'
      ),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận lại mật khẩu mới')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword']
  })

export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>

export const refreshRequestSchema = z.object({
  deviceId: z.string().min(1, 'Device ID không được để trống'),
  refreshToken: z.string().optional()
})

export type RefreshRequest = z.infer<typeof refreshRequestSchema>

export const logoutRequestSchema = z.object({
  refreshToken: z.string().optional()
})

export type LogoutRequest = z.infer<typeof logoutRequestSchema>

export const qrMobileRequestSchema = z.object({
  qrContent: z.string().min(1, 'Nội dung mã QR không được để trống')
})

export type QrMobileRequest = z.infer<typeof qrMobileRequestSchema>

export type TokenResponse = {
  accessToken: string
  refreshToken: string
}

export type RegisterInitResponse = {
  message: string
  email: string
}

export type ForgotPasswordResponse = {
  message: string
  email: string
}

export type QrGenerationResponse = {
  qrId: string
  qrContent: string
  expiresAt: string
}

export type QrStatusResponse = {
  status: QrSessionStatus
  accessToken?: string
  refreshToken?: string
  userAvatar?: string
  userFullName?: string
}

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export type AuthResponse = {
  tokens: AuthTokens
  user?: {
    id: string
    email: string
    fullName: string
    phoneNumber?: string
    avatar?: string
  }
}

export { DeviceType, QrSessionStatus }
