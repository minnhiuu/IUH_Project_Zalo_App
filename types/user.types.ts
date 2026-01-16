// User types
export interface User {
  id: string;
  phone: string;
  email?: string;
  fullName: string;
  avatar?: string;
  coverImage?: string;
  gender?: 'male' | 'female' | 'other';
  birthday?: string;
  bio?: string;
  isOnline?: boolean;
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  friendCount?: number;
  mutualFriends?: number;
  isFriend?: boolean;
  friendRequestSent?: boolean;
  friendRequestReceived?: boolean;
}

export interface UserSettings {
  notifications: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  allowStrangerMessages: boolean;
  language: string;
  theme: 'light' | 'dark' | 'system';
}
