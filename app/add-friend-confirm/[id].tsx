import React, { useState } from 'react'
import {
  View,
  TouchableOpacity,
  Image,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text } from '@/components/ui/text'
import { SEMANTIC } from '@/constants/theme'
import { useSendFriendRequest } from '@/features/friend/queries/use-mutations'
import { useAuthStore } from '@/store'

const MAX_MESSAGE_LENGTH = 150

export default function AddFriendConfirmScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { id, fullName, avatar } = useLocalSearchParams<{
    id: string
    fullName: string
    avatar: string
  }>()

  const currentUser = useAuthStore((s) => s.user)
  const sendRequest = useSendFriendRequest()

  const defaultMessage = t('friend.addFriend.defaultMessage', {
    name: currentUser?.fullName || '',
  })

  const [message, setMessage] = useState(defaultMessage)
  const [blockActivity, setBlockActivity] = useState(false)

  const handleSendRequest = () => {
    if (!id) return
    sendRequest.mutate(
      { receiverId: id, message: message.trim() || undefined },
      {
        onSuccess: () => {
          router.back()
        },
      }
    )
  }

  const handleClearMessage = () => {
    setMessage('')
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header with SafeArea */}
      <View style={{ backgroundColor: SEMANTIC.primary }}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: SEMANTIC.primary }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
              height: 52,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginRight: 16 }}
            >
              <Ionicons name="close" size={26} color="#fff" />
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#fff' }}>
              {t('friend.addFriend.title')}
            </Text>
          </View>
        </SafeAreaView>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
          {/* User Info */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: '#E5E7EB',
            }}
          >
            <Image
              source={{ uri: avatar || 'https://i.pravatar.cc/150' }}
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: '#E5E7EB',
                marginRight: 16,
              }}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>
                {fullName}
              </Text>
              <TouchableOpacity style={{ marginLeft: 8, padding: 4 }}>
                <Ionicons name="pencil" size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Message Input */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderBottomWidth: 8,
              borderBottomColor: '#F3F4F6',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <TextInput
                value={message}
                onChangeText={(text) => {
                  if (text.length <= MAX_MESSAGE_LENGTH) {
                    setMessage(text)
                  }
                }}
                placeholder={t('friend.addFriend.messagePlaceholder')}
                placeholderTextColor="#9ca3af"
                multiline
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: '#111827',
                  minHeight: 60,
                  lineHeight: 24,
                  textAlignVertical: 'top',
                }}
              />
              {message.length > 0 && (
                <TouchableOpacity
                  onPress={handleClearMessage}
                  style={{ padding: 4, marginLeft: 8 }}
                >
                  <Ionicons name="close" size={20} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>
            <Text
              style={{
                fontSize: 13,
                color: '#9ca3af',
                textAlign: 'right',
                marginTop: 8,
              }}
            >
              {message.length}/{MAX_MESSAGE_LENGTH}
            </Text>
          </View>

          {/* Block Activity Switch */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderBottomWidth: 8,
              borderBottomColor: '#F3F4F6',
            }}
          >
            <Text style={{ fontSize: 15, color: '#111827', flex: 1, marginRight: 12 }}>
              {t('friend.addFriend.blockActivityLabel')}
            </Text>
            <Switch
              value={blockActivity}
              onValueChange={setBlockActivity}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={blockActivity ? SEMANTIC.primary : '#f4f3f4'}
            />
          </View>
        </ScrollView>

        {/* Submit Button */}
        <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#fff' }}>
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 8,
            }}
          >
            <TouchableOpacity
              onPress={handleSendRequest}
              disabled={sendRequest.isPending}
              activeOpacity={0.8}
              style={{
                backgroundColor: SEMANTIC.primary,
                paddingVertical: 14,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {sendRequest.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
                  {t('friend.addFriend.sendRequest')}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  )
}
