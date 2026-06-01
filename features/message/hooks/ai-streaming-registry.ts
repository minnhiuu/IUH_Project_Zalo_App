import { useState, useEffect } from 'react'

export interface AiStreamState {
  isStreaming: boolean
  content: string
  processingStatus?: string
  messageId?: string
}

class AiStreamingStore {
  private streams: Record<string, AiStreamState> = {}
  private listeners: Record<string, Set<() => void>> = {}

  private notify(conversationId: string) {
    this.listeners[conversationId]?.forEach((listener) => listener())
  }

  subscribe(conversationId: string, listener: () => void) {
    if (!this.listeners[conversationId]) {
      this.listeners[conversationId] = new Set()
    }
    this.listeners[conversationId].add(listener)
    return () => {
      this.listeners[conversationId].delete(listener)
    }
  }

  getStream(conversationId: string): AiStreamState | undefined {
    return this.streams[conversationId]
  }

  setStreaming(conversationId: string, isStreaming: boolean, messageId?: string) {
    if (!isStreaming) {
      delete this.streams[conversationId]
    } else {
      this.streams[conversationId] = { isStreaming: true, content: '', messageId }
    }
    this.notify(conversationId)
  }

  updateStream(conversationId: string, content: string, processingStatus?: string) {
    const current = this.streams[conversationId]
    if (current) {
      this.streams[conversationId] = {
        ...current,
        content,
        processingStatus: processingStatus || current.processingStatus
      }
      this.notify(conversationId)
    }
  }

  isStreaming(conversationId: string): boolean {
    return this.streams[conversationId]?.isStreaming === true
  }
}

const store = new AiStreamingStore()

export function useAiStreamingStore(conversationId: string) {
  const [stream, setStream] = useState<AiStreamState | undefined>(store.getStream(conversationId))

  useEffect(() => {
    return store.subscribe(conversationId, () => {
      setStream(store.getStream(conversationId))
    })
  }, [conversationId])

  return stream
}

export const aiStreamingRegistry = {
  isStreaming: (conversationId: string) => store.isStreaming(conversationId),
  setStreaming: (conversationId: string, isStreaming: boolean, messageId?: string) =>
    store.setStreaming(conversationId, isStreaming, messageId),
  updateStream: (conversationId: string, content: string, status?: string) =>
    store.updateStream(conversationId, content, status)
}
