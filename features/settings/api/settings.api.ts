import { getMySettings, getSettingsByUserId } from '../general/api/settings.api'
import {
  getLanguageAndInterfaceSettings,
  updateLanguageAndInterfaceSettings,
  syncAcceptLanguage
} from '../interface-language/api/interface-language.api'
import { getNotificationSettings, updateNotificationSettings } from '../notifications/api/notification-settings.api'
import { getMessageSettings, updateMessageSettings } from '../messages/api/message-settings.api'
import { getCallSettings, updateCallSettings } from '../calls/api/call-settings.api'
import { getPrivacySettings, updatePrivacySettings } from '../privacy/api/privacy-settings.api'
import { getContactSettings, updateContactSettings } from '../contacts/api/contact-settings.api'
import {
  getBackupRestoreSettings,
  updateBackupRestoreSettings
} from '../backup-restore/api/backup-restore-settings.api'
import {
  getAccountSecuritySettings,
  updateAccountSecuritySettings
} from '../account-security/api/account-security-settings.api'
import { getJournalSettings, updateJournalSettings } from '../journal/api/journal-settings.api'
import { getDataOnDeviceSettings, updateDataOnDeviceSettings } from '../data-on-device/api/data-on-device-settings.api'

export const settingsApi = {
  getMySettings,
  getSettingsByUserId,
  getLanguageAndInterfaceSettings,
  getNotificationSettings,
  getMessageSettings,
  getCallSettings,
  getPrivacySettings,
  getContactSettings,
  getBackupRestoreSettings,
  getAccountSecuritySettings,
  getJournalSettings,
  getDataOnDeviceSettings,
  updateLanguageAndInterfaceSettings,
  updateNotificationSettings,
  updateMessageSettings,
  updateCallSettings,
  updatePrivacySettings,
  updateContactSettings,
  updateBackupRestoreSettings,
  updateAccountSecuritySettings,
  updateJournalSettings,
  updateDataOnDeviceSettings,
  syncAcceptLanguage
}
