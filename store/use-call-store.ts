import { create } from 'zustand'

export interface IncomingCallInfo {
  sessionId: string
  roomId: string
  callerId: string
  callerName: string
  callerAvatar?: string | null
  isGroup: boolean
  callKind?: 'audio' | 'video'
}

interface CallStoreState {
  isRinging: boolean
  incomingCall: IncomingCallInfo | null
  activeGroupCallId: string | null
  
  setIncomingCall: (callInfo: IncomingCallInfo) => void
  clearIncomingCall: () => void
  setActiveGroupCallId: (roomId: string | null) => void
}

export const useCallStore = create<CallStoreState>((set) => ({
  isRinging: false,
  incomingCall: null,
  activeGroupCallId: null,

  setIncomingCall: (callInfo) => set({ isRinging: true, incomingCall: callInfo }),
  clearIncomingCall: () => set({ isRinging: false, incomingCall: null }),
  setActiveGroupCallId: (roomId) => set({ activeGroupCallId: roomId })
}))
