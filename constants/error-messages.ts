import i18n from '@/i18n';

/**
 * Error codes mapping to i18n keys
 */
const ERROR_CODE_MAP: Record<string, string> = {
  // Auth errors
  'AUTH_001': 'auth.errors.invalidCredentials',
  'AUTH_002': 'auth.errors.accountLocked',
  'AUTH_003': 'auth.errors.accountNotFound',
  'AUTH_004': 'auth.errors.tooManyAttempts',
  'AUTH_005': 'auth.errors.sessionExpired',
  'AUTH_006': 'auth.errors.unauthorized',
  
  // Validation errors
  'VALIDATION_001': 'auth.validation.phoneRequired',
  'VALIDATION_002': 'auth.validation.phoneInvalid',
  'VALIDATION_003': 'auth.validation.passwordRequired',
  'VALIDATION_004': 'auth.validation.passwordMinLength',
  
  // Server errors
  'SERVER_001': 'auth.errors.serverError',
  'NETWORK_ERROR': 'common.networkError',
  'UNKNOWN_ERROR': 'common.unknownError',
};

/**
 * Get localized error message from error code
 */
export const getErrorMessage = (code?: string, fallback?: string): string => {
  const t = i18n.t;
  
  if (code && ERROR_CODE_MAP[code]) {
    return t(ERROR_CODE_MAP[code]);
  }
  
  return fallback || t('common.unknownError');
};

/**
 * Common error messages (direct Vietnamese for cases without i18n)
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
  SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  UNKNOWN_ERROR: 'Đã xảy ra lỗi không xác định.',
  SESSION_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  UNAUTHORIZED: 'Bạn không có quyền thực hiện hành động này.',
} as const;

export default { getErrorMessage, ERROR_MESSAGES };
