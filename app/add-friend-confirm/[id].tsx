import React, { useState } from 'react'
import {
  View,
  TouchableOpacity,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Text, Header } from '@/components/ui'
import { UserAvatar } from '@/components'
import { useTheme } from '@/context/theme-context'
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
  const { colors } = useTheme()

  const defaultMessage = t('friend.addFriend.defaultMessage', {
    name: currentUser?.fullName || ''
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
        }
      }
    )
  }

  const handleClearMessage = () => {
    setMessage('')
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}>
      <Header title={t('friend.addFriend.title')} showBackButton onBackPress={() => router.back()} showSearch={false} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps='handled'>
          {/* User Info */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              backgroundColor: colors.background
            }}
          >
            <UserAvatar source={avatar} name={fullName} size='xl' className='mr-4' />
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>{fullName}</Text>
              <TouchableOpacity style={{ marginLeft: 8, padding: 4 }}>
                <Ionicons name='pencil' size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Message Input */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderBottomWidth: 8,
              borderBottomColor: colors.backgroundSecondary,
              backgroundColor: colors.background
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
                placeholderTextColor={colors.textSecondary}
                multiline
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: colors.text,
                  minHeight: 60,
                  lineHeight: 24,
                  textAlignVertical: 'top'
                }}
              />
              {message.length > 0 && (
                <TouchableOpacity onPress={handleClearMessage} style={{ padding: 4, marginLeft: 8 }}>
                  <Ionicons name='close' size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            <Text
              style={{
                fontSize: 13,
                color: colors.textSecondary,
                textAlign: 'right',
                marginTop: 8
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
              borderBottomColor: colors.backgroundSecondary,
              backgroundColor: colors.background
            }}
          >
            <Text style={{ fontSize: 15, color: colors.text, flex: 1, marginRight: 12 }}>
              {t('friend.addFriend.blockActivityLabel')}
            </Text>
            <Switch
              value={blockActivity}
              onValueChange={setBlockActivity}
              trackColor={{ false: colors.border, true: colors.tint }}
              thumbColor={blockActivity ? colors.tint : colors.backgroundSecondary}
            />
          </View>
        </ScrollView>

        {/* Submit Button */}
        <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.background }}>
          <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
            <TouchableOpacity
              onPress={handleSendRequest}
              disabled={sendRequest.isPending}
              activeOpacity={0.8}
              style={{
                backgroundColor: colors.tint,
                paddingVertical: 14,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {sendRequest.isPending ? (
                <ActivityIndicator size='small' color='#fff' />
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
