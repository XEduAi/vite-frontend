import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import ChatWindow from '../../components/ChatWindow';
import ChatInput from '../../components/ChatInput';
import axiosClient from '../../api/axiosClient';

// Icon cho sidebar
const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Context type labels
const CONTEXT_LABELS = {
  general: 'Học tập chung',
  lesson: 'Bài học',
  quiz: 'Bài kiểm tra',
  topic: 'Chủ đề',
  performance: 'Điểm yếu của tôi'
};

const StudyChat = () => {
  const [searchParams] = useSearchParams();

  // Danh sách conversations trong sidebar
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [modelInfo, setModelInfo] = useState('');

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [creating, setCreating] = useState(false);

  // Đọc context từ URL params (từ các trang khác navigate sang)
  const contextType = searchParams.get('contextType') || 'general';
  const contextId = searchParams.get('contextId') || '';
  const contextLabel = searchParams.get('contextLabel') || '';

  // Load danh sách conversations
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

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load chi tiết conversation khi chọn
  const loadConversation = async (id) => {
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
  };

  // Tạo conversation mới
  const createNewConversation = async (overrideContext = {}) => {
    setCreating(true);
    try {
      const payload = {
        contextType: overrideContext.contextType || contextType,
        contextId: overrideContext.contextId || contextId,
        contextLabel: overrideContext.contextLabel || contextLabel
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
  };

  // Tự động tạo conversation mới nếu không có conversation nào
  useEffect(() => {
    if (!loadingConversations && conversations.length === 0) {
      createNewConversation();
    } else if (!loadingConversations && conversations.length > 0 && !activeConversationId) {
      loadConversation(conversations[0]._id);
    }
  // Chỉ chạy khi loading state thay đổi lần đầu — bỏ qua dependency warning
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingConversations]);

  // Xóa conversation
  const deleteConversation = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Xóa cuộc trò chuyện này?')) return;
    try {
      await axiosClient.delete(`/chat/conversations/${id}`);
      setConversations(prev => prev.filter(c => c._id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setActiveConversation(null);
        setMessages([]);
        // Load conversation kế tiếp nếu có
        const remaining = conversations.filter(c => c._id !== id);
        if (remaining.length > 0) {
          loadConversation(remaining[0]._id);
        }
      }
    } catch (err) {
      console.error('Lỗi xóa:', err);
    }
  };

  // Gửi tin nhắn với SSE streaming
  const handleSendMessage = async (message) => {
    if (!activeConversationId || isStreaming) return;

    // Thêm message user ngay lập tức (optimistic)
    const userMsg = { role: 'user', content: message, createdAt: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);
    setStreamingText('');

    try {
      // Dùng fetch để có thể stream SSE với POST body
      const token = localStorage.getItem('token');
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

      const response = await fetch(
        `${baseUrl}/chat/conversations/${activeConversationId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ message })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Đọc stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let aiFullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulated += decoder.decode(value, { stream: true });

        // Parse SSE events
        const lines = accumulated.split('\n');
        accumulated = lines.pop() || ''; // Giữ lại dòng chưa hoàn chỉnh

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'meta') {
              setModelInfo(data.model || '');
            } else if (data.type === 'chunk') {
              aiFullText += data.text;
              setStreamingText(aiFullText);
            } else if (data.type === 'done') {
              // Stream hoàn tất — thêm vào messages
              setMessages(prev => [
                ...prev,
                { role: 'assistant', content: aiFullText, createdAt: new Date() }
              ]);
              setStreamingText('');
              setIsStreaming(false);

              // Cập nhật title conversation nếu là tin nhắn đầu tiên
              if (messages.length <= 1) {
                setConversations(prev =>
                  prev.map(c =>
                    c._id === activeConversationId
                      ? {
                          ...c,
                          title: message.substring(0, 60) + (message.length > 60 ? '...' : ''),
                          lastMessageAt: new Date()
                        }
                      : c
                  )
                );
              }
            } else if (data.type === 'error') {
              throw new Error(data.message);
            }
          } catch {
            // Bỏ qua JSON parse errors
          }
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại.`,
          createdAt: new Date()
        }
      ]);
    } finally {
      setIsStreaming(false);
      setStreamingText('');
    }
  };

  return (
    <StudentLayout>
      <div
        className="flex h-[calc(100vh-64px)] overflow-hidden rounded-2xl"
        style={{ border: '1px solid var(--border)' }}
      >
        {/* ====== SIDEBAR ====== */}
        <div
          className={`flex-shrink-0 flex flex-col transition-all duration-300 ${
            sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
          }`}
          style={{
            background: 'var(--bg-secondary)',
            borderRight: '1px solid var(--border)'
          }}
        >
          {/* Sidebar header */}
          <div className="p-4 flex items-center justify-between">
            <span className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              Lịch sử chat
            </span>
            <button
              onClick={() => createNewConversation()}
              disabled={creating}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{
                background: 'var(--amber-soft)',
                color: 'var(--amber)',
                cursor: creating ? 'not-allowed' : 'pointer'
              }}
              title="Cuộc trò chuyện mới"
            >
              <PlusIcon />
            </button>
          </div>

          {/* Context chip (nếu đến từ một trang cụ thể) */}
          {contextLabel && (
            <div className="px-4 mb-2">
              <div
                className="px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{
                  background: 'var(--amber-soft)',
                  color: 'var(--amber)'
                }}
              >
                📌 {contextLabel}
              </div>
            </div>
          )}

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto px-2" style={{ scrollbarWidth: 'thin' }}>
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
                <div
                  key={conv._id}
                  onClick={() => loadConversation(conv._id)}
                  className="group flex items-start gap-2 px-3 py-2.5 rounded-xl mb-1 cursor-pointer transition-colors"
                  style={{
                    background:
                      activeConversationId === conv._id
                        ? 'var(--amber-soft)'
                        : 'transparent',
                    border: `1px solid ${activeConversationId === conv._id ? 'var(--amber)' : 'transparent'}`
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background:
                        activeConversationId === conv._id ? 'var(--amber)' : 'var(--bg-card)',
                      color: activeConversationId === conv._id ? '#fff' : 'var(--text-muted)'
                    }}
                  >
                    <ChatIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-medium truncate"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {conv.title || 'Cuộc trò chuyện mới'}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {conv.contextType !== 'general'
                        ? CONTEXT_LABELS[conv.contextType]
                        : new Date(conv.lastMessageAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <button
                    onClick={e => deleteConversation(conv._id, e)}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ====== CHAT AREA ====== */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
          {/* Chat header */}
          <div
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}
          >
            {/* Toggle sidebar button */}
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
              style={{ color: 'var(--text-muted)', background: 'var(--bg-secondary)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {/* Bot avatar */}
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--amber-soft)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" style={{ color: 'var(--amber)' }}>
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div>
              <h2 className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                EduBot
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {activeConversation?.contextLabel
                  ? `📌 ${activeConversation.contextLabel}`
                  : 'Trợ lý học tập AI'}
                {modelInfo && (
                  <span
                    className="ml-2 px-1.5 py-0.5 rounded text-xs"
                    style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}
                  >
                    {modelInfo}
                  </span>
                )}
              </p>
            </div>

            {/* New chat button */}
            <div className="ml-auto">
              <button
                onClick={() => createNewConversation()}
                disabled={creating}
                className="px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                style={{
                  background: 'var(--amber-soft)',
                  color: 'var(--amber)',
                  cursor: creating ? 'not-allowed' : 'pointer'
                }}
              >
                <PlusIcon />
                Chat mới
              </button>
            </div>
          </div>

          {/* Messages */}
          <ChatWindow
            messages={messages}
            streamingText={streamingText}
            isStreaming={isStreaming}
          />

          {/* Input */}
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
