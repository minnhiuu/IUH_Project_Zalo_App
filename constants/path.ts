/**
 * Route paths for navigation
 * Following web project structure
 */
export const PATHS = {
  HOME: '/',
  
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_OTP: '/auth/verify-otp',
  },

  TABS: {
    INDEX: '/(tabs)',
    CONTACTS: '/(tabs)/contacts',
    DISCOVER: '/(tabs)/discover',
    PROFILE: '/(tabs)/profile',
    TIMELINE: '/(tabs)/timeline',
  },

  USER: {
    PROFILE: '/user/profile',
    SETTINGS: '/user/settings',
    EDIT_PROFILE: '/user/edit-profile',
  },

  CHAT: {
    CONVERSATION: (id: string) => `/chat/${id}`,
    NEW: '/chat/new',
  },
} as const;

export default PATHS;