import http from '@/lib/http'
import { API_ENDPOINTS } from '@/config/apiConfig'
import type { ApiResponse } from '@/types/common.types'

export interface ContactEntry {
  name: string
  phones: string[]
  emails: string[]
}

export interface ContactImportRequest {
  contacts: ContactEntry[]
}

export interface ContactImportResponse {
  totalContacts: number
  normalizedPhones: number
  normalizedEmails: number
  matchedUsers: number
  contactRelationsCreated: number
  matchedUserIds: string[]
}

export const contactApi = {
  importContacts: (request: ContactImportRequest) =>
    http.post<ApiResponse<ContactImportResponse>>(API_ENDPOINTS.FRIENDSHIP.IMPORT_CONTACTS, request)
}
