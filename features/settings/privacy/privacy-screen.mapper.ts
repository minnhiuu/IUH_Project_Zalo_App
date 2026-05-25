import type { PrivacySettings } from '../schemas'

export const PRIVACY_SETTINGS_SCREEN_FIELD_MAP = {
  birthday: 'birthdayVisibility',
  showAccessStatus: 'showAccessStatus',
  showSeenStatus: 'showSeenStatus',
  allowMessaging: 'allowMessaging',
  allowCalls: 'allowCallsPrivacy',
  allowViewAndComment: 'allowViewAndCommentOnJournal',
  blockAndHide: ['blockUnknownUsers', 'blockedUserIds'],
  nameSearchVisibility: 'nameSearchVisibility',
  phoneSearchVisibility: 'phoneSearchVisibility',
  manageFriendSources: ['friendSourceByPhone', 'friendSourceByQr'],
  utilities: 'utilityPermissions'
} as const

const SCOPE_LABEL_KEYS: Record<PrivacySettings['birthdayVisibility'], string> = {
  EVERYONE: 'settings.privacy.everyone',
  FRIENDS: 'settings.privacy.friends',
  FRIENDS_AND_CONTACTED: 'settings.privacy.friendsAndContacted',
  ONLY_ME: 'settings.privacy.onlyMe',
  OFF: 'settings.privacy.off'
}

export const getScopeLabelKey = (scope: PrivacySettings['birthdayVisibility']) => SCOPE_LABEL_KEYS[scope]

export const getBooleanLabelKey = (value: boolean) => (value ? 'settings.privacy.on' : 'settings.privacy.off')

const SEARCH_VISIBILITY_LABEL_KEYS: Record<PrivacySettings['phoneSearchVisibility'], string> = {
  PUBLIC: 'settings.privacy.searchVisibility.public',
  FRIENDS_OF_FRIENDS: 'settings.privacy.searchVisibility.friendsOfFriends',
  FRIENDS_ONLY: 'settings.privacy.searchVisibility.friendsOnly',
  NONE: 'settings.privacy.searchVisibility.none'
}

export const getSearchVisibilityLabelKey = (visibility: PrivacySettings['phoneSearchVisibility']) =>
  SEARCH_VISIBILITY_LABEL_KEYS[visibility] ?? SEARCH_VISIBILITY_LABEL_KEYS.PUBLIC

export interface PrivacyScreenValueKeys {
  birthday: string
  showAccessStatus: string
  showSeenStatus: string
  allowMessaging: string
  allowCalls: string
  allowViewAndComment: string
  nameSearchVisibility: string
  phoneSearchVisibility: string
}

export const mapPrivacySettingsToScreenValueKeys = (
  settings: PrivacySettings | null | undefined
): PrivacyScreenValueKeys => {
  const fallback = {
    birthday: 'settings.privacy.everyone',
    showAccessStatus: 'settings.privacy.off',
    showSeenStatus: 'settings.privacy.off',
    allowMessaging: 'settings.privacy.everyone',
    allowCalls: 'settings.privacy.everyone',
    allowViewAndComment: 'settings.privacy.everyone',
    nameSearchVisibility: 'settings.privacy.searchVisibility.public',
    phoneSearchVisibility: 'settings.privacy.searchVisibility.public'
  }

  if (!settings) return fallback

  return {
    birthday: getScopeLabelKey(settings.birthdayVisibility),
    showAccessStatus: getBooleanLabelKey(settings.showAccessStatus),
    showSeenStatus: getBooleanLabelKey(settings.showSeenStatus),
    allowMessaging: getScopeLabelKey(settings.allowMessaging),
    allowCalls: getScopeLabelKey(settings.allowCallsPrivacy),
    allowViewAndComment: getScopeLabelKey(settings.allowViewAndCommentOnJournal),
    nameSearchVisibility: getSearchVisibilityLabelKey(
      settings.nameSearchVisibility === 'NONE' ? 'PUBLIC' : settings.nameSearchVisibility
    ),
    phoneSearchVisibility: getSearchVisibilityLabelKey(settings.phoneSearchVisibility)
  }
}

export const mapBlockedAndHideCount = (settings: PrivacySettings | null | undefined) => {
  if (!settings) return 0
  return settings.blockedUserIds.length + (settings.blockUnknownUsers ? 1 : 0)
}

export const mapFriendSourcesEnabledCount = (settings: PrivacySettings | null | undefined) => {
  if (!settings) return 0
  return Number(settings.friendSourceByPhone) + Number(settings.friendSourceByQr)
}

export const mapUtilityPermissionsCount = (settings: PrivacySettings | null | undefined) => {
  if (!settings) return 0
  return settings.utilityPermissions.length
}
