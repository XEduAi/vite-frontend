import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import ChatWindow from '../../components/ChatWindow';
import ChatInput from '../../components/ChatInput';
import { getApiErrorMessage } from '../../api/errors';
import { useAuth } from '../../auth/useAuth';
import {
  upsertConversationPreview,
  useMyAiUsageQuery,
  useChatConversationQuery,
  useChatConversationsQuery,
  useCreateConversationMutation,
  useDeleteConversationMutation,
} from '../../features/chat/hooks';

// ─── Context labels ────────────────────────────────────────────────────────────
const CONTEXT_LABELS = {
  general:     'Học tập chung',
  lesson:      'Bài học',
  quiz:        'Bài kiểm tra',
  topic:       'Chủ đề',
  performance: 'Điểm yếu của tôi',
};

// ─── Micro-icons ───────────────────────────────────────────────────────────────
const IcoMenu  = () => <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18 }}><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /></svg>;
const IcoPlus  = () => <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16 }}><path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
const IcoTrash = () => <svg viewBox="0 0 20 20" fill="none" style={{ width: 14, height: 14 }}><path d="M4 6h12M8 6V4h4v2M6 6l1 10h6l1-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const IcoClose = () => <svg viewBox="0 0 20 20" fill="none" style={{ width: 16, height: 16 }}><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;

// Hexagonal EduBot avatar — matches ChatWindow's HexAvatar
const HexAvatar = ({ size = 30 }) => (
  <svg width={size} height={size} viewBox="0 0 30 30" fill="none">
    <path d="M15 2L26.26 8.5V21.5L15 28L3.74 21.5V8.5L15 2Z"
      fill="var(--amber-soft)" stroke="var(--amber)" strokeWidth="1.4" />
    <path d="M15 9l1.15 4a1.9 1.9 0 001.28 1.28L21 15.4l-4 .78a1.9 1.9 0 00-1.42 1.42L14.6 21l-1-3.8a1.9 1.9 0 00-1.42-1.42L9 15.4l3.85-1a1.9 1.9 0 001.28-1.4L15 9z"
      fill="var(--amber)" />
  </svg>
);

// ─── Conversation list item ────────────────────────────────────────────────────
const ConvItem = ({ conv, isActive, onSelect, onDelete }) => (
  <div
    onClick={() => onSelect(conv._id)}
    style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '10px 12px 10px 14px',
      marginBottom: '2px',
      borderRadius: '10px',
      cursor: 'pointer',
      background: isActive ? 'var(--amber-soft)' : 'transparent',
      // Left-border indicator: the key active-state visual
      borderLeft: `3px solid ${isActive ? 'var(--amber)' : 'transparent'}`,
      transition: 'all 0.15s',
      position: 'relative',
    }}
    onMouseEnter={e => {
      if (!isActive) {
        e.currentTarget.style.background = 'var(--bg-card)';
        e.currentTarget.querySelector('[data-del]').style.opacity = '1';
      }
    }}
    onMouseLeave={e => {
      if (!isActive) {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.querySelector('[data-del]').style.opacity = '0';
      }
    }}
  >
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{
        fontSize: '13px', fontWeight: isActive ? 600 : 400,
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        margin: 0, lineHeight: 1.4,
        fontFamily: "'Be Vietnam Pro', sans-serif",
      }}>
        {conv.title || 'Cuộc trò chuyện mới'}
      </p>
      <p style={{
        fontSize: '11px', color: 'var(--text-muted)',
        margin: '2px 0 0', lineHeight: 1.3,
        fontFamily: "'Be Vietnam Pro', sans-serif",
      }}>
        {conv.contextType !== 'general'
          ? CONTEXT_LABELS[conv.contextType] || conv.contextType
          : new Date(conv.lastMessageAt).toLocaleDateString('vi-VN')}
      </p>
    </div>

    {/* Delete — hidden until hover, always visible on touch devices */}
    <button
      data-del
      onClick={e => onDelete(conv._id, e)}
      style={{
        opacity: 0, flexShrink: 0,
        width: '28px', height: '28px', borderRadius: '7px',
        border: 'none', background: 'transparent',
        color: 'var(--text-muted)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'opacity 0.15s, background 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-light)'; e.currentTarget.style.color = 'var(--danger)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
      aria-label="Xóa"
    >
      <IcoTrash />
    </button>
  </div>
);

// ─── Sidebar panel (shared between desktop strip + mobile drawer) ──────────────
const SidebarPanel = ({ conversations, activeConversationId, loadingConversations,
  contextLabel, creating, errorMessage, onSelect, onDelete, onNew, onClose }) => (
  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-secondary)' }}>

    {/* Header */}
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 14px 12px',
      borderBottom: '1px solid var(--border)',
      flexShrink: 0,
    }}>
      <span style={{
        fontSize: '11px', fontWeight: 700, letterSpacing: '0.09em',
        textTransform: 'uppercase', color: 'var(--text-muted)',
        fontFamily: "'Space Grotesk', sans-serif",
      }}>
        Cuộc trò chuyện
        {conversations.length > 0 && (
          <span style={{
            marginLeft: '6px', padding: '1px 5px', borderRadius: '5px',
            background: 'var(--amber-soft)', color: 'var(--amber)',
            fontSize: '10px',
          }}>
            {conversations.length}
          </span>
        )}
      </span>

      <div style={{ display: 'flex', gap: '4px' }}>
        {/* New conversation */}
        <button
          onClick={onNew} disabled={creating}
          style={{
            width: '30px', height: '30px', borderRadius: '8px',
            border: 'none', cursor: creating ? 'not-allowed' : 'pointer',
            background: 'var(--amber-soft)', color: 'var(--amber)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: creating ? 0.5 : 1, transition: 'opacity 0.15s',
          }}
          title="Chat mới"
        >
          <IcoPlus />
        </button>
        {/* Close (mobile only) */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              width: '30px', height: '30px', borderRadius: '8px',
              border: 'none', cursor: 'pointer',
              background: 'var(--bg-card)', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <IcoClose />
          </button>
        )}
      </div>
    </div>

    {/* Context chip */}
    {contextLabel && (
      <div style={{ padding: '10px 14px 0' }}>
        <span style={{
          display: 'inline-block', padding: '4px 10px',
          background: 'var(--amber-soft)', color: 'var(--amber)',
          borderRadius: '100px', fontSize: '11px', fontWeight: 600,
        }}>
          📌 {contextLabel}
        </span>
      </div>
    )}

    {/* List */}
    <div style={{
      flex: 1, overflowY: 'auto', padding: '8px 8px 12px',
      scrollbarWidth: 'thin', overscrollBehavior: 'contain',
    }}>
      {loadingConversations ? (
        <p style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
          Đang tải...
        </p>
      ) : errorMessage ? (
        <p style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
          {errorMessage}
        </p>
      ) : conversations.length === 0 ? (
        <p style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
          Chưa có cuộc trò chuyện nào
        </p>
      ) : (
        conversations.map(conv => (
          <ConvItem key={conv._id} conv={conv}
            isActive={activeConversationId === conv._id}
            onSelect={id => { onSelect(id); onClose?.(); }}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  </div>
);

// ─── Main page ─────────────────────────────────────────────────────────────────
const StudyChat = () => {
  const { accessToken, refreshSession } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  // ── State ────────────────────────────────────────────────────────────────────
  const [activeConversationId,   setActiveConversationId]   = useState(null);
  const [messages,               setMessages]               = useState([]);
  const [streamingText,          setStreamingText]          = useState('');
  const [isStreaming,            setIsStreaming]            = useState(false);
  const [modelInfo,              setModelInfo]              = useState('');

  // Sidebar open on desktop by default, closed on mobile
  const [sidebarOpen,     setSidebarOpen]     = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const contextType  = searchParams.get('contextType')  || 'general';
  const contextId    = searchParams.get('contextId')    || '';
  const contextLabel = searchParams.get('contextLabel') || '';

  const conversationsQuery = useChatConversationsQuery();
  const aiUsageQuery = useMyAiUsageQuery();
  const { mutateAsync: createConversationAsync, isPending: creating } = useCreateConversationMutation();
  const { mutateAsync: deleteConversationAsync } = useDeleteConversationMutation();
  const activeConversationQuery = useChatConversationQuery(activeConversationId);

  const conversations = conversationsQuery.data || [];
  const aiUsage = aiUsageQuery.data || null;
  const activeConversation = activeConversationQuery.data || null;
  const loadingConversations = conversationsQuery.isPending;
  const conversationsErrorMessage = conversationsQuery.isError
    ? getApiErrorMessage(conversationsQuery.error, 'Không thể tải lịch sử trò chuyện')
    : '';
  const activeConversationErrorMessage = activeConversationQuery.isError
    ? getApiErrorMessage(activeConversationQuery.error, 'Không thể tải cuộc trò chuyện')
    : '';

  // ── Data ─────────────────────────────────────────────────────────────────────
  const createNewConversation = useCallback(async (override = {}) => {
    try {
      const newConversation = await createConversationAsync({
        contextType:  override.contextType  || contextType,
        contextId:    override.contextId    || contextId,
        contextLabel: override.contextLabel || contextLabel,
      });
      setActiveConversationId(newConversation._id);
      setMessages([]);
      setModelInfo('');
      setStreamingText('');
    } catch (err) {
      console.error('Lỗi tạo conversation:', err);
    }
  }, [contextId, contextLabel, contextType, createConversationAsync]);

  useEffect(() => {
    if (loadingConversations || activeConversationId) {
      return;
    }

    if (conversations.length === 0) {
      createNewConversation();
      return;
    }

    setActiveConversationId(conversations[0]._id);
  }, [activeConversationId, conversations, createNewConversation, loadingConversations]);

  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      setModelInfo('');
      setStreamingText('');
    }
  }, [activeConversationId]);

  useEffect(() => {
    if (activeConversation && !isStreaming) {
      setMessages(activeConversation.messages || []);
      setModelInfo(activeConversation.modelUsed || '');
      setStreamingText('');
    }
  }, [activeConversation, isStreaming]);

  const selectConversation = (id) => {
    setActiveConversationId(id);
    setMessages([]);
    setModelInfo('');
    setStreamingText('');
  };

  const deleteConversation = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Xóa cuộc trò chuyện này?')) return;
    try {
      await deleteConversationAsync(id);
      const remaining = conversations.filter((conversation) => conversation._id !== id);
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }
      if (remaining.length > 0) {
        setActiveConversationId(remaining[0]._id);
      }
    } catch (err) {
      console.error('Lỗi xóa:', err);
    }
  };

  // ── SSE streaming ─────────────────────────────────────────────────────────────
  const handleSendMessage = async (message) => {
    if (!activeConversationId || isStreaming) return;

    const userMessage = {
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    };
    const messageCountBeforeSend = messages.length;
    setMessages((previousMessages) => [...previousMessages, userMessage]);
    setIsStreaming(true);
    setStreamingText('');

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
      let token = accessToken;

      const openStream = async (bearerToken) => fetch(
        `${baseUrl}/chat/conversations/${activeConversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${bearerToken}` },
          body: JSON.stringify({ message }),
        }
      );

      if (!token) {
        token = await refreshSession();
      }

      if (!token) {
        throw new Error('Phiên đăng nhập đã hết hạn');
      }

      let response = await openStream(token);

      if (response.status === 401) {
        token = await refreshSession();
        response = await openStream(token);
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader     = response.body.getReader();
      const decoder    = new TextDecoder();
      let accumulated  = '';
      let aiFullText   = '';
      let serverError  = null;
      let tokensUsed   = 0;
      let citations    = [];
      let latestUsage  = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulated += decoder.decode(value, { stream: true });
        const lines  = accumulated.split('\n');
        accumulated  = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          let data;
          try { data = JSON.parse(line.slice(6)); } catch { continue; }

          if      (data.type === 'meta')  {
            setModelInfo(data.model || '');
            if (data.usage) {
              latestUsage = data.usage;
              queryClient.setQueryData(['chat', 'usage'], data.usage);
            }
          }
          else if (data.type === 'chunk') { aiFullText += data.text; setStreamingText(aiFullText); }
          else if (data.type === 'done')  {
            tokensUsed = data.tokensUsed || 0;
            citations = data.citations || [];
            latestUsage = data.usage || latestUsage;
          }
          else if (data.type === 'error') { serverError = data.message || 'Lỗi từ server'; }
        }
      }

      if (serverError && !aiFullText) throw new Error(serverError);

      if (aiFullText) {
        const assistantMessage = {
          role: 'assistant',
          content: aiFullText,
          citations,
          createdAt: new Date().toISOString(),
        };
        const nextTitle = messageCountBeforeSend <= 1
          ? `${message.substring(0, 60)}${message.length > 60 ? '...' : ''}`
          : activeConversation?.title || 'Cuộc trò chuyện mới';
        const nextLastMessageAt = new Date().toISOString();

        setMessages((previousMessages) => [...previousMessages, assistantMessage]);

        queryClient.setQueryData(['chat', 'conversation', activeConversationId], (previousConversation) => (
          previousConversation
            ? {
                ...previousConversation,
                lastMessageAt: nextLastMessageAt,
                messages: [...(previousConversation.messages || []), userMessage, assistantMessage],
                title: nextTitle,
                totalTokens: (previousConversation.totalTokens || 0) + tokensUsed,
              }
            : previousConversation
        ));

        queryClient.setQueryData(['chat', 'conversations'], (previousConversations = []) =>
          upsertConversationPreview(previousConversations, {
            _id: activeConversationId,
            contextLabel: activeConversation?.contextLabel || contextLabel,
            contextType: activeConversation?.contextType || contextType,
            createdAt: activeConversation?.createdAt || nextLastMessageAt,
            lastMessageAt: nextLastMessageAt,
            modelUsed: modelInfo || activeConversation?.modelUsed || '',
            title: nextTitle,
            totalTokens: (activeConversation?.totalTokens || 0) + tokensUsed,
          })
        );

        if (latestUsage) {
          queryClient.setQueryData(['chat', 'usage'], latestUsage);
        }

        queryClient.invalidateQueries({ queryKey: ['chat', 'conversation', activeConversationId] });
        queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
      }

    } catch (err) {
      console.error('Chat error:', err);
      if (err.response?.data?.usage) {
        queryClient.setQueryData(['chat', 'usage'], err.response.data.usage);
      }
      setMessages((previousMessages) => [...previousMessages, {
        role: 'assistant',
        content: `❌ ${getApiErrorMessage(err, 'Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại.')}`,
        createdAt: new Date().toISOString(),
      }]);
    } finally {
      setIsStreaming(false);
      setStreamingText('');
    }
  };

  // ── Shared sidebar props ──────────────────────────────────────────────────────
  const sidebarProps = {
    conversations, activeConversationId, loadingConversations,
    contextLabel, creating, errorMessage: conversationsErrorMessage,
    onSelect: selectConversation, onDelete: deleteConversation,
    onNew: () => createNewConversation(),
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <StudentLayout fullHeight>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ══ DESKTOP SIDEBAR — smooth width transition ══ */}
        <div style={{
          flexShrink: 0, overflow: 'hidden',
          transition: 'width 0.22s cubic-bezier(0.16,1,0.3,1)',
          width: sidebarOpen ? '240px' : '0px',
          borderRight: sidebarOpen ? '1px solid var(--border)' : 'none',
          // Hide on mobile, show transition on desktop
          display: 'flex', flexDirection: 'column',
        }}
          className="hidden md:flex"
        >
          <SidebarPanel {...sidebarProps} onClose={null} />
        </div>

        {/* ══ MOBILE DRAWER (overlay) ══ */}
        {mobileDrawerOpen && (
          <>
            <div
              className="md:hidden"
              onClick={() => setMobileDrawerOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 40,
                background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)',
              }}
            />
            <aside
              className="md:hidden"
              style={{
                position: 'fixed', top: 0, left: 0, bottom: 0,
                zIndex: 50, width: '272px',
                animation: 'slideInLeft 0.22s cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              <div style={{ paddingTop: '56px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <SidebarPanel {...sidebarProps} onClose={() => setMobileDrawerOpen(false)} />
              </div>
            </aside>
          </>
        )}

        {/* ══ CHAT AREA ══ */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          overflow: 'hidden', background: 'var(--bg-primary)',
          minWidth: 0,
        }}>

          {/* ─ Chat header ─ */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '0 12px', height: '52px', flexShrink: 0,
            borderBottom: '1px solid var(--border)',
            background: 'var(--bg-card)',
          }}>
            {/* Desktop only: toggle inline sidebar strip.
                className="hidden md:flex" controls visibility — do NOT
                put display:flex in the inline style or it overrides hidden. */}
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="hidden md:flex items-center justify-center"
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                border: 'none', cursor: 'pointer',
                background: 'var(--bg-secondary)', color: 'var(--text-muted)',
                transition: 'background 0.15s', flexShrink: 0,
              }}
              aria-label={sidebarOpen ? 'Ẩn lịch sử' : 'Hiện lịch sử'}
            >
              <IcoMenu />
            </button>

            {/* Mobile only: open conversation drawer overlay.
                className="flex md:hidden" controls visibility — same rule. */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="flex md:hidden items-center justify-center"
              style={{
                width: '40px', height: '40px', borderRadius: '10px',
                border: 'none', cursor: 'pointer',
                background: 'var(--bg-secondary)', color: 'var(--text-muted)',
                flexShrink: 0,
              }}
              aria-label="Danh sách cuộc trò chuyện"
            >
              <IcoMenu />
            </button>

            {/* Bot identity */}
            <HexAvatar size={28} />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700, fontSize: '14px',
                  color: 'var(--text-primary)', lineHeight: 1.2,
                }}>
                  EduBot
                </span>
                {/* Live status dot — pulses amber while streaming, steady green otherwise */}
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: isStreaming ? 'var(--amber)' : 'var(--success)',
                  boxShadow: isStreaming ? '0 0 6px var(--amber)' : 'none',
                  animation: isStreaming ? 'dotPulse 1s ease-in-out infinite' : 'none',
                  flexShrink: 0,
                }} />
              </div>
              <p style={{
                fontSize: '11px', color: 'var(--text-muted)', margin: 0,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                fontFamily: "'Be Vietnam Pro', sans-serif",
              }}>
                {activeConversation?.contextLabel
                  ? `📌 ${activeConversation.contextLabel}`
                  : isStreaming ? 'Đang soạn câu trả lời…' : 'Trợ lý học tập AI'}
              </p>
            </div>

            {/* Model badge — only on wider screens */}
            {modelInfo && (
              <div className="hidden sm:flex items-center gap-2">
                <span
                  style={{
                    padding: '3px 8px', borderRadius: '100px',
                    background: 'var(--amber-soft)', color: 'var(--amber)',
                    fontSize: '11px', fontWeight: 600, flexShrink: 0,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {modelInfo}
                </span>
                {aiUsage && (
                  <span
                    style={{
                      padding: '3px 8px', borderRadius: '100px',
                      background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                      fontSize: '11px', fontWeight: 600, flexShrink: 0,
                    }}
                  >
                    {aiUsage.dailyLimit === -1 ? 'Không giới hạn' : `Còn ${aiUsage.remainingToday} lượt hôm nay`}
                  </span>
                )}
              </div>
            )}

            {/* New chat */}
            <button
              onClick={() => createNewConversation()}
              disabled={creating}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '0 12px', height: '34px', borderRadius: '100px',
                border: '1px solid var(--amber)',
                background: 'transparent', color: 'var(--amber)',
                fontSize: '12px', fontWeight: 600, flexShrink: 0,
                cursor: creating ? 'not-allowed' : 'pointer',
                opacity: creating ? 0.5 : 1,
                transition: 'all 0.15s',
                fontFamily: "'Be Vietnam Pro', sans-serif",
              }}
              onMouseEnter={e => {
                if (!creating) {
                  e.currentTarget.style.background = 'var(--amber)';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--amber)';
              }}
            >
              <IcoPlus />
              <span className="hidden sm:inline">Mới</span>
            </button>
          </div>

          {activeConversationErrorMessage && (
            <div
              style={{
                margin: '10px 12px 0',
                padding: '10px 12px',
                borderRadius: '12px',
                background: 'var(--danger-light)',
                color: 'var(--danger)',
                fontSize: '12px',
              }}
            >
              {activeConversationErrorMessage}
            </div>
          )}

          {/* ─ Messages ─ */}
          <ChatWindow
            messages={messages}
            streamingText={streamingText}
            isStreaming={isStreaming}
            onSuggestionClick={handleSendMessage}
          />

          {/* ─ Input ─ */}
          <ChatInput
            onSend={handleSendMessage}
            disabled={isStreaming || !activeConversationId || activeConversationQuery.isPending}
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
