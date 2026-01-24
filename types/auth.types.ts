
export interface LoginPayload {
  email: string;
  password: string;
  deviceId: string;
  deviceType: 'WEB' | 'MOBILE'; 
}

// Register payload - matches backend RegisterInitRequest (2-step with OTP)
export interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber?: string;
}

// Register verify payload - matches backend RegisterVerifyRequest (Step 2)
export interface RegisterVerifyPayload {
  email: string;
  otp: string;
  deviceId: string;
  deviceType: 'WEB' | 'MOBILE'; // Backend only accepts WEB or MOBILE
}

// Auth tokens (camelCase - used in app)
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

// Backend API response format (snake_case from JSON)
export interface TokenApiResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// Auth response after login/register
export interface AuthResponse {
  user?: import('./user.types').User;
  tokens: AuthTokens;
}

// Form data types (used in schema validation)
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  otp?: string;
}

// Forgot password payload - Step 1: Request OTP
export interface ForgotPasswordPayload {
  email: string;
}

// Reset password payload - Step 2: Reset with OTP
export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

// Forgot password form data
export interface ForgotPasswordFormData {
  email: string;
}

// Reset password form data
export interface ResetPasswordFormData {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}
