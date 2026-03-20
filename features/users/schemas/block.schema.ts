export type BlockPreference = {
  message: boolean
  call: boolean
  story: boolean
}

export type BlockUserRequest = {
  blockedUserId: string
  blockMessage?: boolean
  blockCall?: boolean
  blockStory?: boolean
}

export type UpdateBlockPreferenceRequest = {
  blockMessage?: boolean
  blockCall?: boolean
  blockStory?: boolean
}

export type BlockedUserResponse = {
  id: string
  blockerId: string
  blockedUserId: string
  preference: BlockPreference
  createdAt: string
  lastModifiedAt: string
}

export type BlockedUserDetailResponse = {
  id: string
  blockedUserId: string
  fullName: string
  avatar: string
  bio: string | null
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null
  dob: string | null
  preference: BlockPreference
  blockedAt: string
}
