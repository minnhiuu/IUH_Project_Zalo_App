// Auth types
export interface LoginPayload {
  phone: string;
  password: string;
}

export interface RegisterPayload {
  phone: string;
  password: string;
  fullName: string;
  otp: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: import('./user.types').User;
  tokens: AuthTokens;
}

export interface OTPPayload {
  phone: string;
  type: 'register' | 'reset_password' | 'verify';
}

export interface ResetPasswordPayload {
  phone: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
