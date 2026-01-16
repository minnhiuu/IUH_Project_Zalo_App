// Message types
export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'sticker' | 'location' | 'contact' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'seen' | 'failed';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  content: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number; // For audio/video
  width?: number; // For image/video
  height?: number; // For image/video
  replyTo?: string; // Message ID being replied to
  forwardedFrom?: string; // Original message ID if forwarded
  reactions?: MessageReaction[];
  status: MessageStatus;
  isRecalled?: boolean;
  recalledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageReaction {
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  thumbnailUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

// For sending messages
export interface SendMessagePayload {
  conversationId: string;
  type: MessageType;
  content?: string;
  mediaUrl?: string;
  replyTo?: string;
  attachments?: File[];
}
