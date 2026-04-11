'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface Question {
  question_id: number;
  brand_id: number;
  product_id?: number;
  category: string;
  question: string;
  answer?: string;
  status: string;
  created_at: string;
  answered_at?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  ingredient: 'İçerik',
  usage: 'Kullanım',
  side_effect: 'Yan Etki',
  price: 'Fiyat',
  production: 'Üretim',
  vegan: 'Vegan/Etik',
  general: 'Genel',
};

const QUICK_TEMPLATES = [
  'Ürünümüzde {MADDE} %{X} oranında bulunmaktadır.',
  'Teşekkür ederiz! Bu konuda detaylı bilgi web sitemizde mevcuttur.',
  'Ürünümüz dermatolog kontrolünde test edilmiştir.',
  'Bu bilgiyi şu anda paylaşamıyoruz ancak alternatif bilgi olarak şunu söyleyebiliriz:',
];

export default function BrandQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [answering, setAnswering] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('brand_token') : null;

  useEffect(() => {
    if (!token) {
      window.location.href = '/brand-portal/login';
      return;
    }
    loadQuestions();
  }, [filter, page]);

  const loadQuestions = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set('status', filter);
    params.set('page', page.toString());
    params.set('limit', '20');

    fetch(`${API_URL}/brand-portal/questions?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data.questions || []);
        setTotal(data.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleAnswer = async (questionId: number) => {
    if (!answerText.trim() || answerText.length < 20) return;
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/brand-portal/questions/${questionId}/answer`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answer: answerText }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }

      setAnswering(null);
      setAnswerText('');
      loadQuestions();
    } catch (err: any) {
      alert(err.message || 'Hata');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = questions.filter((q) => q.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Sorular</h1>
        <p className="text-sm text-on-surface-variant">
          {total} soru{pendingCount > 0 && ` · ${pendingCount} cevaplanmamış`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {[
          { key: '', label: 'Tümü' },
          { key: 'pending', label: 'Cevaplanmamış' },
          { key: 'answered', label: 'Cevaplanmış' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => {
              setFilter(f.key);
              setPage(1);
            }}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filter === f.key
                ? 'bg-primary text-on-primary border-primary'
                : 'border-outline-variant/30 text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-surface rounded-xl border border-outline-variant/30 p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant">
            forum
          </span>
          <p className="text-sm text-on-surface-variant mt-2">Soru bulunamadı.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q.question_id}
              className="bg-surface rounded-xl border border-outline-variant/30 p-5"
            >
              {/* Question header */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    q.status === 'pending'
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}
                >
                  {q.status === 'pending' ? 'Bekliyor' : 'Cevaplanmış'}
                </span>
                <span className="text-xs text-on-surface-variant">
                  {CATEGORY_LABELS[q.category] || q.category}
                </span>
                <span className="text-xs text-on-surface-variant ml-auto">
                  {new Date(q.created_at).toLocaleDateString('tr-TR')}
                </span>
              </div>

              {/* Question text */}
              <p className="text-sm text-on-surface leading-relaxed">{q.question}</p>

              {/* Answer */}
              {q.answer && (
                <div className="mt-3 p-3 bg-primary/5 rounded-lg">
                  <p className="text-xs font-medium text-primary mb-1">Yanıtınız:</p>
                  <p className="text-sm text-on-surface">{q.answer}</p>
                  {q.answered_at && (
                    <p className="text-xs text-on-surface-variant mt-1">
                      {new Date(q.answered_at).toLocaleDateString('tr-TR')}
                    </p>
                  )}
                </div>
              )}

              {/* Answer form */}
              {q.status === 'pending' && answering === q.question_id && (
                <div className="mt-4 space-y-3">
                  <div className="flex gap-2 flex-wrap">
                    {QUICK_TEMPLATES.map((t, i) => (
                      <button
                        key={i}
                        onClick={() => setAnswerText(t)}
                        className="text-xs px-2 py-1 rounded-md bg-surface-container text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        Şablon {i + 1}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Yanıtınız (en az 20 karakter)..."
                    rows={4}
                    className="w-full border border-outline-variant rounded-lg px-3 py-2.5 bg-surface-container text-on-surface text-sm placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setAnswering(null);
                        setAnswerText('');
                      }}
                      className="text-xs text-on-surface-variant hover:text-on-surface px-3 py-1.5"
                    >
                      İptal
                    </button>
                    <button
                      onClick={() => handleAnswer(q.question_id)}
                      disabled={submitting || answerText.length < 20}
                      className="bg-primary text-on-primary px-4 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-40"
                    >
                      {submitting ? 'Gönderiliyor...' : 'Yanıtla'}
                    </button>
                  </div>
                </div>
              )}

              {q.status === 'pending' && answering !== q.question_id && (
                <button
                  onClick={() => setAnswering(q.question_id)}
                  className="mt-3 text-xs text-primary hover:underline"
                >
                  Yanıtla →
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
