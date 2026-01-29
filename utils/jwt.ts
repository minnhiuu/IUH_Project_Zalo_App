import { jwtDecode } from 'jwt-decode'

interface DecodedToken {
  exp: number
  iat: number
  sub?: string
  userId?: string
  phone?: string
  roles?: string[]
}

/**
 * Decode JWT token
 */
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token)
  } catch {
    return null
  }
}

/**
 * Check if token is expiring soon (within 1/3 of its lifetime)
 */
export const isTokenExpiringSoon = (token: string): boolean => {
  const decoded = decodeToken(token)
  if (!decoded) return true

  const now = Math.floor(Date.now() / 1000)
  const tokenLifetime = decoded.exp - decoded.iat
  const timeRemaining = decoded.exp - now

  // Token is expiring if less than 1/3 of its lifetime remains
  return timeRemaining < tokenLifetime / 3
}

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token)
  if (!decoded) return true
  return decoded.exp <= Math.floor(Date.now() / 1000)
}

/**
 * Get time until token expires (in seconds)
 */
export const getTokenExpiryTime = (token: string): number => {
  const decoded = decodeToken(token)
  if (!decoded) return 0

  const now = Math.floor(Date.now() / 1000)
  return Math.max(0, decoded.exp - now)
}

/**
 * Get user ID from token
 */
export const getUserIdFromToken = (token: string): string | null => {
  const decoded = decodeToken(token)
  return decoded?.userId || decoded?.sub || null
}

export default {
  decodeToken,
  isTokenExpiringSoon,
  isTokenExpired,
  getTokenExpiryTime,
  getUserIdFromToken
}
