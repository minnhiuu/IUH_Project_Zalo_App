import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import { View, StyleSheet, Alert, TouchableOpacity, DeviceEventEmitter, Animated, BackHandler } from 'react-native'
import { 
  ZegoUIKitPrebuiltCall, 
  ONE_ON_ONE_VIDEO_CALL_CONFIG, 
  ONE_ON_ONE_VOICE_CALL_CONFIG,
  GROUP_VIDEO_CALL_CONFIG,
  GROUP_VOICE_CALL_CONFIG
} from '@zegocloud/zego-uikit-prebuilt-call-rn'
import { LinearGradient } from 'expo-linear-gradient'
import ZegoUIKit from '@zegocloud/zego-uikit-rn'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuthStore } from '@/store'
import { callApi } from '@/features/call/api/call.api'
import { useCallStore } from '@/store/use-call-store'
import { useChatWebSocket } from '@/features/message/hooks'
import { Ionicons } from '@expo/vector-icons'
import { Text } from '@/components/ui/text'
import { UserAvatar } from '@/components/common/user-avatar'

export default function CallScreen() {
  const router = useRouter()
  const { id: roomId, sessionId, callerId, callerName, receiverId, receiverName, receiverAvatar, isGroup, callKind } = useLocalSearchParams()
  const user = useAuthStore((s) => s.user)
  const isGroupCall = isGroup === '1'
  const isVideo = callKind === 'video'
  const participantCount = useRef(1)
  const { clearIncomingCall } = useCallStore()
  const { sendMessage: wsSendMessage } = useChatWebSocket()

  // Outgoing caller waits in 'ringing' phase
  const isCaller = !isGroupCall && callerId === user?.id
  const [phase, setPhase] = useState<'ringing' | 'active'>(isCaller ? 'ringing' : 'active')

  // Hybrid calling kind: can upgrade voice call to video call dynamically
  const [localCallKind, setLocalCallKind] = useState<'audio' | 'video'>(isVideo ? 'video' : 'audio')
  const [isMuted, setIsMuted] = useState(false)
  const [seconds, setSeconds] = useState(0)

  // Safety net to prevent double ending or missing call end API calls
  const hasEndedRef = useRef(false)

  // Force-unmount Zego component before navigating away
  const [zegoMounted, setZegoMounted] = useState(true)

  // Pulsing animation for halos
  const pulseAnim = useRef(new Animated.Value(1)).current

  // Static refs to keep zegoConfig completely static and prevent room re-initialization
  const isVideoRef = useRef(isVideo)
  const localCallKindRef = useRef(localCallKind)
  const handleEndCallRef = useRef<() => void>(() => {})
  const userFullNameRef = useRef(user?.fullName)

  useEffect(() => { isVideoRef.current = isVideo }, [isVideo])
  useEffect(() => { localCallKindRef.current = localCallKind }, [localCallKind])
  useEffect(() => { handleEndCallRef.current = handleEndCall })
  useEffect(() => { userFullNameRef.current = user?.fullName }, [user?.fullName])

  // Synchronize mode signals immediately upon active connection
  useEffect(() => {
    if (phase === 'active' && isCaller && !isGroupCall) {
      const remoteUserId = (receiverId as string) || ''
      if (remoteUserId) {
        const timer = setTimeout(() => {
          if (localCallKind === 'video') {
            ZegoUIKit.sendInRoomCommand(JSON.stringify('ENABLE_VIDEO'), [remoteUserId]).catch(() => {})
          } else if (localCallKind === 'audio') {
            ZegoUIKit.sendInRoomCommand(JSON.stringify('SET_VOICE_MODE'), [remoteUserId]).catch(() => {})
          }
        }, 1500)
        return () => clearTimeout(timer)
      }
    }
  }, [phase, isCaller, isGroupCall, localCallKind, receiverId])

  // Voice call timer
  useEffect(() => {
    if (phase === 'active' && localCallKind === 'audio') {
      const interval = setInterval(() => {
        setSeconds((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [phase, localCallKind])

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remainingSecs = secs % 60
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (phase === 'ringing' || localCallKind === 'audio') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start()
    }
  }, [phase, localCallKind])

  // Safe navigation back helper
  const safeGoBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/(tabs)')
    }
  }, [router])

  // Ringing phase safety timeout (45s max)
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined
    if (phase === 'ringing' && isCaller) {
      timeoutId = setTimeout(() => {
        console.log('[CallScreen] Ringing timeout. Auto-cancelling call...')
        handleCancelOutgoing()
      }, 45000)
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [phase, isCaller])

  // Listen to call signals
  useEffect(() => {
    const signalSub = DeviceEventEmitter.addListener('call-signal', (signal) => {
      console.log('[CallScreen] Received call-signal in CallScreen:', signal, 'current sessionId:', sessionId, 'current roomId:', roomId)
      if (signal && signal.sessionId) {
        const matchesSession = sessionId && String(signal.sessionId) === String(sessionId)
        const matchesRoom = isGroupCall && roomId && String(signal.sessionId) === String(roomId)
        
        if (matchesSession || matchesRoom) {
          if (signal.signal === 'ACCEPTED') {
            setPhase('active')
          } else if (signal.signal === 'REJECTED') {
            Alert.alert('Cuộc gọi bị từ chối', 'Người nhận đã từ chối cuộc gọi.')
            hasEndedRef.current = true
            safeGoBack()
          } else if (signal.signal === 'CANCELLED' || signal.signal === 'ENDED') {
            hasEndedRef.current = true
            safeGoBack()
          }
        }
      }
    })

    return () => {
      signalSub.remove()
    }
  }, [sessionId])

  // Direct Zego engine listeners for native-level teardown (runs even if WebSocket is frozen)
  useEffect(() => {
    if (!sessionId) return
    const callbackID = 'CallScreen_NativeTeardown_' + sessionId

    ZegoUIKit.onUserLeave(callbackID, (users: any[]) => {
      console.log('[CallScreen] ZegoUIKit.onUserLeave triggered globally:', users)
      if (!isGroupCall) {
        handleEndCallRef.current()
      }
    })

    ZegoUIKit.onOnlySelfInRoom(callbackID, () => {
      console.log('[CallScreen] ZegoUIKit.onOnlySelfInRoom triggered globally')
      if (!isGroupCall) {
        handleEndCallRef.current()
      }
    })

    ZegoUIKit.onInRoomCommandReceived(callbackID, (fromUser: any, command: string) => {
      try {
        const cmd = JSON.parse(command)
        if (cmd === 'ENABLE_VIDEO') {
          setLocalCallKind('video')
          ZegoUIKit.turnCameraOn(user?.id || '', true)
        } else if (cmd === 'SET_VOICE_MODE') {
          setLocalCallKind('audio')
          ZegoUIKit.turnCameraOn(user?.id || '', false)
        }
      } catch {
        // ignore
      }
    })

    ZegoUIKit.onRoomStateChanged(callbackID, (roomID: string, reason: number, errorCode: number, extendedData: any) => {
      console.log('[CallScreen] ZegoUIKit.onRoomStateChanged triggered globally:', reason)
      // 7=Logout, 6=KickOut, 2=LoginFailed, 5=ReconnectFailed
      if (reason === 7 || reason === 6 || reason === 2 || reason === 5) {
        handleEndCallRef.current()
      }
    })

    return () => {
      ZegoUIKit.onUserLeave(callbackID)
      ZegoUIKit.onOnlySelfInRoom(callbackID)
      ZegoUIKit.onInRoomCommandReceived(callbackID)
      ZegoUIKit.onRoomStateChanged(callbackID)
    }
  }, [sessionId, isGroupCall, user?.id])

  // Intercept physical Back button on Android
  useEffect(() => {
    const backAction = () => {
      handleEndCallRef.current()
      return true
    }
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)
    return () => backHandler.remove()
  }, [sessionId, isGroupCall, phase, isCaller])

  // Track phase in a ref for unmount cleanup without adding it to dependencies
  const phaseRef = useRef(phase)
  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  // Safety net cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (!hasEndedRef.current) {
        hasEndedRef.current = true
        if (!isGroupCall && sessionId) {
          if (phaseRef.current === 'ringing' && isCaller) {
            callApi.cancel(sessionId as string).catch(() => {})
          } else {
            callApi.end(sessionId as string).catch(() => {})
          }
        }
      }
      clearIncomingCall()
    }
  }, [sessionId, isGroupCall, isCaller])

  const appID = Number(process.env.EXPO_PUBLIC_ZEGO_APP_ID || 0)
  const appSign = process.env.EXPO_PUBLIC_ZEGO_APP_SIGN || ''

  // Hangup call
  const handleEndCall = useCallback(async () => {
    if (hasEndedRef.current) return
    hasEndedRef.current = true
    console.log('[CallScreen] handleEndCall called, isGroupCall:', isGroupCall)

    // Step 1: Force-unmount Zego component immediately to release the room
    setZegoMounted(false)

    try {
      if (!isGroupCall && sessionId) {
        await callApi.end(sessionId as string)
      } else if (isGroupCall) {
        // Explicitly leave the Zego room for group calls
        try {
          ZegoUIKit.leaveRoom()
        } catch (leaveErr) {
          console.warn('[CallScreen] ZegoUIKit.leaveRoom() failed:', leaveErr)
        }
        if (participantCount.current <= 1) {
          const conversationId = (roomId as string).replace('group-call-', '')
          const payload = `[GROUP_CALL]::${JSON.stringify({
            roomId: roomId,
            callKind: localCallKind,
            status: 'ended',
            callerName: user?.fullName || 'User',
            durationSeconds: seconds
          })}`
          wsSendMessage(conversationId, payload, null, false)
        }
      }
    } catch (e) {
      console.warn('End call failed', e)
    }

    // Step 2: Navigate back after giving React a tick to unmount Zego
    setTimeout(() => {
      safeGoBack()
    }, 300)
  }, [sessionId, isGroupCall, roomId, localCallKind, user?.fullName, wsSendMessage])

  // Cancel call (Ringing phase)
  const handleCancelOutgoing = useCallback(async () => {
    if (hasEndedRef.current) return
    hasEndedRef.current = true

    try {
      if (sessionId) {
        await callApi.cancel(sessionId as string)
      }
    } catch (e) {
      console.warn('Cancel call failed', e)
    }
    safeGoBack()
  }, [sessionId])

  // Toggle Microphone
  const handleToggleMute = () => {
    const nextMuted = !isMuted
    setIsMuted(nextMuted)
    ZegoUIKit.turnMicrophoneOn(user?.id || '', !nextMuted)
  }

  // Upgrade voice call to video call
  const handleUpgradeToVideo = () => {
    setLocalCallKind('video')
    ZegoUIKit.turnCameraOn(user?.id || '', true)
  }

  const zegoConfig = useMemo(() => {
    const baseConfig = isGroupCall
      ? (isVideoRef.current ? GROUP_VIDEO_CALL_CONFIG : GROUP_VOICE_CALL_CONFIG)
      : (isVideoRef.current ? ONE_ON_ONE_VIDEO_CALL_CONFIG : ONE_ON_ONE_VOICE_CALL_CONFIG)

    return {
      ...baseConfig,
      turnOnCameraWhenJoining: isVideoRef.current,
      showLeaveRoomConfirmDialog: false,
      ...(isGroupCall ? {
        layout: {
          mode: 'GALLERY' as any,
          config: {
            addBorderRadiusAndSpacingBetweenView: true,
          },
        },
      } : {}),
      onHangUp: () => {
        handleEndCallRef.current()
      },
      onLeaveRoom: () => {
        handleEndCallRef.current()
      },
      onOnlySelfInRoom: () => {
        if (!isGroupCall) {
          handleEndCallRef.current()
        }
      },
      onUserJoin: (users: any) => {
        participantCount.current += users.length
        if (isCaller && !isGroupCall) {
          const remoteUserId = (receiverId as string) || ''
          if (remoteUserId) {
            if (localCallKindRef.current === 'video') {
              ZegoUIKit.sendInRoomCommand(JSON.stringify('ENABLE_VIDEO'), [remoteUserId]).catch(() => {})
            } else if (localCallKindRef.current === 'audio') {
              ZegoUIKit.sendInRoomCommand(JSON.stringify('SET_VOICE_MODE'), [remoteUserId]).catch(() => {})
            }
          }
        }
      },
      onUserLeave: (users: any) => {
        participantCount.current -= users.length
        if (participantCount.current <= 1 && !isGroupCall) {
          handleEndCallRef.current()
        }
      }
    }
  }, [roomId, isGroupCall, wsSendMessage])

  if (!user || !roomId) {
    return <View style={styles.container} />
  }

  // Outgoing Ringing Phase View
  if (phase === 'ringing') {
    const targetName = (receiverName as string) || 'Người nhận'
    const targetAvatar = (receiverAvatar as string) || null

    return (
      <View style={styles.ringingContainer}>
        <View style={styles.ringingContent}>
          <Animated.View style={[styles.avatarWrapper, { transform: [{ scale: pulseAnim }] }]}>
            <UserAvatar source={targetAvatar || undefined} name={targetName} size='xl' />
          </Animated.View>
          <Text style={styles.callingStatusText}>
            {localCallKind === 'video' ? 'Đang gọi video đến' : 'Đang gọi thoại đến'}
          </Text>
          <Text style={styles.receiverNameText}>{targetName}</Text>
          <Text style={styles.ringingSubText}>Đang đổ chuông...</Text>
        </View>

        <View style={styles.ringingBottom}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCancelOutgoing}
            style={styles.hangupButton}
          >
            <Ionicons name='phone-portrait-outline' size={28} color='#fff' style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>
          <Text style={styles.hangupLabel}>Hủy cuộc gọi</Text>
        </View>
      </View>
    )
  }

  const targetName = (receiverName as string) || 'Bạn bè'
  const targetAvatar = (receiverAvatar as string) || null

  return (
    <View style={styles.container}>
      {/* Voice Call UI */}
      {localCallKind === 'audio' && (
        <LinearGradient
          colors={['#1c1c3a', '#121224', '#0a0a14']}
          style={styles.voiceCallContainer}
        >
          <View style={styles.voiceCallHeader}>
            <Text style={styles.voiceCallConnecting}>ĐANG KẾT NỐI THOẠI</Text>
            <Text style={styles.receiverNameText}>{targetName}</Text>
            <Text style={styles.timerText}>{formatTime(seconds)}</Text>
          </View>

          <View style={styles.avatarsWrapper}>
            <View style={styles.avatarSubWrapper}>
              <Animated.View style={[styles.avatarPulsingHalo, { transform: [{ scale: pulseAnim }] }]} />
              <View style={styles.avatarFixedBox}>
                <UserAvatar source={user.avatar || undefined} name={user.fullName || 'Bạn'} size='xl' />
              </View>
              <Text style={styles.avatarLabel}>Bạn</Text>
            </View>

            <View style={styles.avatarSubWrapper}>
              <Animated.View style={[styles.avatarPulsingHalo, { transform: [{ scale: pulseAnim }] }]} />
              <View style={styles.avatarFixedBox}>
                <UserAvatar source={targetAvatar || undefined} name={targetName} size='xl' />
              </View>
              <Text style={styles.avatarLabel}>{targetName}</Text>
            </View>
          </View>

          <View style={styles.voiceControls}>
            {/* Toggle Mic */}
            <TouchableOpacity onPress={handleToggleMute} style={styles.controlBtnWrapper}>
              <View style={[styles.controlIconCircle, isMuted && styles.controlIconCircleMuted]}>
                <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={24} color={isMuted ? '#EF4444' : '#FFF'} />
              </View>
              <Text style={styles.controlLabel}>{isMuted ? 'Bật Mic' : 'Tắt Mic'}</Text>
            </TouchableOpacity>

            {/* End Call */}
            <TouchableOpacity onPress={handleEndCall} style={styles.controlBtnWrapper}>
              <View style={styles.hangupButton}>
                <Ionicons name='phone-portrait-outline' size={26} color='#fff' style={{ transform: [{ rotate: '135deg' }] }} />
              </View>
              <Text style={styles.controlLabel}>Gác máy</Text>
            </TouchableOpacity>

            {/* Turn On Video */}
            <TouchableOpacity onPress={handleUpgradeToVideo} style={styles.controlBtnWrapper}>
              <View style={styles.controlIconCircle}>
                <Ionicons name='videocam' size={24} color='#FFF' />
              </View>
              <Text style={styles.controlLabel}>Bật Video</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      )}

      {/* Embedded Zego container */}
      {zegoMounted && (
        <View style={localCallKind === 'audio' ? styles.hiddenZego : styles.container}>
          <ZegoUIKitPrebuiltCall
            appID={appID}
            appSign={appSign}
            userID={user.id}
            userName={user.fullName || 'User'}
            callID={roomId as string}
            onHangUp={handleEndCall}
            config={zegoConfig}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  hiddenZego: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  ringingContainer: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    justifyContent: 'space-between',
    paddingVertical: 80,
    alignItems: 'center',
  },
  ringingContent: {
    alignItems: 'center',
    marginTop: 40,
  },
  avatarWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
    borderRadius: 999,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginBottom: 30,
  },
  callingStatusText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    marginBottom: 10,
  },
  receiverNameText: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: '700',
    marginBottom: 8,
  },
  ringingSubText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  ringingBottom: {
    alignItems: 'center',
  },
  hangupButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 12,
  },
  hangupLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  voiceCallContainer: {
    flex: 1,
    backgroundColor: '#1C1C3A',
    justifyContent: 'space-between',
    paddingVertical: 80,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  voiceCallHeader: {
    alignItems: 'center',
    marginTop: 20,
  },
  voiceCallConnecting: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  timerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    marginTop: 4,
  },
  avatarsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 50,
    marginVertical: 40,
  },
  avatarSubWrapper: {
    alignItems: 'center',
    position: 'relative',
    width: 88,
  },
  avatarFixedBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPulsingHalo: {
    position: 'absolute',
    width: 84,
    height: 84,
    top: -10,
    left: 2,
    borderRadius: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  avatarLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginTop: 10,
  },
  voiceControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    width: '100%',
  },
  controlBtnWrapper: {
    alignItems: 'center',
  },
  controlIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  controlIconCircleMuted: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  controlLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  }
})
