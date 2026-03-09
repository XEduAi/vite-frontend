import { useState, useRef, useEffect } from 'react';

const QUICK_PROMPTS = [
  { icon: '↩', label: 'Giải thích lại' },
  { icon: '◎', label: 'Cho ví dụ' },
  { icon: '✦', label: 'Cách ghi nhớ?' },
  { icon: '≡', label: 'Bài tập tương tự' },
  { icon: '◐', label: 'Đơn giản hơn' },
];

/**
 * ChatInput — floats at the bottom, amber focus glow, 44px touch targets
 * Props: onSend, disabled, placeholder
 */
const ChatInput = ({ onSend, disabled, placeholder = 'Nhập câu hỏi của bạn...' }) => {
  const [input, setInput]     = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef           = useRef(null);
  const canSend               = Boolean(input.trim()) && !disabled;

  // Auto-resize textarea up to ~5 lines
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 144) + 'px';
  }, [input]);

  const doSend = () => {
    const msg = input.trim();
    if (!msg || disabled) return;
    onSend(msg);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const onKeyDown = (e) => {
    // Desktop: Enter sends. Mobile: let the OS handle Enter (shows send button in keyboard).
    if (e.key === 'Enter' && !e.shiftKey && !window.matchMedia('(pointer: coarse)').matches) {
      e.preventDefault();
      doSend();
    }
  };

  return (
    <div style={{
      flexShrink: 0,
      padding: '8px 12px',
      paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border)',
    }}>

      {/* ── Quick-prompt chips — horizontal scroll, no scrollbar ── */}
      <div style={{
        display: 'flex', gap: '6px', marginBottom: '8px',
        overflowX: 'auto', scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}>
        {QUICK_PROMPTS.map(p => (
          <button
            key={p.label}
            onClick={() => !disabled && onSend(p.label)}
            disabled={disabled}
            style={{
              flexShrink: 0,
              height: '30px', padding: '0 11px',
              display: 'flex', alignItems: 'center', gap: '5px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '100px',
              fontSize: '12px',
              color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
              whiteSpace: 'nowrap',
              transition: 'border-color 0.15s, color 0.15s',
              fontFamily: "'Be Vietnam Pro', sans-serif",
            }}
            onMouseEnter={e => {
              if (!disabled) {
                e.currentTarget.style.borderColor = 'var(--amber)';
                e.currentTarget.style.color = 'var(--amber)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <span style={{ fontSize: '10px', opacity: 0.65, lineHeight: 1 }}>{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Text input row ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: '8px',
        background: 'var(--bg-secondary)',
        border: `1.5px solid ${focused ? 'var(--amber)' : 'var(--border)'}`,
        borderRadius: '16px',
        padding: '10px 10px 10px 14px',
        minHeight: '48px',
        transition: 'border-color 0.18s, box-shadow 0.18s',
        // Amber glow ring on focus — subtle but distinctive
        boxShadow: focused ? '0 0 0 3px rgba(245,158,11,0.1)' : 'none',
      }}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          style={{
            flex: 1, resize: 'none',
            background: 'transparent', border: 'none', outline: 'none',
            fontSize: '14px', color: 'var(--text-primary)',
            lineHeight: 1.6, maxHeight: '144px',
            scrollbarWidth: 'thin', paddingTop: '2px',
            fontFamily: "'Be Vietnam Pro', sans-serif",
          }}
          inputMode="text"
          enterKeyHint="send"
          aria-label="Nhập tin nhắn"
        />

        {/* Send button — circular, 40px, glows amber when active */}
        <button
          onClick={doSend}
          disabled={!canSend}
          style={{
            flexShrink: 0,
            width: '38px', height: '38px', borderRadius: '50%',
            border: 'none',
            background: canSend
              ? 'linear-gradient(135deg, var(--amber) 0%, var(--amber-warm) 100%)'
              : 'var(--bg-card)',
            color: canSend ? '#fff' : 'var(--text-muted)',
            cursor: canSend ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: canSend ? 'scale(1)' : 'scale(0.88)',
            boxShadow: canSend ? '0 2px 14px rgba(245,158,11,0.35)' : 'none',
            transition: 'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
          }}
          aria-label="Gửi"
        >
          {/* Arrow-right icon — cleaner than paper plane for a "send" action */}
          <svg viewBox="0 0 18 18" fill="none" style={{ width: '16px', height: '16px' }}>
            <path d="M3.5 9h11M10 4.5L14.5 9 10 13.5"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Disclaimer */}
      <p style={{
        fontSize: '11px', marginTop: '7px', textAlign: 'center',
        color: 'var(--text-muted)', lineHeight: 1.4,
        fontFamily: "'Be Vietnam Pro', sans-serif",
      }}>
        EduBot có thể mắc sai sót · Kiểm tra lại thông tin quan trọng
      </p>
    </div>
  );
};

export default ChatInput;
