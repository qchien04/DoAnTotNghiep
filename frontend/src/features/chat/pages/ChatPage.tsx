import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  ShieldAlert,
  ShieldCheck,
  Search,
  Home,
  CheckCheck,
  AlertTriangle,
  X,
  Building2,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useChatStore } from '../useChatStore';
import { VerifiedLandlordBadge } from '@/shared/components';
import { analyzeMessageContent } from '@/shared/utils/chatContentFilter';

export const ChatPage: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    messages,
    isPartnerTyping,
    activeWarning,
    setActiveConversation,
    sendMessage,
    dismissWarning,
  } = useChatStore();

  const [inputText, setInputText] = useState<string>('');
  const [filterType, setFilterType] = useState<'ALL' | 'LANDLORD' | 'TENANT' | 'ADMIN'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileConversationOpen, setIsMobileConversationOpen] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);
  const currentMessages = activeConversationId ? messages[activeConversationId] || [] : [];

  // Real-time typing check for live warning preview
  const liveCheck = analyzeMessageContent(inputText);

  // Auto scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, isPartnerTyping]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    sendMessage(inputText.trim(), activeConversation?.relatedRoom);
    setInputText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickReply = (text: string) => {
    sendMessage(text, activeConversation?.relatedRoom);
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (filterType === 'LANDLORD' && c.participant.role !== 'ROLE_LANDLORD') return false;
    if (filterType === 'TENANT' && c.participant.role !== 'ROLE_TENANT') return false;
    if (filterType === 'ADMIN' && c.participant.role !== 'ROLE_ADMIN') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = c.participant.name.toLowerCase().includes(q);
      const matchRoom = c.relatedRoom?.name.toLowerCase().includes(q);
      if (!matchName && !matchRoom) return false;
    }
    return true;
  });

  return (
    <div className="h-[calc(100vh-4.5rem)] flex bg-stay-bg-app text-stay-text overflow-hidden">
      {/* 1. LEFT SIDEBAR: CONVERSATION LIST */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-stay-border bg-stay-card-bg flex flex-col shrink-0 transition-all ${
          isMobileConversationOpen ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Header & Search */}
        <div className="p-4 border-b border-stay-border space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-stay-text flex items-center gap-2">
              <span>Trò chuyện trực tuyến</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-stay-primary-subtle text-stay-primary font-bold">
              {conversations.length} hội thoại
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-stay-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên người dùng, phòng trọ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stay-border bg-stay-bg-app text-stay-text text-xs focus:outline-none focus:border-stay-primary transition"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { key: 'ALL', label: 'Tất cả' },
              { key: 'LANDLORD', label: 'Chủ trọ' },
              { key: 'TENANT', label: 'Ở ghép' },
              { key: 'ADMIN', label: 'Hỗ trợ' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterType(f.key as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  filterType === f.key
                    ? 'bg-stay-primary text-white'
                    : 'text-stay-text-secondary hover:bg-stay-bg-app'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-stay-border-subtle">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-stay-text-secondary">
              Không tìm thấy cuộc trò chuyện nào phù hợp.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const hasUnread = conv.unreadCount > 0;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    setActiveConversation(conv.id);
                    setIsMobileConversationOpen(true);
                  }}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-stay-primary-subtle/40 border-l-4 border-stay-primary'
                      : 'hover:bg-stay-bg-app'
                  }`}
                >
                  {/* Avatar + Online Indicator */}
                  <div className="relative shrink-0">
                    <img
                      src={conv.participant.avatar || 'https://via.placeholder.com/80'}
                      alt={conv.participant.name}
                      className="w-12 h-12 rounded-xl object-cover border border-stay-border bg-slate-100 dark:bg-slate-800"
                    />
                    {conv.participant.isOnline ? (
                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-stay-card-bg absolute -bottom-0.5 -right-0.5 shadow-xs" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full bg-slate-400 border-2 border-stay-card-bg absolute -bottom-0.5 -right-0.5 shadow-xs" />
                    )}
                  </div>

                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 line-clamp-1">
                        <span className="font-bold text-xs sm:text-sm text-stay-text truncate">
                          {conv.participant.name}
                        </span>
                        {conv.participant.isVerified && (
                          <VerifiedLandlordBadge size="sm" showText={false} />
                        )}
                      </div>
                      <span className="text-[10px] text-stay-text-muted shrink-0">{conv.updatedAt}</span>
                    </div>

                    {/* Role Tag & Room snippet */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-stay-bg-app text-stay-text-muted">
                        {conv.participant.role === 'ROLE_LANDLORD'
                          ? 'Chủ trọ'
                          : conv.participant.role === 'ROLE_ADMIN'
                          ? 'Quản trị viên'
                          : 'Người thuê'}
                      </span>
                      {conv.relatedRoom && (
                        <span className="text-[10px] text-stay-primary font-medium truncate flex items-center gap-0.5">
                          <Home className="w-2.5 h-2.5 shrink-0" /> {conv.relatedRoom.name}
                        </span>
                      )}
                    </div>

                    {/* Last message snippet */}
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p
                        className={`text-xs truncate ${
                          hasUnread
                            ? 'font-bold text-stay-text'
                            : 'text-stay-text-secondary'
                        }`}
                      >
                        {conv.lastMessage?.isBlocked ? (
                          <span className="text-rose-500 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 shrink-0" /> Tin nhắn vi phạm an toàn
                          </span>
                        ) : (
                          conv.lastMessage?.content || 'Bắt đầu cuộc trò chuyện'
                        )}
                      </p>
                      {hasUnread && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-stay-primary text-white shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. RIGHT PANE: ACTIVE CHAT THREAD */}
      {activeConversation ? (
        <div
          className={`flex-1 flex flex-col bg-stay-bg-app overflow-hidden transition-all ${
            isMobileConversationOpen ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Header */}
          <div className="p-3.5 sm:px-6 bg-stay-card-bg border-b border-stay-border flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileConversationOpen(false)}
                className="p-1 rounded-lg text-stay-text md:hidden hover:bg-stay-bg-app transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="relative">
                <img
                  src={activeConversation.participant.avatar || 'https://via.placeholder.com/80'}
                  alt={activeConversation.participant.name}
                  className="w-10 h-10 rounded-xl object-cover border border-stay-border bg-slate-100 dark:bg-slate-800"
                />
                {activeConversation.participant.isOnline && (
                  <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-stay-card-bg absolute -bottom-0.5 -right-0.5" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="font-bold text-sm sm:text-base text-stay-text">
                    {activeConversation.participant.name}
                  </h2>
                  {activeConversation.participant.isVerified && (
                    <VerifiedLandlordBadge size="sm" showText={false} />
                  )}
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stay-bg-app text-stay-text-secondary border border-stay-border">
                    {activeConversation.participant.role === 'ROLE_LANDLORD'
                      ? 'Chủ trọ xác minh'
                      : activeConversation.participant.role === 'ROLE_ADMIN'
                      ? 'Hỗ trợ viên 24/7'
                      : 'Người thuê / Ở ghép'}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {activeConversation.participant.isOnline
                    ? 'Đang hoạt động trực tuyến'
                    : activeConversation.participant.lastSeen || 'Ngoại tuyến'}
                </p>
              </div>
            </div>

            {/* Room Card Snippet Pill */}
            {activeConversation.relatedRoom && (
              <div className="hidden lg:flex items-center gap-2 p-1.5 pr-3 rounded-xl border border-stay-border bg-stay-bg-app max-w-sm">
                <img
                  src={activeConversation.relatedRoom.image}
                  alt={activeConversation.relatedRoom.name}
                  className="w-9 h-9 rounded-lg object-cover shrink-0 border border-stay-border"
                />
                <div className="min-w-0 text-left">
                  <p className="text-xs font-bold text-stay-text truncate">
                    {activeConversation.relatedRoom.name}
                  </p>
                  <p className="text-[11px] font-semibold text-stay-primary">
                    {activeConversation.relatedRoom.price.toLocaleString('vi-VN')} đ/tháng
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Persistent Transaction Security Banner */}
          <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Bảo vệ giao dịch:</strong> StayConnect tự động quét và lọc tin nhắn. Tuyệt đối không
                chuyển cọc hoặc giao dịch ngoài sàn để phòng tránh lừa đảo.
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 shrink-0 hidden sm:inline">
              SafeChat AI Active
            </span>
          </div>

          {/* Message List */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {currentMessages.map((msg) => {
              const isOwn = msg.senderId === 999;

              // 1. BLOCKED MESSAGE RENDERING
              if (msg.isBlocked) {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-md w-full rounded-2xl p-4 bg-rose-500/10 border-2 border-rose-500/40 text-rose-900 dark:text-rose-200 shadow-sm space-y-2">
                      <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wide">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>Tin nhắn bị chặn gửi</span>
                      </div>
                      <p className="text-xs line-through opacity-70 italic font-mono bg-rose-500/5 p-2 rounded-lg border border-rose-500/20">
                        {msg.content}
                      </p>
                      {msg.detectedViolations && msg.detectedViolations.length > 0 && (
                        <div className="text-[11px] text-rose-700 dark:text-rose-300 space-y-0.5 pt-1 border-t border-rose-500/20">
                          <p className="font-semibold">Lý do vi phạm:</p>
                          <ul className="list-disc list-inside">
                            {msg.detectedViolations.map((v, vi) => (
                              <li key={vi}>{v}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p className="text-[10px] text-rose-500 text-right">{msg.timestamp}</p>
                    </div>
                  </div>
                );
              }

              // 2. NORMAL MESSAGE RENDERING
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2.5 ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  {!isOwn && (
                    <img
                      src={
                        msg.senderAvatar ||
                        activeConversation.participant.avatar ||
                        'https://via.placeholder.com/80'
                      }
                      alt={msg.senderName}
                      className="w-8 h-8 rounded-lg object-cover border border-stay-border shrink-0 mb-1"
                    />
                  )}

                  <div className={`max-w-md space-y-1.5 ${isOwn ? 'items-end' : 'items-start'}`}>
                    {/* Attached Room Card if present */}
                    {msg.attachedRoom && (
                      <div className="p-2.5 rounded-2xl border border-stay-border bg-stay-card-bg shadow-sm flex items-center gap-3">
                        <img
                          src={msg.attachedRoom.image}
                          alt={msg.attachedRoom.name}
                          className="w-12 h-12 rounded-xl object-cover border border-stay-border shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-stay-text truncate">
                            {msg.attachedRoom.name}
                          </p>
                          <p className="text-xs font-bold text-stay-primary">
                            {msg.attachedRoom.price.toLocaleString('vi-VN')} đ/tháng
                          </p>
                          <p className="text-[10px] text-stay-text-muted truncate">
                            {msg.attachedRoom.address}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-2xs ${
                        isOwn
                          ? 'bg-stay-primary text-white rounded-br-none'
                          : 'bg-stay-card-bg text-stay-text border border-stay-border rounded-bl-none'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <div
                        className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                          isOwn ? 'text-white/70' : 'text-stay-text-muted'
                        }`}
                      >
                        <span>{msg.timestamp}</span>
                        {isOwn && <CheckCheck className="w-3.5 h-3.5 text-white/90" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Partner Typing Indicator */}
            {isPartnerTyping && (
              <div className="flex items-center gap-2 text-xs text-stay-text-secondary italic">
                <img
                  src={activeConversation.participant.avatar || 'https://via.placeholder.com/80'}
                  alt="typing"
                  className="w-6 h-6 rounded-md object-cover border border-stay-border"
                />
                <span className="flex items-center gap-1">
                  <span>{activeConversation.participant.name} đang soạn tin nhắn</span>
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce delay-100">.</span>
                  <span className="animate-bounce delay-200">.</span>
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* DYNAMIC WARNING BANNER: DISPLAYED WHEN CONTENT IS BLOCKED */}
          {activeWarning && (
            <div className="mx-4 mb-2 p-4 rounded-2xl bg-rose-500/10 border-2 border-rose-500/40 text-rose-900 dark:text-rose-200 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-rose-700 dark:text-rose-300">
                      {activeWarning.warningTitle}
                    </h4>
                    <p className="text-xs leading-relaxed text-rose-800 dark:text-rose-200">
                      {activeWarning.warningMessage}
                    </p>
                    {activeWarning.violations.length > 0 && (
                      <div className="pt-1.5 flex flex-wrap gap-1.5">
                        {activeWarning.violations.map((v, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[11px] font-semibold font-mono"
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={dismissWarning}
                  className="p-1 rounded-lg text-rose-600 hover:bg-rose-500/20 transition shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Real-time Live Typing Warning Preview */}
          {!activeWarning && liveCheck.isBlocked && (
            <div className="mx-4 mb-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center justify-between gap-2 animate-pulse">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Cảnh báo nội dung nhạy cảm:</strong> Phát hiện thông tin liên hệ ngoài hoặc tài
                  khoản. Tin nhắn sẽ bị chặn khi bấm gửi!
                </span>
              </div>
            </div>
          )}

          {/* Quick Reply Suggestions */}
          <div className="px-4 py-2 border-t border-stay-border-subtle bg-stay-card-bg flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-[11px] font-bold text-stay-text-muted uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Gợi ý:
            </span>
            {[
              'Phòng này còn trống không ạ?',
              'Cho em xin lịch xem phòng chiều nay',
              'Chi phí điện nước tính thế nào ạ?',
              'Có chỗ để xe máy an toàn không anh/chị?',
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickReply(q)}
                className="px-3 py-1 rounded-xl border border-stay-border bg-stay-bg-app hover:bg-stay-primary-subtle hover:text-stay-primary hover:border-stay-primary/30 transition text-stay-text whitespace-nowrap text-xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 sm:p-4 bg-stay-card-bg border-t border-stay-border">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Nhập tin nhắn trao đổi (Hệ thống bảo vệ chống lừa đảo tiền cọc)..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-4 py-2.5 rounded-xl border border-stay-border bg-stay-bg-app text-stay-text text-xs sm:text-sm focus:outline-none focus:border-stay-primary transition"
              />

              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="px-4 py-2.5 rounded-xl bg-stay-primary hover:bg-stay-primary-hover text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Gửi</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex items-center justify-center p-8 text-center bg-stay-bg-app">
          <div className="max-w-md space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-stay-primary-subtle text-stay-primary flex items-center justify-center mx-auto shadow-sm">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg text-stay-text">Chọn một cuộc trò chuyện</h3>
            <p className="text-xs text-stay-text-secondary leading-relaxed">
              Trao đổi trực tiếp và an toàn với Chủ trọ hoặc bạn ở ghép. Hệ thống SafeChat AI tự động bảo vệ
              bạn khỏi các hành vi lừa đảo tiền cọc.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
