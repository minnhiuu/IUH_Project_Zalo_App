import { QrSessionStatus } from "../schemas";

export const authKeys = {
  all: () => ["auth"] as const,

  login: () => [...authKeys.all(), "login"] as const,

  register: () => [...authKeys.all(), "register"] as const,

  registerVerify: () => [...authKeys.all(), "register-verify"] as const,

  verifyOtp: () => [...authKeys.all(), "verify-otp"] as const,

  refresh: (refreshToken?: string) =>
    refreshToken
      ? ([...authKeys.all(), "refresh", refreshToken] as const)
      : ([...authKeys.all(), "refresh"] as const),

  logout: () => [...authKeys.all(), "logout"] as const,

  validate: (token?: string) =>
    token
      ? ([...authKeys.all(), "validate", token] as const)
      : ([...authKeys.all(), "validate"] as const),

  user: () => [...authKeys.all(), "user"] as const,

  currentUser: () => [...authKeys.user(), "current"] as const,

  forgotPassword: () => [...authKeys.all(), "forgot-password"] as const,

  resetPassword: () => [...authKeys.all(), "reset-password"] as const,

  generateQr: () => [...authKeys.all(), "generate-qr"] as const,

  qrStatus: (qrId: string) =>
    [...authKeys.all(), "qr-status", qrId] as const,

  waitQrStatus: (qrId: string, expectedStatus: QrSessionStatus) =>
    [...authKeys.all(), "wait-qr-status", qrId, expectedStatus] as const,

  scanQr: () => [...authKeys.all(), "scan-qr"] as const,

  acceptQr: () => [...authKeys.all(), "accept-qr"] as const,

  rejectQr: () => [...authKeys.all(), "reject-qr"] as const,
};
