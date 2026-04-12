'use client';

import { useState } from 'react';

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
  label?: string;
}

export default function ShareButton({ title, text, url, className, label }: ShareButtonProps) {
  const [toast, setToast] = useState<string | null>(null);

  const handleShare = async () => {
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const shareText = text || `${title} — REVELA'da incele`;

    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ title, text: shareText, url: shareUrl });
        return;
      } catch {
        // user cancelled or not supported — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText}: ${shareUrl}`);
      setToast('Bağlantı kopyalandı');
      setTimeout(() => setToast(null), 2000);
    } catch {
      setToast('Paylaşılamadı');
      setTimeout(() => setToast(null), 2000);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleShare}
        className={className || 'curator-btn-outline px-4 py-2 text-xs flex items-center gap-1.5'}
        aria-label="Paylaş"
      >
        <span className="material-icon material-icon-sm" aria-hidden="true">
          ios_share
        </span>
        {label || 'Paylaş'}
      </button>
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-on-surface text-surface px-4 py-2 rounded-sm text-xs label-caps z-50 shadow-lg"
        >
          {toast}
        </div>
      )}
    </>
  );
}
