import http from '@/lib/http'
import type { ApiResponse } from '@/types/common.types'

export interface InitiateCallRequest {
  receiverId: string
  callKind?: string
}

export interface CallInitiateResponse {
  sessionId: string
  roomId: string
  rtcToken: string
  appId: number
  callerId: string
  callerName: string
  callerAvatar: string | null
  receiverId: string
  receiverName: string
  receiverAvatar: string | null
}

export const callApi = {
  initiate: async (data: InitiateCallRequest) => {
    const res = await http.post<ApiResponse<CallInitiateResponse>>('/messages/calls/initiate', data)
    return res.data
  },
  accept: async (sessionId: string) => {
    const res = await http.post<ApiResponse<any>>(`/messages/calls/${sessionId}/accept`)
    return res.data
  },
  reject: async (sessionId: string) => {
    const res = await http.post<ApiResponse<any>>(`/messages/calls/${sessionId}/reject`)
    return res.data
  },
  cancel: async (sessionId: string) => {
    const res = await http.post<ApiResponse<any>>(`/messages/calls/${sessionId}/cancel`)
    return res.data
  },
  end: async (sessionId: string) => {
    const res = await http.post<ApiResponse<any>>(`/messages/calls/${sessionId}/end`)
    return res.data
  }
}
