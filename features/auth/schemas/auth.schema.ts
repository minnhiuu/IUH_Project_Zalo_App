import i18n from '@/i18n';
import type { LoginFormData, RegisterFormData } from '@/types/auth.types';

// Phone validation regex for Vietnamese numbers
const PHONE_REGEX = /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/;

// Password requirements
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_MAX_LENGTH = 50;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Re-export form types for convenience
export type { LoginFormData, RegisterFormData };

/**
 * Auth validation schemas
 */
export const authSchema = {
  /**
   * Validate phone number
   */
  phone: (value: string): ValidationResult => {
    const t = i18n.t;
    const cleaned = value.replace(/\s/g, '');
    
    if (!cleaned) {
      return { isValid: false, error: t('auth.validation.phoneRequired') };
    }
    
    if (!PHONE_REGEX.test(cleaned)) {
      return { isValid: false, error: t('auth.validation.phoneInvalid') };
    }
    
    return { isValid: true };
  },

  /**
   * Validate password
   */
  password: (value: string): ValidationResult => {
    const t = i18n.t;
    
    if (!value) {
      return { isValid: false, error: t('auth.validation.passwordRequired') };
    }
    
    if (value.length < PASSWORD_MIN_LENGTH) {
      return { isValid: false, error: t('auth.validation.passwordMinLength') };
    }
    
    if (value.length > PASSWORD_MAX_LENGTH) {
      return { isValid: false, error: t('auth.validation.passwordMaxLength') };
    }
    
    return { isValid: true };
  },

  /**
   * Validate confirm password
   */
  confirmPassword: (password: string, confirmPassword: string): ValidationResult => {
    const t = i18n.t;
    
    if (!confirmPassword) {
      return { isValid: false, error: t('auth.validation.confirmPasswordRequired') };
    }
    
    if (password !== confirmPassword) {
      return { isValid: false, error: t('auth.validation.passwordMismatch') };
    }
    
    return { isValid: true };
  },

  /**
   * Validate full name
   */
  fullName: (value: string): ValidationResult => {
    const t = i18n.t;
    const trimmed = value.trim();
    
    if (!trimmed) {
      return { isValid: false, error: t('auth.validation.fullNameRequired') };
    }
    
    if (trimmed.length < 2) {
      return { isValid: false, error: t('auth.validation.fullNameMinLength') };
    }
    
    if (trimmed.length > 50) {
      return { isValid: false, error: t('auth.validation.fullNameMaxLength') };
    }
    
    return { isValid: true };
  },

  /**
   * Validate OTP
   */
  otp: (value: string): ValidationResult => {
    const t = i18n.t;
    
    if (!value) {
      return { isValid: false, error: t('auth.validation.otpRequired') };
    }
    
    if (!/^\d{6}$/.test(value)) {
      return { isValid: false, error: t('auth.validation.otpInvalid') };
    }
    
    return { isValid: true };
  },

  /**
   * Validate login form
   */
  validateLoginForm: (data: LoginFormData): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    const phoneResult = authSchema.phone(data.phoneNumber);
    if (!phoneResult.isValid && phoneResult.error) {
      errors.phoneNumber = phoneResult.error;
    }
    
    const passwordResult = authSchema.password(data.password);
    if (!passwordResult.isValid && passwordResult.error) {
      errors.password = passwordResult.error;
    }
    
    return errors;
  },

  /**
   * Validate register form
   */
  validateRegisterForm: (data: RegisterFormData): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    const phoneResult = authSchema.phone(data.phoneNumber);
    if (!phoneResult.isValid && phoneResult.error) {
      errors.phoneNumber = phoneResult.error;
    }
    
    const fullNameResult = authSchema.fullName(data.fullName);
    if (!fullNameResult.isValid && fullNameResult.error) {
      errors.fullName = fullNameResult.error;
    }
    
    const passwordResult = authSchema.password(data.password);
    if (!passwordResult.isValid && passwordResult.error) {
      errors.password = passwordResult.error;
    }
    
    const confirmPasswordResult = authSchema.confirmPassword(data.password, data.confirmPassword);
    if (!confirmPasswordResult.isValid && confirmPasswordResult.error) {
      errors.confirmPassword = confirmPasswordResult.error;
    }
    
    // OTP is optional in register
    if (data.otp) {
      const otpResult = authSchema.otp(data.otp);
      if (!otpResult.isValid && otpResult.error) {
        errors.otp = otpResult.error;
      }
    }
    
    return errors;
  },
};

export default authSchema;
