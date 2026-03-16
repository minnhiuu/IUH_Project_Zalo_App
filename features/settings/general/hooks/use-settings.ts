import {
  useMySettingsQuery,
  useLanguageAndInterfaceSettingsQuery,
  useNotificationSettingsQuery,
  useMessageSettingsQuery,
  useCallSettingsQuery,
  usePrivacySettingsQuery,
  useContactSettingsQuery,
  useBackupRestoreSettingsQuery,
  useAccountSecuritySettingsQuery,
  useJournalSettingsQuery,
  useDataOnDeviceSettingsQuery,
  useUpdateLanguageAndInterfaceMutation,
  useUpdateNotificationSettingsMutation,
  useUpdateMessageSettingsMutation,
  useUpdateCallSettingsMutation,
  useUpdatePrivacySettingsMutation,
  useUpdateContactSettingsMutation,
  useUpdateBackupRestoreSettingsMutation,
  useUpdateAccountSecuritySettingsMutation,
  useUpdateJournalSettingsMutation,
  useUpdateDataOnDeviceSettingsMutation
} from '../../queries'

export const useSettings = () => {
  const mySettingsQuery = useMySettingsQuery()
  const languageAndInterfaceQuery = useLanguageAndInterfaceSettingsQuery()
  const notificationQuery = useNotificationSettingsQuery()
  const messageQuery = useMessageSettingsQuery()
  const callQuery = useCallSettingsQuery()
  const privacyQuery = usePrivacySettingsQuery()
  const contactQuery = useContactSettingsQuery()
  const backupRestoreQuery = useBackupRestoreSettingsQuery()
  const accountSecurityQuery = useAccountSecuritySettingsQuery()
  const journalQuery = useJournalSettingsQuery()
  const dataOnDeviceQuery = useDataOnDeviceSettingsQuery()

  const updateLanguageAndInterfaceMutation = useUpdateLanguageAndInterfaceMutation()
  const updateNotificationMutation = useUpdateNotificationSettingsMutation()
  const updateMessageMutation = useUpdateMessageSettingsMutation()
  const updateCallMutation = useUpdateCallSettingsMutation()
  const updatePrivacyMutation = useUpdatePrivacySettingsMutation()
  const updateContactMutation = useUpdateContactSettingsMutation()
  const updateBackupRestoreMutation = useUpdateBackupRestoreSettingsMutation()
  const updateAccountSecurityMutation = useUpdateAccountSecuritySettingsMutation()
  const updateJournalMutation = useUpdateJournalSettingsMutation()
  const updateDataOnDeviceMutation = useUpdateDataOnDeviceSettingsMutation()

  return {
    mySettingsQuery,
    languageAndInterfaceQuery,
    notificationQuery,
    messageQuery,
    callQuery,
    privacyQuery,
    contactQuery,
    backupRestoreQuery,
    accountSecurityQuery,
    journalQuery,
    dataOnDeviceQuery,

    updateLanguageAndInterfaceMutation,
    updateNotificationMutation,
    updateMessageMutation,
    updateCallMutation,
    updatePrivacyMutation,
    updateContactMutation,
    updateBackupRestoreMutation,
    updateAccountSecurityMutation,
    updateJournalMutation,
    updateDataOnDeviceMutation
  }
}

export default useSettings
