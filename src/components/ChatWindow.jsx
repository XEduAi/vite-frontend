import { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

// ─── Markdown renderer overrides ──────────────────────────────────────────────
const MD = {
  p:           ({ children }) => <p style={{ margin: '0 0 10px', lineHeight: 1.78 }}>{children}</p>,
  strong:      ({ children }) => <strong style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{children}</strong>,
  em:          ({ children }) => <em style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>{children}</em>,
  code:        ({ inline, children }) => inline
    ? <code style={{ background: 'var(--bg-secondary)', padding: '1px 6px', borderRadius: '5px', fontSize: '0.83em', fontFamily: "'JetBrains Mono', monospace", color: 'var(--amber-warm)' }}>{children}</code>
    : <pre style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '14px 16px', borderRadius: '10px', overflow: 'auto', fontSize: '0.83em', margin: '10px 0', fontFamily: "'JetBrains Mono', monospace" }}><code style={{ color: 'var(--text-primary)' }}>{children}</code></pre>,
  ol:          ({ children }) => <ol style={{ paddingLeft: '22px', margin: '6px 0', lineHeight: 1.78 }}>{children}</ol>,
  ul:          ({ children }) => <ul style={{ paddingLeft: '22px', margin: '6px 0', lineHeight: 1.78 }}>{children}</ul>,
  li:          ({ children }) => <li style={{ margin: '3px 0' }}>{children}</li>,
  h1:          ({ children }) => <h1 style={{ fontSize: '1.15em', fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", margin: '16px 0 6px', color: 'var(--text-primary)' }}>{children}</h1>,
  h2:          ({ children }) => <h2 style={{ fontSize: '1.05em', fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", margin: '14px 0 5px', color: 'var(--text-primary)' }}>{children}</h2>,
  h3:          ({ children }) => <h3 style={{ fontSize: '1em',    fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif", margin: '12px 0 4px', color: 'var(--text-primary)' }}>{children}</h3>,
  blockquote:  ({ children }) => <blockquote style={{ borderLeft: '3px solid var(--amber)', margin: '10px 0', paddingLeft: '14px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>{children}</blockquote>,
  hr:          ()              => <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '14px 0' }} />,
};

// ─── Hexagonal bot avatar ──────────────────────────────────────────────────────
// Distinctive alternative to the generic robot/circle icon.
const HexAvatar = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ flexShrink: 0 }}>
    <path d="M14 2L24.66 8.25V20.75L14 27L3.34 20.75V8.25L14 2Z"
      fill="var(--amber-soft)" stroke="var(--amber)" strokeWidth="1.4" />
    {/* Mini sparkle inside hex */}
    <path d="M14 8.5l1.15 3.9a1.8 1.8 0 001.2 1.2L20 14.6l-3.65.7a1.8 1.8 0 00-1.35 1.2L14 20.5l-1-3.6a1.8 1.8 0 00-1.35-1.35L8 14.6l3.5-1a1.8 1.8 0 001.35-1.2L14 8.5z"
      fill="var(--amber)" />
  </svg>
);

// ─── Typing animation ──────────────────────────────────────────────────────────
const TypingDots = () => (
  <div style={{ display: 'flex', gap: '4px', paddingTop: '2px' }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: 'var(--amber)',
        animation: `eduDot 1.3s ease-in-out infinite ${i * 0.18}s`,
      }} />
    ))}
  </div>
);

// ─── User message — amber gradient pill, right-aligned ─────────────────────────
const UserBubble = ({ content }) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px',
    animation: 'eduIn 0.22s cubic-bezier(0.16,1,0.3,1) both' }}>
    <div style={{
      maxWidth: '76%',
      background: 'linear-gradient(135deg, var(--amber) 0%, var(--amber-warm) 100%)',
      color: '#fff',
      borderRadius: '20px 20px 4px 20px',
      padding: '11px 17px',
      fontSize: '14px',
      lineHeight: 1.65,
      whiteSpace: 'pre-wrap',
      boxShadow: '0 3px 14px rgba(245,158,11,0.22)',
      fontFamily: "'Be Vietnam Pro', sans-serif",
    }}>
      {content}
    </div>
  </div>
);

// ─── AI message — typographic, no bubble ──────────────────────────────────────
// The asymmetric design is the key differentiator: user messages = inputs (compact bubble),
// AI messages = content to read (typeset text like a tutor's notes on paper).
const AIResponse = ({ content, streaming = false }) => (
  <div style={{ display: 'flex', gap: '11px', marginBottom: '22px',
    animation: streaming ? 'none' : 'eduIn 0.28s cubic-bezier(0.16,1,0.3,1) both' }}>
    <div style={{ paddingTop: '1px' }}>
      <HexAvatar />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      {/* "EduBot" label — tiny, uppercase, amber, monospace feel */}
      <div style={{
        fontSize: '10px', fontWeight: 700, letterSpacing: '0.11em',
        textTransform: 'uppercase', color: 'var(--amber)',
        marginBottom: '7px',
        fontFamily: "'Space Grotesk', sans-serif",
      }}>
        EduBot
      </div>
      {content ? (
        <div className="prose prose-sm max-w-none" style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
          <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={MD}>
            {content}
          </ReactMarkdown>
          {streaming && (
            <span style={{
              display: 'inline-block', width: '2px', height: '14px',
              background: 'var(--amber)', verticalAlign: 'text-bottom',
              marginLeft: '2px', animation: 'eduBlink 0.9s ease-in-out infinite',
            }} />
          )}
        </div>
      ) : (
        <TypingDots />
      )}
    </div>
  </div>
);

// ─── Suggestion card ──────────────────────────────────────────────────────────
const SuggestionCard = ({ text, emoji, onClick, delay }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '11px 15px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      fontSize: '13px', color: 'var(--text-secondary)',
      cursor: 'pointer', textAlign: 'left', width: '100%',
      transition: 'all 0.16s',
      fontFamily: "'Be Vietnam Pro', sans-serif",
      animation: `eduIn 0.35s cubic-bezier(0.16,1,0.3,1) ${delay}s both`,
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = 'var(--amber)';
      e.currentTarget.style.color = 'var(--text-primary)';
      e.currentTarget.style.background = 'var(--amber-soft)';
      e.currentTarget.style.transform = 'translateX(3px)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'var(--border)';
      e.currentTarget.style.color = 'var(--text-secondary)';
      e.currentTarget.style.background = 'var(--bg-card)';
      e.currentTarget.style.transform = 'none';
    }}
  >
    <span style={{ fontSize: '16px', lineHeight: 1 }}>{emoji}</span>
    <span>{text}</span>
    <svg viewBox="0 0 16 16" fill="none" style={{ width: '12px', height: '12px', marginLeft: 'auto', opacity: 0.35, flexShrink: 0 }}>
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
);

// ─── Empty state ──────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  { emoji: '📐', text: 'Giải thích phương trình bậc 2' },
  { emoji: '📏', text: 'Định lý Pythagorean là gì?' },
  { emoji: '🎯', text: 'Tôi cần ôn tập những gì?' },
];

const EmptyState = ({ onSuggestionClick }) => (
  <div style={{
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '32px 24px', gap: '0',
  }}>
    {/* Concentric pulsing rings — the visual centrepiece of the empty state */}
    <div style={{ position: 'relative', width: '72px', height: '72px', marginBottom: '28px' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position: 'absolute',
          inset: `-${(i + 1) * 14}px`,
          borderRadius: '50%',
          border: '1.5px solid var(--amber)',
          opacity: 0,
          animation: `eduRing 3s ease-out infinite ${i}s`,
        }} />
      ))}
      <div style={{
        width: '72px', height: '72px', borderRadius: '50%',
        background: 'var(--amber-soft)',
        border: '2px solid var(--amber)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 28px rgba(245,158,11,0.15)',
        animation: 'eduFadeIn 0.5s ease-out both',
      }}>
        <svg viewBox="0 0 24 24" fill="none" style={{ width: '34px', height: '34px', color: 'var(--amber)' }}>
          <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>

    <h3 style={{
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 700, fontSize: '18px',
      color: 'var(--text-primary)',
      marginBottom: '8px', textAlign: 'center',
      animation: 'eduFadeIn 0.5s 0.1s ease-out both',
    }}>
      EduBot sẵn sàng hỗ trợ
    </h3>
    <p style={{
      fontSize: '13px', color: 'var(--text-muted)',
      marginBottom: '28px', textAlign: 'center',
      maxWidth: '260px', lineHeight: 1.65,
      animation: 'eduFadeIn 0.5s 0.15s ease-out both',
    }}>
      Hỏi bất kỳ điều gì về toán học, bài học hoặc bài tập của bạn
    </p>

    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '310px' }}>
      {SUGGESTIONS.map((s, i) => (
        <SuggestionCard
          key={s.text}
          emoji={s.emoji}
          text={s.text}
          delay={0.2 + i * 0.08}
          onClick={() => onSuggestionClick?.(s.text)}
        />
      ))}
    </div>

    {/* CSS keyframes injected once per render */}
    <style>{`
      @keyframes eduRing {
        0%   { transform: scale(1); opacity: 0.55; }
        100% { transform: scale(2.2); opacity: 0; }
      }
      @keyframes eduFadeIn {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  </div>
);

// ─── ChatWindow ────────────────────────────────────────────────────────────────

/**
 * Props:
 *  messages          – [{role, content}]
 *  streamingText     – string (AI text being built live)
 *  isStreaming       – boolean
 *  onSuggestionClick – (text) => void
 */
const ChatWindow = ({ messages, streamingText, isStreaming, onSuggestionClick }) => {
  const bottomRef = useRef(null);
  const isEmpty   = messages.length === 0 && !isStreaming;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      overscrollBehavior: 'contain',
      scrollbarWidth: 'thin',
      // Graph-paper grid — a subtle nod to the math-tutor context.
      // Using 2 crossing linear-gradients at the amber hue so it adapts
      // gracefully in both light and dark modes.
      backgroundImage: [
        'linear-gradient(rgba(245,158,11,0.035) 1px, transparent 1px)',
        'linear-gradient(90deg, rgba(245,158,11,0.035) 1px, transparent 1px)',
      ].join(', '),
      backgroundSize: '28px 28px',
    }}>
      {isEmpty ? (
        <EmptyState onSuggestionClick={onSuggestionClick} />
      ) : (
        <div style={{ padding: '20px 16px 8px', maxWidth: '820px', margin: '0 auto', width: '100%' }}>
          {messages.map((msg, i) =>
            msg.role === 'user'
              ? <UserBubble   key={i} content={msg.content} />
              : <AIResponse   key={i} content={msg.content} />
          )}
          {isStreaming && <AIResponse content={streamingText} streaming />}
          <div ref={bottomRef} style={{ height: '12px' }} />
        </div>
      )}

      {/* Global keyframes — defined here, used by all sub-components */}
      <style>{`
        @keyframes eduIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes eduDot {
          0%, 60%, 100% { transform: translateY(0);   opacity: 0.6; }
          30%            { transform: translateY(-6px); opacity: 1;   }
        }
        @keyframes eduBlink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ChatWindow;
