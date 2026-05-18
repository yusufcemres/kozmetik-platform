'use client';

import { useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api';

/**
 * AI Cilt Danışmanı sohbet widget'ı (Faz 2 #5 MVP).
 *
 * - Tek-shot mesaj (streaming Faz 3'te)
 * - Frontend Premium feature (`ai_chat`, 49 TL/ay) — PaywallOverlay ile sarılı
 *   render edilmesi beklenir
 * - KVKK: sohbet metni saklamadan dön (backend log scope=ai_chat)
 */

export interface AICoachWidgetProps {
  analysisId: number;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  ts: number;
}

const SUGGESTED_QUESTIONS = [
  'Skorum gözeneklere doğru yüksek, nasıl bir tonik önerirsin?',
  'Sabah ve akşam rutinim nasıl olmalı?',
  'Kırışıklık için retinol mu peptit mi başlasam?',
  'Hassas cildim için hangi aktiflerden kaçınmalıyım?',
];

export function AICoachWidget({ analysisId }: AICoachWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (question: string) => {
    const trimmed = question.trim();
    if (trimmed.length < 3) {
      setError('Soru en az 3 karakter olmalı');
      return;
    }
    setError(null);
    setLoading(true);
    const userMsg: Message = { role: 'user', text: trimmed, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    try {
      // Multi-turn: önceki mesajları history olarak yolla (max 10 turn)
      const history = messages
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.text }));

      const res = await apiFetch<{ answer: string; model: string }>(
        `/skin-analysis/${analysisId}/coach`,
        {
          method: 'POST',
          body: JSON.stringify({ question: trimmed, history }),
        },
      );
      const botMsg: Message = { role: 'assistant', text: res.answer, ts: Date.now() };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const msg =
        err instanceof ApiError && err.status === 503
          ? 'AI Danışman geçici olarak yanıt vermiyor. Birkaç dakika sonra dene.'
          : err?.message || 'Soru gönderilemedi';
      setError(msg);
      // Hata olunca user message'ı geri al (UX retry için)
      setMessages((prev) => prev.filter((m) => m !== userMsg));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loading) send(input);
  };

  return (
    <div className="curator-card p-5">
      <header className="flex items-start gap-3 mb-4 pb-3 border-b border-outline-variant/20">
        <span className="material-icon text-primary text-[24px] shrink-0" aria-hidden="true">smart_toy</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-on-surface">AI Cilt Danışmanı</h3>
          <p className="text-[10px] text-on-surface-variant leading-relaxed">
            Analiz skorlarına özel cilt rutini sorgusu. Tıbbi tanı değil — ciddi sorunlar için dermatologa danış.
          </p>
        </div>
      </header>

      {/* Mesaj akışı */}
      {messages.length === 0 ? (
        <div className="space-y-2 mb-4">
          <p className="text-[10px] uppercase tracking-wider text-outline font-semibold">Önerilen sorular</p>
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              disabled={loading}
              className="block w-full text-left text-xs text-on-surface bg-surface-container-low hover:bg-surface-container px-3 py-2 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {q}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-on-surface border border-outline-variant/20'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-xs text-on-surface-variant">
                <span className="inline-flex gap-1">
                  <span className="animate-pulse">●</span>
                  <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>●</span>
                  <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>●</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="text-xs text-error mb-3 flex items-center gap-1">
          <span className="material-icon text-[14px]" aria-hidden="true">error_outline</span>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Cilt rutinin hakkında bir soru sor…"
          disabled={loading}
          maxLength={500}
          className="flex-1 border border-outline-variant/40 rounded-sm px-3 py-2 text-xs bg-surface focus:border-primary focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || input.trim().length < 3}
          className="curator-btn-primary text-xs px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Gönder
        </button>
      </form>

      <p className="text-[10px] text-outline mt-2 leading-relaxed">
        Bu yanıtlar AI tarafından üretilir (Claude Sonnet 4.6) ve sadece bilgilendirme amaçlıdır.
      </p>
    </div>
  );
}
