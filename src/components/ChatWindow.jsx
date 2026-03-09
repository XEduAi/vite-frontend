import { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// Markdown component overrides — defined outside render to avoid ESLint "no inline components" warning
const mdComponents = {
  p: ({ children }) => <p style={{ margin: '0 0 8px', lineHeight: 1.7 }}>{children}</p>,
  code: ({ inline, children }) =>
    inline ? (
      <code style={{ background: 'var(--bg-secondary)', padding: '1px 5px', borderRadius: '4px', fontSize: '0.85em', fontFamily: 'monospace' }}>
        {children}
      </code>
    ) : (
      <pre style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', overflow: 'auto', fontSize: '0.85em', margin: '8px 0' }}>
        <code>{children}</code>
      </pre>
    ),
  ol: ({ children }) => <ol style={{ paddingLeft: '20px', margin: '4px 0' }}>{children}</ol>,
  ul: ({ children }) => <ul style={{ paddingLeft: '20px', margin: '4px 0' }}>{children}</ul>,
  li: ({ children }) => <li style={{ margin: '2px 0' }}>{children}</li>,
};

// Icon send
const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Icon bot
const BotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 2C10.3431 2 9 3.34315 9 5V11H15V5C15 3.34315 13.6569 2 12 2Z" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="9" cy="16" r="1" fill="currentColor" />
    <circle cx="15" cy="16" r="1" fill="currentColor" />
    <path d="M8 21V21.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 21V21.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Typing animation khi AI đang trả lời
const TypingDots = () => (
  <div className="flex items-center gap-1 py-1">
    {[0, 1, 2].map(i => (
      <div
        key={i}
        className="w-2 h-2 rounded-full"
        style={{
          background: 'var(--amber)',
          animation: `bounce 1.2s infinite ${i * 0.2}s`
        }}
      />
    ))}
    <style>{`
      @keyframes bounce {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
        40% { transform: translateY(-6px); opacity: 1; }
      }
    `}</style>
  </div>
);

/**
 * Render một tin nhắn đơn lẻ
 */
const Message = ({ msg }) => {
  const isUser = msg.role === 'user';

  return (
    <div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      style={{ marginBottom: '16px' }}
    >
      {/* Avatar */}
      {!isUser && (
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--amber-soft)', color: 'var(--amber)', marginTop: '2px' }}
        >
          <BotIcon />
        </div>
      )}

      {/* Nội dung tin nhắn */}
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'
        }`}
        style={{
          background: isUser ? 'var(--amber)' : 'var(--bg-card)',
          color: isUser ? '#fff' : 'var(--text-primary)',
          border: isUser ? 'none' : '1px solid var(--border)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
        }}
      >
        {isUser ? (
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none" style={{ color: 'inherit' }}>
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={mdComponents}
            >
              {msg.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * ChatWindow — Hiển thị messages + streaming typing indicator
 * Props:
 *  - messages: [{role, content}]
 *  - streamingText: string (text đang stream)
 *  - isStreaming: boolean
 */
const ChatWindow = ({ messages, streamingText, isStreaming }) => {
  const bottomRef = useRef(null);

  // Auto-scroll xuống cuối khi có message mới
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-4"
      style={{ scrollbarWidth: 'thin' }}
    >
      {/* Empty state */}
      {messages.length === 0 && !isStreaming && (
        <div className="h-full flex flex-col items-center justify-center gap-4 py-12">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--amber-soft)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" style={{ color: 'var(--amber)' }}>
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-center">
            <h3 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              EduBot sẵn sàng hỗ trợ!
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Hỏi bất kỳ câu hỏi nào về bài học hoặc bài tập
            </p>
          </div>
          {/* Gợi ý câu hỏi */}
          <div className="grid grid-cols-1 gap-2 w-full max-w-sm mt-2">
            {[
              'Giải thích phương trình bậc 2 cho tôi',
              'Hình học là gì?',
              'Tôi cần ôn tập những gì?'
            ].map(suggestion => (
              <div
                key={suggestion}
                className="px-4 py-2 rounded-xl text-sm text-center cursor-default"
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)'
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((msg, i) => (
        <Message key={i} msg={msg} />
      ))}

      {/* Streaming response */}
      {isStreaming && (
        <div className="flex gap-3" style={{ marginBottom: '16px' }}>
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--amber-soft)', color: 'var(--amber)', marginTop: '2px' }}
          >
            <BotIcon />
          </div>
          <div
            className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tl-sm text-sm"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
            }}
          >
            {streamingText ? (
              <div className="prose prose-sm max-w-none" style={{ color: 'inherit' }}>
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={mdComponents}
                >
                  {streamingText}
                </ReactMarkdown>
                <span
                  style={{
                    display: 'inline-block',
                    width: '2px',
                    height: '14px',
                    background: 'var(--amber)',
                    animation: 'blink 1s infinite',
                    verticalAlign: 'text-bottom',
                    marginLeft: '1px'
                  }}
                />
              </div>
            ) : (
              <TypingDots />
            )}
          </div>
        </div>
      )}

      <div ref={bottomRef} />

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
};

export default ChatWindow;
