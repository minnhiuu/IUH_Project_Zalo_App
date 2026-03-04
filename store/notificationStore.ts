import { create } from 'zustand'

interface NotificationState {
  fcmToken: string | null
  setFcmToken: (fcmToken: string | null) => void
  clearFcmToken: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  fcmToken: null,

  setFcmToken: (fcmToken) => {
    console.log('[NotificationStore] setFcmToken:', fcmToken ? '***' + fcmToken.slice(-6) : null)
    set({ fcmToken })
  },

  clearFcmToken: () => {
    console.log('[NotificationStore] clearFcmToken')
    set({ fcmToken: null })
  }
}))

export const selectFcmToken = (state: NotificationState) => state.fcmToken

export default useNotificationStore
