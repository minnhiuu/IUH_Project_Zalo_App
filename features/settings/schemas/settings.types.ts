export type AppLanguage = 'VI' | 'EN'
export type SettingScope = 'EVERYONE' | 'FRIENDS' | 'FRIENDS_AND_CONTACTED' | 'ONLY_ME' | 'OFF'
export type SettingsThemeMode = 'LIGHT' | 'DARK' | 'SYSTEM'
export type ChatFontSize = 'SMALL' | 'MEDIUM' | 'LARGE'
export type AudioQuality = 'LOW' | 'HIGH' | 'AUTOMATIC'
export type VideoQuality = 'SD' | 'HD'
export type BackupFrequency = 'MANUAL' | 'DAILY' | 'WEEKLY'

export interface LanguageAndInterfaceSettings {
  language: AppLanguage
  languageByDeviceId: Record<string, AppLanguage>
  themeMode: SettingsThemeMode
  fontScale: number
}

export interface DoNotDisturbSettings {
  dndEnabled: boolean
  dndStartTime: string
  dndEndTime: string
}

export interface NotificationSettings {
  allowNotifications: boolean
  allowNotificationsByDeviceId: Record<string, boolean>
  notifSound: boolean
  notifVibration: boolean
  notifMessages: boolean
  notifGroups: boolean
  notifFriendRequests: boolean
  doNotDisturb: DoNotDisturbSettings
}

export interface MessageSettings {
  messagePreview: boolean
  fontSize: ChatFontSize
  chatTheme: string
  autoDownload: boolean
  saveToLibrary: boolean
  endToEndEncryption: boolean
  showArchivedMessages: boolean
}

export interface CallSettings {
  allowCalls: boolean
  allowVideoCalls: boolean
  audioQuality: AudioQuality
  videoQuality: VideoQuality
  ringtone: string
  keepCallHistory: boolean
}

export interface PrivacySettings {
  birthdayVisibility: SettingScope
  showAccessStatus: boolean
  showSeenStatus: boolean
  allowMessaging: SettingScope
  allowCallsPrivacy: SettingScope
  allowViewAndCommentOnJournal: SettingScope
  blockUnknownUsers: boolean
  friendSourceByPhone: boolean
  friendSourceByQr: boolean
  utilityPermissions: string[]
  blockedUserIds: string[]
}

export interface ContactSettings {
  syncContacts: boolean
  autoAddFromPhoneContacts: boolean
}

export interface BackupContentSettings {
  backupMessages: boolean
  backupPhotos: boolean
  backupVideos: boolean
  backupFiles: boolean
}

export interface BackupRestoreSettings {
  autoBackup: boolean
  backupOverWifi: boolean
  backupFrequency: BackupFrequency
  lastBackupAt: string | null
  backupContent: BackupContentSettings
}

export interface AccountSecuritySettings {
  twoFactorEnabled: boolean
  lockAppEnabled: boolean
  biometricsEnabled: boolean
  logoutOtherDevicesOnPasswordChange: boolean
}

export interface JournalSettings {
  filterActivityType: string
  filterTimeRange: string
}

export interface DataOnDeviceSettings {
  allowCellularMediaDownload: boolean
  cacheCleanupThresholdMB: number
}

export interface UserSettings {
  languageAndInterface: LanguageAndInterfaceSettings
  notificationSettings: NotificationSettings
  messageSettings: MessageSettings
  callSettings: CallSettings
  privacySettings: PrivacySettings
  contactSettings: ContactSettings
  backupRestoreSettings: BackupRestoreSettings
  accountSecuritySettings: AccountSecuritySettings
  journalSettings: JournalSettings
  dataOnDeviceSettings: DataOnDeviceSettings
}
