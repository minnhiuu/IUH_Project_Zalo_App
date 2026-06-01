import { useState, useCallback, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import EventSource from 'react-native-sse'
import { getAccessToken } from '@/lib/http'
import { messageApi } from '../api'
import type { MessageResponse } from '../schemas'
import { parseAiSuggestions, parseAiQuestion } from '../utils/ai-parser'
import apiConfig from '@/config/apiConfig'
import { BONDHUB_AI } from '@/constants/system'
import { aiStreamingRegistry } from './ai-streaming-registry'

export type AiMessageRole = 'user' | 'ai'

export interface AiMessage {
  id: string
  role: AiMessageRole
  content: string
  suggestions?: string[]
  isStreaming?: boolean
  isClarification?: boolean
  processingStatus?: string
  timestamp: Date
}

function parseAiMessageFromDb(raw: string): {
  cleanContent: string
  suggestions: string[]
  isClarification: boolean
} {
  const { cleanContent: afterQuestion, isClarification } = parseAiQuestion(raw)
  const { cleanContent, suggestions } = parseAiSuggestions(afterQuestion)
  return { cleanContent, suggestions, isClarification }
}

const AI_BASE_URL = apiConfig.apiUrl
const AI_ASSISTANT_ID = BONDHUB_AI.userId

interface UseAiChatOptions {
  loadHistory?: boolean
}

export function useAiChat(conversationId: string, options: UseAiChatOptions = {}) {
  const { loadHistory = true } = options
  const { t } = useTranslation()
  const [messages, setMessages] = useState<AiMessage[]>([])
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!conversationId || !loadHistory) {
      setMessages([])
      setIsInitialLoading(false)
      return
    }

    let isCancelled = false

    const fetchHistory = async () => {
      try {
        setIsInitialLoading(true)
        const response = await messageApi.getMessagesV2(conversationId, { limit: 20, direction: 'OLDER', cursor: null })

        const history: AiMessage[] = response.data.data.data
          .map((msg: MessageResponse) => {
            const isAi = msg.senderId === AI_ASSISTANT_ID
            const rawContent = msg.content || ''

            if (!isAi) {
              return {
                id: msg.id,
                role: 'user' as AiMessageRole,
                content: rawContent,
                timestamp: new Date(msg.createdAt || Date.now()),
                isStreaming: false
              }
            }

            const { cleanContent, suggestions, isClarification } = parseAiMessageFromDb(rawContent)
            return {
              id: msg.id,
              role: 'ai' as AiMessageRole,
              content: cleanContent,
              suggestions,
              isClarification,
              timestamp: new Date(msg.createdAt || Date.now()),
              isStreaming: false
            }
          })
          .reverse()

        if (!isCancelled) {
          setMessages(history)
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('[AiChat] Failed to fetch history:', err)
        }
      } finally {
        if (!isCancelled) {
          setIsInitialLoading(false)
        }
      }
    }

    fetchHistory()
    return () => {
      isCancelled = true
    }
  }, [conversationId, loadHistory])

  const mutation = useMutation({
    mutationFn: async (payload: { userText: string; isMention?: boolean }) => {
      const { userText, isMention = false } = payload
      if (!userText || !userText.trim()) return

      const userMsgId = `user-${Date.now()}`
      if (!isMention) {
        setMessages((prev) => [...prev, { id: userMsgId, role: 'user', content: userText, timestamp: new Date() }])
      }

      const aiMsgId = `ai-${Date.now()}`
      setMessages((prev) => [
        ...prev,
        { id: aiMsgId, role: 'ai', content: '', isStreaming: true, timestamp: new Date() }
      ])

      aiStreamingRegistry.setStreaming(conversationId, true, aiMsgId)

      const token = await getAccessToken()
      const url = `${AI_BASE_URL}/v1/ai/chat`

      if (esRef.current) {
        esRef.current.close()
      }

      return new Promise<void>((resolve, reject) => {
        let isClarification = false
        const bufferState = { content: '' }
        let idleTimeout: NodeJS.Timeout | null = null

        const finalizeStream = () => {
          if (idleTimeout) clearTimeout(idleTimeout)
          if (esRef.current) {
            esRef.current.close()
          }
          aiStreamingRegistry.setStreaming(conversationId, false)
          
          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== aiMsgId) return m
              const { cleanContent: contentWithoutQuestion, isClarification: parsedClarification } = parseAiQuestion(
                m.content
              )
              const { cleanContent, suggestions } = parseAiSuggestions(contentWithoutQuestion)
              return {
                ...m,
                content: cleanContent,
                suggestions,
                isClarification: isClarification || parsedClarification,
                isStreaming: false,
                processingStatus: undefined
              }
            })
          )
          resolve()
        }

        const resetIdleTimeout = () => {
          if (idleTimeout) clearTimeout(idleTimeout)
          idleTimeout = setTimeout(() => {
            console.log('[AiChat] Stream idle timeout, finalizing')
            finalizeStream()
          }, 15000) // 15s timeout
        }

        const es = new EventSource(url, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          method: 'POST',
          body: JSON.stringify({
            content: userText,
            conversationId,
            clientMessageId: userMsgId,
            isForwarded: false,
            isMention
          }),
          pollingInterval: 0
        })

        esRef.current = es

        es.addEventListener('message', (event) => {
          resetIdleTimeout()
          if (!event.data || event.data === '[DONE]') {
            if (event.data === '[DONE]') {
              finalizeStream()
            }
            return
          }

          try {
            const parsed = JSON.parse(event.data) as { type: string; content: string }

            if (parsed.type === 'DONE') {
              finalizeStream()
              return
            }

            if (parsed.type === 'STATUS') {
              aiStreamingRegistry.updateStream(conversationId, bufferState.content, parsed.content)
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId ? { ...m, processingStatus: parsed.content } : m
                )
              )
            } else if (parsed.type === 'CLARIFICATION') {
              isClarification = true
              const { cleanContent: clarificationContent } = parseAiQuestion(parsed.content || '')
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId
                    ? {
                        ...m,
                        content: clarificationContent,
                        isClarification: true,
                        isStreaming: false,
                        processingStatus: undefined
                      }
                    : m
                )
              )
            } else if (parsed.type === 'ANSWER_CHUNK') {
              bufferState.content += parsed.content
              aiStreamingRegistry.updateStream(conversationId, bufferState.content)
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMsgId ? { ...m, content: m.content + parsed.content, processingStatus: undefined } : m
                )
              )
            }
          } catch (e) {
            console.error('Error parsing SSE event data', e)
          }
        })

        es.addEventListener('error', (err: any) => {
          console.log('[AiChat] SSE Connection Closed or Errored', err)
          if (idleTimeout) clearTimeout(idleTimeout)
          es.close()
          aiStreamingRegistry.setStreaming(conversationId, false)
          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== aiMsgId) return m
              
              const { cleanContent: contentWithoutQuestion, isClarification: parsedClarification } = parseAiQuestion(
                m.content
              )
              const { cleanContent, suggestions } = parseAiSuggestions(contentWithoutQuestion)
              
              return {
                ...m, 
                isStreaming: false, 
                content: cleanContent || t('chat.aiWindow.errorMessage', { defaultValue: 'Something went wrong, try again.' }),
                suggestions,
                isClarification: isClarification || parsedClarification,
                processingStatus: undefined
              }
            })
          )
          
          // Only reject if we received literally no content
          if (!bufferState.content) {
            reject(err)
          } else {
            resolve()
          }
        })
      })
    }
  })

  const clearHistory = useCallback(async () => {
    try {
      await messageApi.clearConversationHistory(conversationId)
      setMessages([])
    } catch (err) {
      console.error('[AiChat] Failed to clear history:', err)
    }
  }, [conversationId])

  return {
    messages,
    isInitialLoading,
    sendMessage: (text: string, isMention?: boolean) => mutation.mutate({ userText: text, isMention }),
    isSending: mutation.isPending,
    clearHistory
  }
}
