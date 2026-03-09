import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import ChatWindow from '../../components/ChatWindow';
import ChatInput from '../../components/ChatInput';
import axiosClient from '../../api/axiosClient';

// ─── Icons ────────────────────────────────────────────────────────────────────

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Constants ────────────────────────────────────────────────────────────────

const CONTEXT_LABELS = {
  general: 'Học tập chung',
  lesson: 'Bài học',
  quiz: 'Bài kiểm tra',
  topic: 'Chủ đề',
  performance: 'Điểm yếu của tôi'
};

// ─── Conversation list item ────────────────────────────────────────────────────

const ConvItem = ({ conv, isActive, onSelect, onDelete }) => (
  <div
    onClick={() => onSelect(conv._id)}
    className="group flex items-start gap-2.5 px-3 py-2.5 rounded-xl mb-1 cursor-pointer transition-all"
    style={{
      background: isActive ? 'var(--amber-soft)' : 'transparent',
      border: `1px solid ${isActive ? 'var(--amber)' : 'transparent'}`
    }}
  >
    <div
      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
      style={{
        background: isActive ? 'var(--amber)' : 'var(--bg-card)',
        color: isActive ? '#fff' : 'var(--text-muted)'
      }}
    >
      <ChatIcon />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
        {conv.title || 'Cuộc trò chuyện mới'}
      </p>
      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
        {conv.contextType !== 'general'
          ? CONTEXT_LABELS[conv.contextType]
          : new Date(conv.lastMessageAt).toLocaleDateString('vi-VN')}
      </p>
    </div>
    {/* Delete button — hidden until hover (always visible on touch) */}
    <button
      onClick={e => onDelete(conv._id, e)}
      className="flex-shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-1 rounded-lg -mr-1"
      style={{ color: 'var(--text-muted)' }}
      aria-label="Xóa cuộc trò chuyện"
    >
      <TrashIcon />
    </button>
  </div>
);

// ─── Sidebar panel (reused for desktop + mobile drawer) ───────────────────────

const SidebarPanel = ({
  conversations, activeConversationId, loadingConversations,
  contextLabel, creating,
  onSelect, onDelete, onNew, onClose
}) => (
  <div className="flex flex-col h-full" style={{ background: 'var(--bg-secondary)' }}>
    {/* Header */}
    <div
      className="flex items-center justify-between px-4 py-3 flex-shrink-0"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <span className="font-display font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
        Lịch sử chat
      </span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onNew}
          disabled={creating}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{
            background: 'var(--amber-soft)',
            color: 'var(--amber)',
            cursor: creating ? 'not-allowed' : 'pointer'
          }}
          title="Chat mới"
          aria-label="Tạo cuộc trò chuyện mới"
        >
          <PlusIcon />
        </button>
        {/* Close button — only visible in mobile drawer */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ color: 'var(--text-muted)', background: 'var(--bg-card)' }}
            aria-label="Đóng"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    </div>

    {/* Context chip */}
    {contextLabel && (
      <div className="px-4 pt-3">
        <div
          className="px-3 py-1.5 rounded-xl text-xs font-medium"
          style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}
        >
          📌 {contextLabel}
        </div>
      </div>
    )}

    {/* List */}
    <div className="flex-1 overflow-y-auto px-2 py-2" style={{ scrollbarWidth: 'thin', overscrollBehavior: 'contain' }}>
      {loadingConversations ? (
        <div className="p-4 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          Đang tải...
        </div>
      ) : conversations.length === 0 ? (
        <div className="p-4 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
          Chưa có cuộc trò chuyện nào
        </div>
      ) : (
        conversations.map(conv => (
          <ConvItem
            key={conv._id}
            conv={conv}
            isActive={activeConversationId === conv._id}
            onSelect={(id) => { onSelect(id); onClose?.(); }}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  </div>
);

// ─── Main page ─────────────────────────────────────────────────────────────────

const StudyChat = () => {
  const [searchParams] = useSearchParams();

  const [conversations, setConversations]           = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages]                     = useState([]);
  const [streamingText, setStreamingText]           = useState('');
  const [isStreaming, setIsStreaming]               = useState(false);
  const [modelInfo, setModelInfo]                   = useState('');

  // Desktop sidebar (starts open on ≥md, closed on mobile)
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768
  );
  // Mobile conversation drawer
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [creating, setCreating] = useState(false);

  const contextType  = searchParams.get('contextType')  || 'general';
  const contextId    = searchParams.get('contextId')    || '';
  const contextLabel = searchParams.get('contextLabel') || '';

  // Lock body scroll while chat page is mounted so the page doesn't
  // scroll up when the user swipes inside the chat container.
  // Released on unmount (route change).
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    return () => { document.documentElement.style.overflow = prev; };
  }, []);

  // ── Data fetching ────────────────────────────────────────────────────────────

  const fetchConversations = useCallback(async () => {
    try {
      const res = await axiosClient.get('/chat/conversations');
      setConversations(res.data.data || []);
    } catch (err) {
      console.error('Lỗi load conversations:', err);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const loadConversation = useCallback(async (id) => {
    try {
      const res = await axiosClient.get(`/chat/conversations/${id}`);
      const conv = res.data.data;
      setActiveConversation(conv);
      setActiveConversationId(id);
      setMessages(conv.messages || []);
      setStreamingText('');
    } catch (err) {
      console.error('Lỗi load conversation:', err);
    }
  }, []);

  const createNewConversation = useCallback(async (overrideContext = {}) => {
    setCreating(true);
    try {
      const payload = {
        contextType:  overrideContext.contextType  || contextType,
        contextId:    overrideContext.contextId    || contextId,
        contextLabel: overrideContext.contextLabel || contextLabel,
      };
      const res = await axiosClient.post('/chat/conversations', payload);
      const newConv = res.data.data;
      setConversations(prev => [newConv, ...prev]);
      await loadConversation(newConv._id);
    } catch (err) {
      console.error('Lỗi tạo conversation:', err);
    } finally {
      setCreating(false);
    }
  }, [contextType, contextId, contextLabel, loadConversation]);

  useEffect(() => {
    if (!loadingConversations && conversations.length === 0) {
      createNewConversation();
    } else if (!loadingConversations && conversations.length > 0 && !activeConversationId) {
      loadConversation(conversations[0]._id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingConversations]);

  const deleteConversation = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Xóa cuộc trò chuyện này?')) return;
    try {
      await axiosClient.delete(`/chat/conversations/${id}`);
      const remaining = conversations.filter(c => c._id !== id);
      setConversations(remaining);
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setActiveConversation(null);
        setMessages([]);
        if (remaining.length > 0) loadConversation(remaining[0]._id);
      }
    } catch (err) {
      console.error('Lỗi xóa:', err);
    }
  };

  // ── SSE streaming ────────────────────────────────────────────────────────────

  const handleSendMessage = async (message) => {
    if (!activeConversationId || isStreaming) return;

    setMessages(prev => [...prev, { role: 'user', content: message, createdAt: new Date() }]);
    setIsStreaming(true);
    setStreamingText('');

    try {
      const token   = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

      const response = await fetch(
        `${baseUrl}/chat/conversations/${activeConversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ message }),
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated    = '';
      let aiFullText     = '';
      let streamCompleted = false;
      let streamError    = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulated += decoder.decode(value, { stream: true });
        const lines = accumulated.split('\n');
        accumulated = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          let data;
          try { data = JSON.parse(line.slice(6)); } catch { continue; }

          if (data.type === 'meta') {
            setModelInfo(data.model || '');
          } else if (data.type === 'chunk') {
            aiFullText += data.text;
            setStreamingText(aiFullText);
          } else if (data.type === 'done') {
            streamCompleted = true;
            setMessages(prev => [
              ...prev,
              { role: 'assistant', content: aiFullText, createdAt: new Date() }
            ]);
            setStreamingText('');
            setIsStreaming(false);
            // Update conversation title after first message
            if (messages.length <= 1) {
              setConversations(prev =>
                prev.map(c =>
                  c._id === activeConversationId
                    ? { ...c, title: message.substring(0, 60) + (message.length > 60 ? '...' : ''), lastMessageAt: new Date() }
                    : c
                )
              );
            }
          } else if (data.type === 'error') {
            streamError = data.message || 'Lỗi từ server';
          }
        }
      }

      // Stream closed without 'done' but text arrived — treat as success
      if (!streamCompleted && aiFullText && !streamError) {
        setMessages(prev => [...prev, { role: 'assistant', content: aiFullText, createdAt: new Date() }]);
        setStreamingText('');
        setIsStreaming(false);
      }

      if (streamError && !aiFullText) throw new Error(streamError);

    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: '❌ Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại.', createdAt: new Date() }
      ]);
    } finally {
      setIsStreaming(false);
      setStreamingText('');
    }
  };

  // ── Shared sidebar props ──────────────────────────────────────────────────────

  const sidebarProps = {
    conversations,
    activeConversationId,
    loadingConversations,
    contextLabel,
    creating,
    onSelect:    loadConversation,
    onDelete:    deleteConversation,
    onNew:       () => createNewConversation(),
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <StudentLayout fullHeight>
      {/*
        Root: flex row, fills height provided by StudentLayout's fullHeight mode.
        ┌─────────┬───────────────────────────────────────┐
        │ Sidebar │ Chat header + messages + input         │
        └─────────┴───────────────────────────────────────┘
      */}
      <div
        className="flex-1 flex overflow-hidden"
        style={{ borderTop: '1px solid var(--border)' }}
      >

        {/* ═══════════ DESKTOP SIDEBAR ═══════════
            Hidden on mobile — use mobile drawer instead.
            Animated via CSS transition on width so it doesn't reflow.            */}
        <div
          className="hidden md:flex flex-col flex-shrink-0 transition-all duration-200 overflow-hidden"
          style={{
            width: sidebarOpen ? '256px' : '0px',
            borderRight: sidebarOpen ? '1px solid var(--border)' : 'none',
          }}
        >
          <SidebarPanel {...sidebarProps} onClose={null} />
        </div>

        {/* ═══════════ MOBILE DRAWER (overlay) ════
            Slides in from left over the chat area.              */}
        {mobileDrawerOpen && (
          <>
            {/* Backdrop */}
            <div
              className="md:hidden fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
              onClick={() => setMobileDrawerOpen(false)}
            />
            {/* Drawer */}
            <aside
              className="md:hidden fixed top-0 left-0 h-full z-50 w-72 slide-in-left"
              style={{ background: 'var(--bg-secondary)' }}
            >
              {/* Offset for mobile header */}
              <div className="pt-14">
                <SidebarPanel
                  {...sidebarProps}
                  onClose={() => setMobileDrawerOpen(false)}
                />
              </div>
            </aside>
          </>
        )}

        {/* ═══════════ CHAT AREA ═══════════════════ */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)' }}>

          {/* ── Chat Header ── */}
          <div
            className="flex items-center gap-2 px-3 md:px-4 py-2.5 flex-shrink-0"
            style={{
              borderBottom: '1px solid var(--border)',
              background: 'var(--bg-card)',
              minHeight: '52px',  /* consistent header height */
            }}
          >
            {/* Desktop: toggle sidebar */}
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="hidden md:flex w-9 h-9 rounded-xl items-center justify-center transition-colors flex-shrink-0"
              style={{ color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}
              aria-label={sidebarOpen ? 'Ẩn danh sách chat' : 'Hiện danh sách chat'}
            >
              <MenuIcon />
            </button>

            {/* Mobile: open conversation drawer */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
              style={{ color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}
              aria-label="Danh sách cuộc trò chuyện"
            >
              <MenuIcon />
            </button>

            {/* Bot identity */}
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--amber-soft)' }}
            >
              <SparkleIcon />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>
                EduBot
              </h2>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {activeConversation?.contextLabel
                  ? `📌 ${activeConversation.contextLabel}`
                  : 'Trợ lý học tập AI'}
              </p>
            </div>

            {/* Model badge */}
            {modelInfo && (
              <span
                className="hidden sm:inline-flex px-2 py-0.5 rounded-lg text-xs font-medium flex-shrink-0"
                style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}
              >
                {modelInfo}
              </span>
            )}

            {/* New chat button */}
            <button
              onClick={() => createNewConversation()}
              disabled={creating}
              className="flex items-center gap-1.5 px-3 h-9 rounded-xl text-xs font-medium flex-shrink-0 transition-colors"
              style={{
                background: 'var(--amber-soft)',
                color: 'var(--amber)',
                cursor: creating ? 'not-allowed' : 'pointer',
                opacity: creating ? 0.6 : 1,
              }}
              aria-label="Tạo cuộc trò chuyện mới"
            >
              <PlusIcon />
              <span className="hidden sm:inline">Chat mới</span>
            </button>
          </div>

          {/* ── Messages ── */}
          <ChatWindow
            messages={messages}
            streamingText={streamingText}
            isStreaming={isStreaming}
            onSuggestionClick={handleSendMessage}
          />

          {/* ── Input ── */}
          <ChatInput
            onSend={handleSendMessage}
            disabled={isStreaming || !activeConversationId}
            placeholder={
              activeConversation?.contextLabel
                ? `Hỏi về "${activeConversation.contextLabel}"...`
                : 'Nhập câu hỏi của bạn...'
            }
          />
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudyChat;
