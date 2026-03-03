// Validation utilities
export const isValidPhone = (phone: string): boolean => {
  // Vietnamese phone number format
  const phoneRegex = /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-9]|9[0-9])[0-9]{7}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPassword = (password: string): boolean => {
  // At least 6 characters
  return password.length >= 6
}

export const isStrongPassword = (
  password: string
): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Mật khẩu phải có ít nhất 8 ký tự')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ hoa')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ thường')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 số')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const isValidOTP = (otp: string): boolean => {
  return /^\d{6}$/.test(otp)
}

export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50
}

export const formatPhoneNumber = (phone: string): string => {
  // Format: 0xxx xxx xxx
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{4})(\d{3})(\d{3})$/)
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]}`
  }
  return phone
}

export const normalizePhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/\D/g, '')

  // Convert +84 to 0
  if (cleaned.startsWith('84')) {
    cleaned = '0' + cleaned.slice(2)
  }

  return cleaned
}
