import { create } from 'zustand';
import {
  Conversation,
  ChatMessage,
  AttachedRoomSummary,
  ContentFilterResult,
} from '@/shared/types/chat';
import { analyzeMessageContent } from '@/shared/utils/chatContentFilter';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, ChatMessage[]>;
  isPartnerTyping: boolean;
  activeWarning: ContentFilterResult | null;

  // Actions
  setActiveConversation: (id: string) => void;
  sendMessage: (text: string, attachedRoom?: AttachedRoomSummary) => { success: boolean; isBlocked: boolean };
  dismissWarning: () => void;
  markAsRead: (conversationId: string) => void;
}

// Initial Seed Data
const initialConversations: Conversation[] = [
  {
    id: 'conv-1',
    participant: {
      id: 2,
      name: 'Nguyễn Văn Thành',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      role: 'ROLE_LANDLORD',
      isVerified: true,
      isOnline: true,
    },
    relatedRoom: {
      id: 1,
      name: 'Phòng 101 - Studio Ban Công Bách Khoa',
      price: 3500000,
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
      address: 'Số 15 ngõ 20 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
      area: 28,
    },
    unreadCount: 1,
    updatedAt: '10:30',
  },
  {
    id: 'conv-2',
    participant: {
      id: 5,
      name: 'Hoàng Đức Anh',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
      role: 'ROLE_TENANT',
      isVerified: true,
      isOnline: false,
      lastSeen: '15 phút trước',
    },
    relatedRoom: {
      id: 2,
      name: 'Phòng 102 - Khép kín có gác xép',
      price: 3800000,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
      address: 'Ngõ 20 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
      area: 32,
    },
    unreadCount: 0,
    updatedAt: 'Hôm qua',
  },
  {
    id: 'conv-3',
    participant: {
      id: 1,
      name: 'Trung Tâm Hỗ Trợ StayConnect',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120',
      role: 'ROLE_ADMIN',
      isVerified: true,
      isOnline: true,
    },
    unreadCount: 0,
    updatedAt: '03/11',
  },
];

const initialMessages: Record<string, ChatMessage[]> = {
  'conv-1': [
    {
      id: 'm1',
      conversationId: 'conv-1',
      senderId: 2,
      senderName: 'Nguyễn Văn Thành',
      senderRole: 'ROLE_LANDLORD',
      content:
        'Chào bạn, cảm ơn bạn đã quan tâm đến phòng trọ P101 Studio Bách Khoa. Phòng hiện tại vẫn đang còn trống nhé!',
      timestamp: '10:20',
      isRead: true,
      attachedRoom: {
        id: 1,
        name: 'Phòng 101 - Studio Ban Công Bách Khoa',
        price: 3500000,
        image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
        address: 'Số 15 ngõ 20 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
        area: 28,
      },
    },
    {
      id: 'm2',
      conversationId: 'conv-1',
      senderId: 2,
      senderName: 'Nguyễn Văn Thành',
      senderRole: 'ROLE_LANDLORD',
      content:
        'Phòng có đầy đủ điều hòa, nóng lạnh, giường tủ và ban công thoáng mát. Bạn có muốn ghé qua xem phòng trực tiếp không?',
      timestamp: '10:30',
      isRead: false,
    },
  ],
  'conv-2': [
    {
      id: 'm201',
      conversationId: 'conv-2',
      senderId: 5,
      senderName: 'Hoàng Đức Anh',
      senderRole: 'ROLE_TENANT',
      content:
        'Chào bạn! Mình thấy hồ sơ khảo sát lối sống của chúng mình đạt độ hòa hợp 88% (giờ ngủ trước 24h, không hút thuốc, thích nấu ăn).',
      timestamp: '14:15',
      isRead: true,
    },
    {
      id: 'm202',
      conversationId: 'conv-2',
      senderId: 999, // Current User
      senderName: 'Tôi',
      senderRole: 'ROLE_TENANT',
      content: 'Chào Đức Anh! Đúng rồi, mình cũng đang tìm bạn ở ghép cùng tiêu chí như vậy để cùng chia sẻ chi phí tiền phòng.',
      timestamp: '14:20',
      isRead: true,
    },
  ],
  'conv-3': [
    {
      id: 'm301',
      conversationId: 'conv-3',
      senderId: 1,
      senderName: 'Trung Tâm Hỗ Trợ StayConnect',
      senderRole: 'ROLE_ADMIN',
      content:
        'Chào mừng bạn đến với StayConnect! Chúng tôi luôn đồng hành bảo vệ an toàn cho bạn. Lưu ý: Tuyệt đối không chuyển tiền cọc hoặc nhận giao dịch ngoài sàn để tránh rủi ro lừa đảo.',
      timestamp: '09:00',
      isRead: true,
    },
  ],
};

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: initialConversations,
  activeConversationId: 'conv-1',
  messages: initialMessages,
  isPartnerTyping: false,
  activeWarning: null,

  setActiveConversation: (id: string) => {
    set({ activeConversationId: id, activeWarning: null });
    get().markAsRead(id);
  },

  dismissWarning: () => {
    set({ activeWarning: null });
  },

  markAsRead: (conversationId: string) => {
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ),
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map((m) => ({
          ...m,
          isRead: true,
        })),
      },
    }));
  },

  sendMessage: (text: string, attachedRoom?: AttachedRoomSummary) => {
    const { activeConversationId, messages } = get();
    if (!activeConversationId || !text.trim()) {
      return { success: false, isBlocked: false };
    }

    // 1. Kiểm tra an toàn nội dung tin nhắn
    const filterResult = analyzeMessageContent(text);

    if (filterResult.isBlocked) {
      // Tin nhắn bị chặn: Hiển thị Banner cảnh báo và ghi nhận tin nhắn ở trạng thái bị chặn
      set({ activeWarning: filterResult });

      const blockedMsg: ChatMessage = {
        id: 'msg-' + Date.now(),
        conversationId: activeConversationId,
        senderId: 999, // current user
        senderName: 'Tôi',
        senderRole: 'ROLE_TENANT',
        content: text.trim(),
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
        isBlocked: true,
        blockedReason: filterResult.warningTitle,
        detectedViolations: filterResult.violations,
        attachedRoom,
      };

      set({
        messages: {
          ...messages,
          [activeConversationId]: [...(messages[activeConversationId] || []), blockedMsg],
        },
      });

      return { success: false, isBlocked: true };
    }

    // 2. Tin nhắn hợp lệ: Xóa cảnh báo và thêm tin nhắn
    set({ activeWarning: null });

    const newMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      conversationId: activeConversationId,
      senderId: 999, // current user
      senderName: 'Tôi',
      senderRole: 'ROLE_TENANT',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      attachedRoom,
    };

    set({
      messages: {
        ...messages,
        [activeConversationId]: [...(messages[activeConversationId] || []), newMsg],
      },
      conversations: get().conversations.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              lastMessage: newMsg,
              updatedAt: newMsg.timestamp,
            }
          : c
      ),
    });

    // 3. Giả lập phản hồi realtime từ đối phương (Chat Bot / Chủ trọ)
    set({ isPartnerTyping: true });
    setTimeout(() => {
      set({ isPartnerTyping: false });
      const currentConv = get().conversations.find((c) => c.id === activeConversationId);
      if (!currentConv) return;

      const replyContent =
        currentConv.participant.role === 'ROLE_LANDLORD'
          ? 'Cảm ơn bạn đã nhắn tin! Bạn có thể qua xem phòng vào khoảng 17h - 19h chiều nay nhé, mình sẽ đón bạn ở sảnh tầng 1.'
          : currentConv.participant.role === 'ROLE_ADMIN'
          ? 'StayConnect đã ghi nhận thông tin của bạn. Đội ngũ chuyên viên sẽ hỗ trợ bạn trong thời gian sớm nhất!'
          : 'Tuyệt vời, mình rất vui được làm quen với bạn! Chúng mình hẹn nhau đi uống cafe xem phòng nhé!';

      const replyMsg: ChatMessage = {
        id: 'msg-' + Date.now(),
        conversationId: activeConversationId,
        senderId: currentConv.participant.id,
        senderName: currentConv.participant.name,
        senderRole: currentConv.participant.role,
        senderAvatar: currentConv.participant.avatar,
        content: replyContent,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
      };

      set({
        messages: {
          ...get().messages,
          [activeConversationId]: [...(get().messages[activeConversationId] || []), replyMsg],
        },
        conversations: get().conversations.map((c) =>
          c.id === activeConversationId
            ? {
                ...c,
                lastMessage: replyMsg,
                updatedAt: replyMsg.timestamp,
              }
            : c
        ),
      });
    }, 1500);

    return { success: true, isBlocked: false };
  },
}));

