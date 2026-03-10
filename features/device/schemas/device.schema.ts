export enum DeviceType {
  WEB = 'WEB',
  MOBILE = 'MOBILE'
}

export type DeviceResponse = {
  id: string
  deviceId: string
  sessionId: string
  deviceName: string
  browser: string | null
  os: string | null
  deviceType: DeviceType
  ipAddress: string | null
  lastActiveTime: string | null // ISO date string
  accountId: string
  createdAt: string // ISO date string
  lastModifiedAt: string // ISO date string
  createdBy: string | null
  lastModifiedBy: string | null
  issuedAt: number | null // Unix timestamp
  expiresAt: number | null // Unix timestamp
  isCurrentDevice: boolean | null
  isActive: boolean | null
}

export type DeviceListResponse = {
  activeDevices: DeviceResponse[]
  otherDevices: DeviceResponse[]
}
