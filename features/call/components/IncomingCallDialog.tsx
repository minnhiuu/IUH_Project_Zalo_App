import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import { useRouter } from 'expo-router'
import { useCallStore } from '@/store/use-call-store'
import { callApi } from '../api/call.api'
import { Phone, PhoneOff, Video } from 'lucide-react-native'
import { Image } from 'expo-image'

export const IncomingCallDialog = () => {
  const router = useRouter()
  const { isRinging, incomingCall, clearIncomingCall } = useCallStore()

  // Safety net auto-reject ringing timeout (45s)
  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout
    if (isRinging && incomingCall) {
      timeoutId = setTimeout(() => {
        console.log('[IncomingCallDialog] Ringing timeout. Auto-rejecting incoming call...')
        handleReject()
      }, 45000)
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isRinging, incomingCall])

  if (!isRinging || !incomingCall) return null

  const handleAccept = async () => {
    try {
      if (!incomingCall.isGroup) {
        // Only accept 1:1 via REST. Group call doesn't use REST accept.
        await callApi.accept(incomingCall.sessionId)
      }
      clearIncomingCall()
      router.push({
        pathname: '/call/[id]',
        params: {
          id: incomingCall.roomId,
          sessionId: incomingCall.sessionId,
          callerId: incomingCall.callerId,
          callerName: incomingCall.callerName,
          receiverName: incomingCall.callerName,
          receiverAvatar: incomingCall.callerAvatar || '',
          isGroup: incomingCall.isGroup ? '1' : '0',
          callKind: incomingCall.callKind || 'video'
        }
      })
    } catch (error) {
      console.error('Accept call failed:', error)
    }
  }

  const handleReject = async () => {
    try {
      if (!incomingCall.isGroup) {
        await callApi.reject(incomingCall.sessionId)
      }
    } catch (error) {
      console.error('Reject call failed:', error)
    } finally {
      clearIncomingCall()
    }
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.dialog}>
        <View style={styles.header}>
          {incomingCall.callerAvatar ? (
            <Image source={incomingCall.callerAvatar} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={[styles.avatar, styles.placeholderAvatar]}>
              <Text style={styles.placeholderText}>{incomingCall.callerName?.charAt(0)}</Text>
            </View>
          )}
          <Text style={styles.callerName}>{incomingCall.callerName}</Text>
          <Text style={styles.callType}>
            {incomingCall.isGroup ? 'Cuộc gọi nhóm' : 'Cuộc gọi đến'}
          </Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.button, styles.rejectBtn]} onPress={handleReject}>
            <PhoneOff color="white" size={28} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.acceptBtn]} onPress={handleAccept}>
            {incomingCall.callKind === 'video' ? (
              <Video color="white" size={28} />
            ) : (
              <Phone color="white" size={28} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  dialog: {
    width: '85%',
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  placeholderAvatar: {
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  callerName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  callType: {
    fontSize: 16,
    color: '#aaa',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectBtn: {
    backgroundColor: '#ef4444',
  },
  acceptBtn: {
    backgroundColor: '#22c55e',
  }
})
