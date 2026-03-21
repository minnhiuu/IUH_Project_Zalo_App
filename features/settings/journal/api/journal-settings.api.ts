import http from '@/lib/http'
import { API_ENDPOINTS } from '@/config/apiConfig'
import type { ApiResponse } from '@/types/common.types'
import type { JournalSettings, UserSettings } from '../../schemas'

export const getJournalSettings = () => http.get<ApiResponse<JournalSettings>>(API_ENDPOINTS.SETTINGS.JOURNAL)

export const updateJournalSettings = (request: JournalSettings) =>
  http.put<ApiResponse<UserSettings>>(API_ENDPOINTS.SETTINGS.JOURNAL, request)

export const journalSettingsApi = {
  getJournalSettings,
  updateJournalSettings
}
