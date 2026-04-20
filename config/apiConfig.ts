// API Configuration
// URLs are loaded from .env file (EXPO_PUBLIC_* variables)
// Backend uses Spring Cloud Gateway at port 8080

export type Environment = 'development' | 'staging' | 'production'

interface ApiConfigType {
  apiUrl: string
  socketUrl: string
}

const ENV: Environment = (process.env.EXPO_PUBLIC_ENV as Environment) || 'development'

const getApiUrl = (): string => {
  return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api'
}

const getSocketUrl = (): string => {
  return process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:8080'
}

const API_CONFIG: Record<Environment, ApiConfigType> = {
  development: {
    apiUrl: getApiUrl(),
    socketUrl: getSocketUrl()
  },
  staging: {
    apiUrl: 'https://staging-api.bondhub.com',
    socketUrl: 'https://staging-api.bondhub.com'
  },
  production: {
    apiUrl: 'https://api.bondhub.com',
    socketUrl: 'https://api.bondhub.com'
  }
}

// API Endpoints - Based on Gateway routes (StripPrefix=1)
// Matching backend auth-service AuthController endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login', // POST - LoginRequest
    REGISTER: '/auth/register', // POST - RegisterInitRequest (2-step with OTP)
    REGISTER_VERIFY: '/auth/register/verify', // POST - RegisterVerifyRequest
    REFRESH: '/auth/refresh', // POST - RefreshTokenRequest
    LOGOUT: '/auth/logout', // POST - LogoutRequest
    VALIDATE: '/auth/validate', // GET ?token=xxx
    FORGOT_PASSWORD: '/auth/forgot-password', // POST - Request OTP for password reset
    RESET_PASSWORD: '/auth/reset-password', // POST - Reset password with OTP
    CHANGE_PASSWORD: '/auth/change-password', // POST - Change password (authenticated)
    QR: {
      GENERATE: '/auth/qr/generate',
      WAIT: (qrId: string) => `/auth/qr/wait/${qrId}`,
      MOBILE: '/auth/qr/mobile', // Endpoint for mobile to scan/accept/reject
      STATUS: '/auth/qr/status', // Get QR status
      SCAN: '/auth/qr/scan',
      ACCEPT: '/auth/qr/accept',
      REJECT: '/auth/qr/reject'
    }
  },
  USER: {
    ME: '/users/me', // GET - Get current user profile
    PROFILE: '/users/profile', // Deprecated - use ME
    UPDATE_PROFILE: '/users/me', // PUT - Update current user profile
    UPDATE_BIO: '/users/profile/bio', // PATCH - Update bio only
    UPDATE_AVATAR: '/users/profile/avatar', // PATCH - Update avatar
    UPDATE_BACKGROUND: '/users/profile/background', // PATCH - Update background
    UPDATE_BACKGROUND_POSITION: '/users/profile/background/position', // PATCH - Update background position
    SEARCH: '/search/users',
    GET_BY_ID: (id: string) => `/users/${id}`,
    RECENT_SEARCH: {
      ITEMS: '/search/recent/items',
      QUERIES: '/search/recent/queries',
      ADD: '/search/recent',
      REMOVE: (id: string) => `/search/recent/${id}`,
      CLEAR_ALL: '/search/recent/clear-all'
    }
  },
  DEVICE: {
    SESSIONS: '/auth/devices/sessions', // GET - Get grouped active devices with sessions
    DELETE: (id: string) => `/auth/devices/${id}`, // DELETE - Delete a device
    LOGOUT_DEVICE: '/auth/logout-device', // POST - Logout a specific device by sessionId
    LOGOUT_OTHERS: '/auth/logout-others' // POST - Logout all other devices
  },
  MESSAGE: {
    CONVERSATIONS: '/messages/conversations',
    DELETE_CONVERSATION: (conversationId: string) => `/messages/conversations/${conversationId}`,
    CLEAR_HISTORY: (conversationId: string) => `/messages/conversations/${conversationId}/clear-history`,
    GROUPS: '/messages/conversations/groups',
    GROUP_INVITES: (conversationId: string) => `/messages/conversations/groups/${conversationId}/invites`,
    MESSAGES: (conversationId: string) => `/messages/conversations/${conversationId}/messages`,
    SEND: (conversationId: string) => `/messages/conversations/${conversationId}/messages`,
    PARTNER_CONVERSATION: (partnerId: string) => `/messages/conversations/partner/${partnerId}`,
    MARK_READ: (conversationId: string) => `/messages/conversations/${conversationId}/read`,
    UNREAD_ANCHOR: (conversationId: string) => `/messages/conversations/${conversationId}/unread-anchor`,
    PINS: (conversationId: string) => `/messages/conversations/${conversationId}/pins`,
    PIN_MESSAGE: (conversationId: string, messageId: string) =>
      `/messages/conversations/${conversationId}/messages/${messageId}/pin`,
    UNPIN_MESSAGE: (conversationId: string, messageId: string) =>
      `/messages/conversations/${conversationId}/messages/${messageId}/pin`,
    REVOKE: (messageId: string) => `/messages/${messageId}/revoke`,
    DELETE_FOR_ME: (messageId: string) => `/messages/me/${messageId}`,
    TOGGLE_REACTION: (messageId: string) => `/messages/messages/${messageId}/reactions`,
    REMOVE_REACTIONS: (messageId: string) => `/messages/messages/${messageId}/reactions/me`,
    MEDIA: (conversationId: string) => `/messages/conversations/${conversationId}/media`,
    SEEN_MEMBERS: (conversationId: string, messageId: string) =>
      `/messages/conversations/${conversationId}/messages/${messageId}/seen-members`,
    UPDATE_GROUP_NAME: (conversationId: string) => `/messages/conversations/${conversationId}/name`,
    UPDATE_GROUP_AVATAR: (conversationId: string) => `/messages/conversations/${conversationId}/avatar`,
    DISBAND_GROUP: (conversationId: string) => `/messages/conversations/${conversationId}/groups`,
    LEAVE_GROUP: (conversationId: string) => `/messages/conversations/${conversationId}/leave`,
    FRIENDS_DIRECTORY: '/messages/conversations/friends-directory',
    SEARCH_MEMBERS: '/messages/conversations/search-members',
    ADD_MEMBERS: (conversationId: string) => `/messages/conversations/${conversationId}/members`,
    GROUP_MEMBERS: (conversationId: string) => `/messages/conversations/${conversationId}/group-members`,
    REMOVE_MEMBER: (conversationId: string, targetUserId: string) =>
      `/messages/conversations/${conversationId}/members/${targetUserId}`,
    PROMOTE_ADMIN: (conversationId: string, targetUserId: string) =>
      `/messages/conversations/${conversationId}/members/${targetUserId}/promote`,
    DEMOTE_ADMIN: (conversationId: string, targetUserId: string) =>
      `/messages/conversations/${conversationId}/members/${targetUserId}/demote`,
    TRANSFER_OWNER: (conversationId: string, targetUserId: string) =>
      `/messages/conversations/${conversationId}/transfer-owner/${targetUserId}`,
    GROUP_ADMINS: (conversationId: string) => `/messages/conversations/${conversationId}/group-admins`,
    ADMIN_CANDIDATES: (conversationId: string) => `/messages/conversations/${conversationId}/admin-candidates`,
    UPDATE_GROUP_SETTINGS: (conversationId: string) => `/messages/conversations/${conversationId}/settings`,
    REFRESH_JOIN_LINK: (conversationId: string) => `/messages/conversations/${conversationId}/join-link/refresh`,
    GENERATE_JOIN_LINK: (conversationId: string) => `/messages/conversations/${conversationId}/join-link`,
    JOIN_BY_LINK: (token: string) => `/messages/conversations/join/${token}`,
    JOIN_PREVIEW: (token: string) => `/messages/conversations/join/${token}/preview`,
    UPDATE_JOIN_QUESTION: (conversationId: string) => `/messages/conversations/${conversationId}/join-question`,
    JOIN_REQUESTS: (conversationId: string) => `/messages/conversations/${conversationId}/join-requests`,
    APPROVE_JOIN_REQUEST: (conversationId: string, requestId: string) =>
      `/messages/conversations/${conversationId}/join-requests/${requestId}/approve`,
    REJECT_JOIN_REQUEST: (conversationId: string, requestId: string) =>
      `/messages/conversations/${conversationId}/join-requests/${requestId}/reject`,
    CANCEL_MY_JOIN_REQUEST: (conversationId: string) =>
      `/messages/conversations/${conversationId}/join-requests/me`,
    BLOCK_MEMBER: (conversationId: string, targetUserId: string) =>
      `/messages/conversations/${conversationId}/block/${targetUserId}`,
    UNBLOCK_MEMBER: (conversationId: string, targetUserId: string) =>
      `/messages/conversations/${conversationId}/block/${targetUserId}`,
    BLOCKED_MEMBERS: (conversationId: string) => `/messages/conversations/${conversationId}/blocked-members`,
    BLOCK_CANDIDATES: (conversationId: string) => `/messages/conversations/${conversationId}/block-candidates`,
    MY_GROUPS: '/messages/conversations/groups/mine'
  },
  FILE: {
    UPLOAD: '/files/upload'
  },
  NOTIFICATION: {
    LIST: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    REGISTER_DEVICE: '/notifications/devices',
    UNREGISTER_DEVICE: (token: string) => `/notifications/devices?token=${token}`
  },
  FRIENDSHIP: {
    // Friend requests
    SEND_REQUEST: '/friendships/requests', // POST
    ACCEPT_REQUEST: (friendshipId: string) => `/friendships/requests/${friendshipId}/accept`, // PUT
    DECLINE_REQUEST: (friendshipId: string) => `/friendships/requests/${friendshipId}/decline`, // PUT
    CANCEL_REQUEST: (friendshipId: string) => `/friendships/requests/${friendshipId}/cancel`, // PUT
    RECEIVED_REQUESTS: '/friendships/requests/received', // GET
    SENT_REQUESTS: '/friendships/requests/sent', // GET
    // Friends
    MY_FRIENDS: '/friendships/friends', // GET
    UNFRIEND: (friendId: string) => `/friendships/friends/${friendId}`, // DELETE
    // Status & mutual
    CHECK_STATUS: (userId: string) => `/friendships/status/${userId}`, // GET
    BATCH_STATUS: '/friendships/batch-status', // POST
    MUTUAL_FRIENDS: (userId: string) => `/friendships/mutual/${userId}`, // GET
    MUTUAL_FRIENDS_COUNT: (userId: string) => `/friendships/mutual/${userId}/count`, // GET
    SUGGESTIONS: '/friendships/suggestions', // GET
    GRAPH_SUGGESTIONS: '/friendships/suggestions/graph', // GET
    CONTACT_SUGGESTIONS: '/friendships/suggestions/contacts', // GET
    // Contact import
    IMPORT_CONTACTS: '/contacts/import' // POST
  },
  SETTINGS: {
    ME: '/users/settings/me', // GET - UserSettingResponse (all sections)
    BY_USER: (userId: string) => `/users/settings/${userId}`,
    ME_SECTION: (section: string) => `/users/settings/me/${section}`,
    LANGUAGE_AND_INTERFACE: '/users/settings/me/language-and-interface',
    NOTIFICATION: '/users/settings/me/notification',
    MESSAGE: '/users/settings/me/message',
    CALL: '/users/settings/me/call',
    PRIVACY: '/users/settings/me/privacy',
    CONTACT: '/users/settings/me/contact',
    BACKUP_RESTORE: '/users/settings/me/backup-restore',
    ACCOUNT_SECURITY: '/users/settings/me/account-security',
    JOURNAL: '/users/settings/me/journal',
    DATA_ON_DEVICE: '/users/settings/me/data-on-device'
  },
  BLOCK: {
    BLOCK: '/blocks',
    UNBLOCK: (id: string) => `/blocks/${id}`,
    UPDATE_PREFERENCE: (id: string) => `/blocks/${id}/preferences`,
    LIST: '/blocks',
    LIST_DETAILS: '/blocks/details',
    CHECK: (id: string) => `/blocks/${id}/check`,
    DETAILS: (id: string) => `/blocks/${id}`
  }
} as const

const apiConfig = {
  ...API_CONFIG[ENV],
  env: ENV,
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  endpoints: API_ENDPOINTS
}

// Log config in development for debugging
if (__DEV__) {
  console.log('[apiConfig] Environment:', ENV)
  console.log('[apiConfig] API URL:', apiConfig.apiUrl)
}

export default apiConfig
