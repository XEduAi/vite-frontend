import { useState } from 'react';

const ShareButtons = ({ title = '', text = '', url = '' }) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || window.location.href;
  const shareText = text || title;

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      'facebook-share',
      'width=580,height=400'
    );
  };

  const shareToZalo = () => {
    window.open(
      `https://zalo.me/share?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
      'zalo-share',
      'width=580,height=400'
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = `${shareText}\n${shareUrl}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Chia s\u1EBB:</span>

      {/* Facebook */}
      <button
        onClick={shareToFacebook}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
        style={{ background: '#1877f2', color: 'white' }}
        title="Chia s\u1EBB Facebook"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </button>

      {/* Zalo */}
      <button
        onClick={shareToZalo}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
        style={{ background: '#0068ff', color: 'white' }}
        title="Chia s\u1EBB Zalo"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <text x="2" y="18" fontSize="14" fontWeight="bold" fontFamily="Arial">Z</text>
        </svg>
      </button>

      {/* Copy Link */}
      <button
        onClick={copyLink}
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
        style={{
          background: copied ? 'var(--success)' : 'rgba(0,0,0,0.08)',
          color: copied ? 'white' : 'var(--text-secondary)'
        }}
        title={copied ? '\u0110\u00E3 sao ch\u00E9p!' : 'Sao ch\u00E9p li\u00EAn k\u1EBFt'}
      >
        {copied ? (
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
          </svg>
        )}
      </button>
    </div>
  );
};

export default ShareButtons;
