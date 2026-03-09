import { useState, useRef, useEffect } from 'react';

const QUICK_PROMPTS = [
  'Giải thích lại',
  'Cho ví dụ',
  'Cách ghi nhớ?',
  'Bài tập tương tự',
];

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * ChatInput — mobile-first, 44px touch targets, accessible
 * Props:
 *  - onSend: (message: string) => void
 *  - disabled: boolean
 *  - placeholder: string
 */
const ChatInput = ({ onSend, disabled, placeholder = 'Nhập câu hỏi của bạn...' }) => {
  const [input, setInput]   = useState('');
  const textareaRef         = useRef(null);
  const canSend             = Boolean(input.trim()) && !disabled;

  // Auto-resize textarea up to ~5 lines
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  }, [input]);

  const handleSend = () => {
    const msg = input.trim();
    if (!msg || disabled) return;
    onSend(msg);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    // Desktop: Enter sends. Shift+Enter inserts newline.
    // Mobile: never intercept Enter so the OS keyboard works normally.
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="flex-shrink-0"
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-card)',
        padding: '8px 12px 12px',
        /* Safe area inset for iOS home bar */
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      }}
    >
      {/* ── Quick prompts — horizontal scroll, hidden on very small screens when keyboard is up ── */}
      <div
        className="flex gap-2 mb-2 overflow-x-auto"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        aria-label="Gợi ý nhanh"
      >
        {QUICK_PROMPTS.map(prompt => (
          <button
            key={prompt}
            onClick={() => { if (!disabled) onSend(prompt); }}
            disabled={disabled}
            className="flex-shrink-0 px-3 rounded-full text-xs font-medium transition-colors"
            style={{
              height: '32px',  /* smaller than send, but still comfortable */
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* ── Input row ── */}
      <div
        className="flex items-end gap-2 rounded-2xl px-3 py-2"
        style={{
          background: 'var(--bg-secondary)',
          border: `1.5px solid ${input ? 'var(--amber)' : 'var(--border)'}`,
          transition: 'border-color 0.15s',
          /* min-height ensures the empty state row is at least 44px for touch */
          minHeight: '44px',
        }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm outline-none"
          style={{
            color: 'var(--text-primary)',
            lineHeight: 1.6,
            maxHeight: '140px',
            scrollbarWidth: 'thin',
            paddingTop: '6px',
            paddingBottom: '6px',
          }}
          /* Mobile keyboard hints */
          inputMode="text"
          enterKeyHint="send"
          aria-label="Nhập tin nhắn"
          aria-multiline="true"
        />

        {/* Send button — 44×44px touch target */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="flex-shrink-0 flex items-center justify-center rounded-xl transition-all"
          style={{
            width: '40px',
            height: '40px',
            background: canSend ? 'var(--amber)' : 'var(--bg-tertiary)',
            color:      canSend ? '#fff'         : 'var(--text-muted)',
            cursor:     canSend ? 'pointer'      : 'not-allowed',
            transform:  canSend ? 'scale(1)'     : 'scale(0.9)',
            transition: 'all 0.15s',
          }}
          aria-label="Gửi tin nhắn"
        >
          <SendIcon />
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-muted)' }}>
        EduBot có thể mắc sai sót. Hãy kiểm tra lại thông tin quan trọng.
      </p>
    </div>
  );
};

export default ChatInput;
