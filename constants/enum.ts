export const Role = {
  Admin: 'ADMIN',
  User: 'USER'
} as const

export type Role = (typeof Role)[keyof typeof Role]

export const ROLE_LABELS: Record<Role, string> = {
  [Role.Admin]: 'Quản trị viên',
  [Role.User]: 'Người dùng'
}

export const DeviceType = {
  Web: 'WEB',
  Mobile: 'MOBILE'
} as const

export type DeviceType = (typeof DeviceType)[keyof typeof DeviceType]

export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  [DeviceType.Web]: 'Web',
  [DeviceType.Mobile]: 'Mobile'
}

export const Gender = {
  Male: 'MALE',
  Female: 'FEMALE',
  Other: 'OTHER'
} as const

export type Gender = (typeof Gender)[keyof typeof Gender]

export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.Male]: 'Nam',
  [Gender.Female]: 'Nữ',
  [Gender.Other]: 'Khác'
}

export const QrSessionStatus = {
  Pending: 'PENDING',
  Scanned: 'SCANNED',
  Confirmed: 'CONFIRMED',
  Rejected: 'REJECTED',
  Expired: 'EXPIRED'
} as const

export type QrSessionStatus = (typeof QrSessionStatus)[keyof typeof QrSessionStatus]

export const SearchType = {
  User: 'USER',
  Group: 'GROUP',
  Keyword: 'KEYWORD'
} as const

export type SearchType = (typeof SearchType)[keyof typeof SearchType]

export const Platform = {
  Android: 'ANDROID',
  iOS: 'IOS',
  Web: 'WEB'
} as const
