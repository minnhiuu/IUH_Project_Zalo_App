export const settingsKeys = {
  all: () => ['settings'] as const,

  me: () => [...settingsKeys.all(), 'me'] as const,

  byUser: (userId: string) => [...settingsKeys.all(), 'user', userId] as const,

  languageAndInterface: () => [...settingsKeys.me(), 'language-and-interface'] as const,
  notification: () => [...settingsKeys.me(), 'notification'] as const,
  message: () => [...settingsKeys.me(), 'message'] as const,
  call: () => [...settingsKeys.me(), 'call'] as const,
  privacy: () => [...settingsKeys.me(), 'privacy'] as const,
  contact: () => [...settingsKeys.me(), 'contact'] as const,
  backupRestore: () => [...settingsKeys.me(), 'backup-restore'] as const,
  accountSecurity: () => [...settingsKeys.me(), 'account-security'] as const,
  journal: () => [...settingsKeys.me(), 'journal'] as const,
  dataOnDevice: () => [...settingsKeys.me(), 'data-on-device'] as const,

  updateLanguageAndInterface: () => [...settingsKeys.me(), 'update-language-and-interface'] as const,
  updateNotification: () => [...settingsKeys.me(), 'update-notification'] as const,
  updateMessage: () => [...settingsKeys.me(), 'update-message'] as const,
  updateCall: () => [...settingsKeys.me(), 'update-call'] as const,
  updatePrivacy: () => [...settingsKeys.me(), 'update-privacy'] as const,
  updateContact: () => [...settingsKeys.me(), 'update-contact'] as const,
  updateBackupRestore: () => [...settingsKeys.me(), 'update-backup-restore'] as const,
  updateAccountSecurity: () => [...settingsKeys.me(), 'update-account-security'] as const,
  updateJournal: () => [...settingsKeys.me(), 'update-journal'] as const,
  updateDataOnDevice: () => [...settingsKeys.me(), 'update-data-on-device'] as const
}
