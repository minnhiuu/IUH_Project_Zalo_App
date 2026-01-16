import { Message } from './message.types';
import { User } from './user.types';

// Conversation types
export type ConversationType = 'private' | 'group';

export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string; // For group chat
  avatar?: string; // For group chat
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned?: boolean;
  isMuted?: boolean;
  muteUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationParticipant {
  userId: string;
  user?: User;
  role?: 'admin' | 'member';
  nickname?: string;
  joinedAt: string;
  lastReadAt?: string;
}

export interface GroupSettings {
  allowMemberInvite: boolean;
  allowMemberEdit: boolean;
  approvalRequired: boolean;
  linkJoinEnabled: boolean;
  joinLink?: string;
}

// For creating conversations
export interface CreateConversationPayload {
  type: ConversationType;
  participantIds: string[];
  name?: string; // Required for group
  avatar?: string;
}

// For conversation list display
export interface ConversationListItem extends Conversation {
  displayName: string;
  displayAvatar?: string;
  isOnline?: boolean;
}
