import { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// Markdown component overrides — defined outside render to avoid re-creation on every tick
const mdComponents = {
  p:    ({ children }) => <p style={{ margin: '0 0 8px', lineHeight: 1.7 }}>{children}</p>,
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

// Bot avatar icon
const BotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 2C10.343 2 9 3.343 9 5V11H15V5C15 3.343 13.657 2 12 2Z" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="9" cy="16" r="1" fill="currentColor" />
    <circle cx="15" cy="16" r="1" fill="currentColor" />
    <path d="M8 21V21.5M16 21V21.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// Typing animation while AI is thinking
const TypingDots = () => (
  <div className="flex items-center gap-1 py-1">
    {[0, 1, 2].map(i => (
      <div
        key={i}
        className="w-2 h-2 rounded-full"
        style={{ background: 'var(--amber)', animation: `bounce 1.2s infinite ${i * 0.2}s` }}
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

// ─── Single message bubble ────────────────────────────────────────────────────

const Message = ({ msg }) => {
  const isUser = msg.role === 'user';
  return (
    <div
      className={`flex gap-2.5 md:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      style={{ marginBottom: '12px' }}
    >
      {/* Bot avatar — only for assistant messages */}
      {!isUser && (
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}
        >
          <BotIcon />
        </div>
      )}

      {/* Bubble
          max-w-[85%] on mobile (use more screen width), max-w-[75%] on desktop (readability) */}
      <div
        className={`max-w-[85%] md:max-w-[75%] px-3.5 md:px-4 py-2.5 md:py-3 rounded-2xl text-sm leading-relaxed ${
          isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'
        }`}
        style={{
          background: isUser ? 'var(--amber)' : 'var(--bg-card)',
          color:      isUser ? '#fff'         : 'var(--text-primary)',
          border:     isUser ? 'none'         : '1px solid var(--border)',
          boxShadow:  '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        {isUser ? (
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none" style={{ color: 'inherit' }}>
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={mdComponents}>
              {msg.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Streaming bubble (same style as Message but with cursor) ─────────────────

const StreamingMessage = ({ text }) => (
  <div className="flex gap-2.5 md:gap-3 flex-row" style={{ marginBottom: '12px' }}>
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
      style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}
    >
      <BotIcon />
    </div>
    <div
      className="max-w-[85%] md:max-w-[75%] px-3.5 md:px-4 py-2.5 md:py-3 rounded-2xl rounded-tl-sm text-sm"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      {text ? (
        <div className="prose prose-sm max-w-none" style={{ color: 'inherit' }}>
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={mdComponents}>
            {text}
          </ReactMarkdown>
          {/* Blinking cursor */}
          <span style={{
            display: 'inline-block', width: '2px', height: '14px',
            background: 'var(--amber)', animation: 'blink 1s infinite',
            verticalAlign: 'text-bottom', marginLeft: '1px'
          }} />
        </div>
      ) : (
        <TypingDots />
      )}
    </div>
  </div>
);

// ─── Empty state ──────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  'Giải thích phương trình bậc 2',
  'Định lý Pythagorean là gì?',
  'Tôi cần ôn tập những gì?',
];

const EmptyState = ({ onSuggestionClick }) => (
  <div className="h-full flex flex-col items-center justify-center px-4 py-8 gap-4">
    {/* Icon */}
    <div
      className="w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center"
      style={{ background: 'var(--amber-soft)' }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 md:w-8 md:h-8" style={{ color: 'var(--amber)' }}>
        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>

    {/* Text */}
    <div className="text-center">
      <h3 className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
        EduBot sẵn sàng hỗ trợ!
      </h3>
      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
        Hỏi bất kỳ câu hỏi nào về bài học hoặc bài tập
      </p>
    </div>

    {/* Suggestion cards — tappable, send the prompt immediately */}
    <div className="flex flex-col gap-2 w-full max-w-sm">
      {SUGGESTIONS.map(s => (
        <button
          key={s}
          onClick={() => onSuggestionClick?.(s)}
          className="px-4 py-2.5 rounded-xl text-sm text-left transition-colors w-full"
          style={{
            background: 'var(--bg-secondary)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--amber)'; e.currentTarget.style.color = 'var(--amber)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          {s}
        </button>
      ))}
    </div>
  </div>
);

// ─── ChatWindow ───────────────────────────────────────────────────────────────

/**
 * Props:
 *  - messages: [{role, content}]
 *  - streamingText: string
 *  - isStreaming: boolean
 *  - onSuggestionClick: (text: string) => void  — fired when user taps an empty-state suggestion
 */
const ChatWindow = ({ messages, streamingText, isStreaming, onSuggestionClick }) => {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  return (
    <div
      className="flex-1 overflow-y-auto px-3 md:px-6 py-4"
      style={{ scrollbarWidth: 'thin', overscrollBehavior: 'contain' }}
    >
      {/* Empty state */}
      {messages.length === 0 && !isStreaming && (
        <EmptyState onSuggestionClick={onSuggestionClick} />
      )}

      {/* Message list */}
      {messages.map((msg, i) => (
        <Message key={i} msg={msg} />
      ))}

      {/* Streaming response */}
      {isStreaming && <StreamingMessage text={streamingText} />}

      <div ref={bottomRef} />

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
};

export default ChatWindow;
