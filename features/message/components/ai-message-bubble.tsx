import React from 'react'
import { View, Image } from 'react-native'
import { Text } from '@/components/ui/text'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { AiSuggestionChips } from './ai-suggestion-chips'
import { AiTypingIndicator } from './ai-typing-indicator'
import type { AiMessage } from '../hooks/use-ai-chat'
import { format } from 'date-fns'
import { stripAiControlTags } from '../utils/ai-parser'
import Markdown from 'react-native-markdown-display'

interface AiMessageBubbleProps {
  msg: AiMessage
  avatarUrl?: any
  onSuggestionClick: (text: string) => void
  isLoading?: boolean
  isLatest?: boolean
}

export function AiMessageBubble({ msg, avatarUrl, onSuggestionClick, isLoading, isLatest }: AiMessageBubbleProps) {
  const { t } = useTranslation()
  const isDark = useColorScheme() === 'dark'
  const isUser = msg.role === 'user'

  // If streaming and no content, show typing indicator
  if (msg.isStreaming && !msg.content) {
    return <AiTypingIndicator avatarUrl={avatarUrl} />
  }

  const statusLabel = msg.processingStatus === 'searching' 
    ? t('chat.aiStatus.searching', 'Đang tìm kiếm thông tin...') 
    : msg.processingStatus === 'generating' 
      ? t('chat.aiStatus.generating', 'Đang tạo câu trả lời...') 
      : t('chat.aiStatus.processing', 'Đang xử lý...')

  return (
    <View className={`w-full px-2 mt-3 flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <View className={`flex-row gap-2 w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          <View className="w-8 h-8 rounded-full shadow-sm mt-auto mb-4">
            <Image
              source={typeof avatarUrl === 'number' || (avatarUrl && typeof avatarUrl === 'object') ? avatarUrl : { uri: avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=ai-assistant-001` }}
              className="w-full h-full rounded-full border border-black/5"
            />
          </View>
        )}

        <View className="max-w-[75%] flex-col">
          <View
            className={`px-4 py-3 rounded-2xl shadow-sm ${
              isUser
                ? `${isDark ? 'bg-primary' : 'bg-blue-100'} rounded-tr-md`
                : msg.isClarification
                  ? `${isDark ? 'bg-amber-950 border-amber-800' : 'bg-amber-50 border-amber-200'} border rounded-bl-md`
                  : `${isDark ? 'bg-zinc-900' : 'bg-white'} rounded-bl-md`
            }`}
          >
            {msg.isClarification && (
              <View className="flex-row items-center gap-1.5 mb-1.5">
                <Ionicons name="help-circle" size={14} color={isDark ? '#fbbf24' : '#d97706'} />
                <Text className={`text-[13px] font-semibold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                  {t('chat.aiWindow.clarificationNeeded', 'Cần thêm thông tin')}
                </Text>
              </View>
            )}

            {!isUser && msg.isStreaming && !!msg.processingStatus && (
              <View className="flex-row items-center gap-1.5 mb-1.5">
                <Text className={`text-[11px] italic ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>
                  {statusLabel}
                </Text>
              </View>
            )}

            <Markdown
              style={{
                body: {
                  fontSize: 15,
                  lineHeight: 24,
                  color: isUser 
                    ? (isDark ? '#f8fafc' : '#000000')
                    : msg.isClarification
                      ? (isDark ? '#fef3c7' : '#78350f')
                      : (isDark ? '#e4e4e7' : '#09090b'),
                }
              }}
            >
              {stripAiControlTags(msg.content)}
            </Markdown>

            {msg.isStreaming && !msg.processingStatus && isLatest && (
              <View className="w-1.5 h-4 ml-1 bg-blue-500 rounded-sm mt-1" />
            )}

            <Text className={`text-[10px] mt-1 text-right ${isUser ? (isDark ? 'text-primary-foreground/80' : 'text-gray-600') : 'text-gray-500'}`}>
              {format(msg.timestamp, 'HH:mm')}
            </Text>
          </View>
        </View>
      </View>

      {!isUser && !msg.isStreaming && !!msg.suggestions?.length && isLatest && (
        <View className="ml-10 self-start">
          <AiSuggestionChips 
            suggestions={msg.suggestions} 
            onSelect={onSuggestionClick} 
            disabled={isLoading} 
          />
        </View>
      )}
    </View>
  )
}
