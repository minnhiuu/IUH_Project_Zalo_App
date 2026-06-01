import React, { useRef, useEffect } from 'react'
import { View, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AiWelcomeScreen } from './ai-welcome-screen'
import { AiMessageBubble } from './ai-message-bubble'
import { useAiChat } from '../hooks/use-ai-chat'
import { type ConversationResponse } from '../schemas'
import { BONDHUB_AI } from '@/constants/system'
import { ChatHeader } from './chat-header'
import { ChatInputBar } from './chat-input-bar'
import { MessageBubble } from './message-bubble'
import { MessageType, MessageStatus, type MessageResponse } from '../schemas'
import { useAuthStore } from '@/store'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useColorScheme } from '@/hooks/use-color-scheme'

interface AiChatWindowProps {
  conversation: ConversationResponse
}

export function AiChatWindow({ conversation }: AiChatWindowProps) {
  const insets = useSafeAreaInsets()
  const flatListRef = useRef<FlatList>(null)
  const { messages, isInitialLoading, sendMessage, isSending, clearHistory } = useAiChat(conversation.id, { loadHistory: true })
  const router = useRouter()
  const { t } = useTranslation()
  const isDark = useColorScheme() === 'dark'
  const [inputText, setInputText] = React.useState('')
  const currentUser = useAuthStore((s) => s.user)
  const currentUserId = currentUser?.id || ''

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
      }, 100)
    }
  }, [messages.length])

  const handleSend = () => {
    if (!inputText.trim()) return
    sendMessage(inputText)
    setInputText('')
  }

  const handleSuggestionSelect = (text: string) => {
    sendMessage(text)
  }

  if (isInitialLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#1d4ed8" />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#09090b' : '#E2E8F0' }}>
      <ChatHeader
        name={BONDHUB_AI.fullName}
        avatar={BONDHUB_AI.avatar}
        isOnline={true}
        userId={BONDHUB_AI.userId}
        subtitle={t('chat.aiWindow.assistantTag', { defaultValue: 'AI Assistant' })}
        isGroup={false}
        onBack={() => router.back()}
        onReload={clearHistory}
      />
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {messages.length === 0 ? (
          <View className="flex-1">
            <AiWelcomeScreen avatarUrl={BONDHUB_AI.avatar} onSelect={handleSuggestionSelect} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            className="flex-1 px-2"
            data={[...messages].reverse()}
            keyExtractor={(item) => item.id}
            inverted={true}
            renderItem={({ item, index }) => {
              return (
                <AiMessageBubble
                  msg={item}
                  avatarUrl={BONDHUB_AI.avatar}
                  onSuggestionClick={handleSuggestionSelect}
                  isLatest={index === 0}
                />
              )
            }}
            contentContainerStyle={{ paddingBottom: 16, paddingTop: 16 }}
            showsVerticalScrollIndicator={false}
          />
        )}
        
        <ChatInputBar
          value={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
          placeholder="Nhập tin nhắn..."
          isUploading={isSending}
          isAiMode={true}
        />
      </KeyboardAvoidingView>
    </View>
  )
}
