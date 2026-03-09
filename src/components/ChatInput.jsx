import { useState, useRef, useEffect } from 'react';

const QUICK_PROMPTS = [
  'Giải thích lại cho tôi',
  'Cho ví dụ cụ thể',
  'Cách ghi nhớ dễ hơn?',
  'Bài tập tương tự'
];

/**
 * ChatInput — Input + send button + quick prompts
 * Props:
 *  - onSend: (message: string) => void
 *  - disabled: boolean
 *  - placeholder: string
 */
const ChatInput = ({ onSend, disabled, placeholder = 'Nhập câu hỏi của bạn...' }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [input]);

  const handleSend = () => {
    const msg = input.trim();
    if (!msg || disabled) return;
    onSend(msg);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="border-t"
      style={{ borderColor: 'var(--border)', padding: '12px 16px', background: 'var(--bg-card)' }}
    >
      {/* Quick prompts */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {QUICK_PROMPTS.map(prompt => (
          <button
            key={prompt}
            onClick={() => !disabled && onSend(prompt)}
            disabled={disabled}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1
            }}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div
        className="flex items-end gap-3 rounded-2xl px-4 py-3"
        style={{
          background: 'var(--bg-secondary)',
          border: '1.5px solid',
          borderColor: input ? 'var(--amber)' : 'var(--border)',
          transition: 'border-color 0.2s'
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
            maxHeight: '120px',
            scrollbarWidth: 'thin'
          }}
        />

        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all"
          style={{
            background: disabled || !input.trim() ? 'var(--bg-tertiary)' : 'var(--amber)',
            color: disabled || !input.trim() ? 'var(--text-muted)' : '#fff',
            cursor: disabled || !input.trim() ? 'not-allowed' : 'pointer',
            transform: !disabled && input.trim() ? 'scale(1)' : 'scale(0.9)',
            transition: 'all 0.15s'
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-muted)' }}>
        EduBot có thể mắc sai sót. Hãy kiểm tra lại thông tin quan trọng.
      </p>
    </div>
  );
};

export default ChatInput;
