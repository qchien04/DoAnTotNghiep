export type UserRole = 'ROLE_TENANT' | 'ROLE_LANDLORD' | 'ROLE_ADMIN' | 'GUEST';

export interface ChatParticipant {
  id: number;
  name: string;
  avatar?: string;
  role: UserRole;
  isVerified?: boolean;
  isOnline: boolean;
  lastSeen?: string;
}

export interface AttachedRoomSummary {
  id: number;
  name: string;
  price: number;
  image: string;
  address: string;
  area?: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: number;
  senderName: string;
  senderRole: UserRole;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isBlocked?: boolean;
  blockedReason?: string;
  detectedViolations?: string[];
  attachedRoom?: AttachedRoomSummary;
}

export interface Conversation {
  id: string;
  participant: ChatParticipant;
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
  relatedRoom?: AttachedRoomSummary;
}

export interface ContentFilterResult {
  isBlocked: boolean;
  violations: string[];
  warningTitle: string;
  warningMessage: string;
}

