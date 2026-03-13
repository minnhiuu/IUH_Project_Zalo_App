import http from '@/lib/http'
import { API_ENDPOINTS } from '@/config/apiConfig'
import type { ApiResponse } from '@/types/common.types'
import type { BackupRestoreSettings, UserSettings } from '../../schemas'

export const getBackupRestoreSettings = () =>
  http.get<ApiResponse<BackupRestoreSettings>>(API_ENDPOINTS.SETTINGS.BACKUP_RESTORE)

export const updateBackupRestoreSettings = (request: BackupRestoreSettings) =>
  http.put<ApiResponse<UserSettings>>(API_ENDPOINTS.SETTINGS.BACKUP_RESTORE, request)

export const backupRestoreSettingsApi = {
  getBackupRestoreSettings,
  updateBackupRestoreSettings
}
