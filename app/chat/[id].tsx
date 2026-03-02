import React, { useState, useRef } from 'react'
import {
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ChatHeader, MessageBubble, ChatInputBar } from '@/features/message/components'

interface MockMessage {
  id: string
  content: string
  timestamp: string
  isOwn: boolean
  senderName?: string
  senderAvatar?: string
}

// Temporary mock data — will be replaced with real API
const MOCK_MESSAGES: MockMessage[] = [
  {
    id: '1',
    content: 'Ch hiểu về elasticsearch mà',
    timestamp: '16:56',
    isOwn: false,
  },
  {
    id: '2',
    content: 'Nào hiểu đi r hiểu s nó k ăn',
    timestamp: '16:56',
    isOwn: false,
  },
  {
    id: '3',
    content: 'T nghiên cứu sync mongo với es',
    timestamp: '16:57',
    isOwn: false,
  },
  {
    id: '4',
    content: 'Phải 2 ngày',
    timestamp: '16:57',
    isOwn: false,
  },
  {
    id: '5',
    content: 'Để tối ưu',
    timestamp: '16:58',
    isOwn: false,
  },
  {
    id: '6',
    content: 'T insert tới 10k user để test time mà',
    timestamp: '16:58',
    isOwn: false,
  },
  {
    id: '7',
    content: 'Oke siêng vậy 😄',
    timestamp: '16:59',
    isOwn: true,
  },
  {
    id: '8',
    content: 'Mà sao tìm theo sdt không ra vậy?',
    timestamp: '17:00',
    isOwn: true,
  },
]

export default function ChatScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<{
    id: string
    name: string
    avatar: string
    userId: string
  }>()
  const [inputText, setInputText] = useState('')
  const [messages, setMessages] = useState<MockMessage[]>(MOCK_MESSAGES)
  const flatListRef = useRef<FlatList>(null)

  const handleSend = () => {
    if (!inputText.trim()) return

    const newMsg: MockMessage = {
      id: String(Date.now()),
      content: inputText.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    }
    setMessages((prev) => [...prev, newMsg])
    setInputText('')

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#E8ECEF' }}>
      {/* Header */}
      <ChatHeader
        name={params.name || 'Chat'}
        avatar={params.avatar}
        userId={params.userId || params.id}
        subtitle="Vừa mới truy cập"
        onProfilePress={() => {
          const targetUserId = params.userId || params.id
          if (targetUserId) {
            router.push(`/user-profile/${targetUserId}` as any)
          }
        }}
      />

      {/* Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 12 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          renderItem={({ item, index }) => {
            const prevMsg = index > 0 ? messages[index - 1] : null
            const showAvatar = !item.isOwn && (prevMsg?.isOwn || index === 0)
            return (
              <MessageBubble
                content={item.content}
                timestamp={item.timestamp}
                isOwn={item.isOwn}
                senderAvatar={params.avatar}
                senderId={params.userId || params.id}
                showAvatar={showAvatar}
                onAvatarPress={(userId) => {
                  router.push(`/user-profile/${userId}` as any)
                }}
              />
            )
          }}
        />

        {/* Input Bar */}
        <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#fff' }}>
          <ChatInputBar
            value={inputText}
            onChangeText={setInputText}
            onSend={handleSend}
            placeholder="Tin nhắn"
          />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  )
}
