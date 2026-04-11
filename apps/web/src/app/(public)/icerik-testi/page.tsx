'use client';

import { useState } from 'react';
import Link from 'next/link';
import QuizResult, { QuizResultData } from '@/components/quiz/QuizResult';

// === Types ===

interface Question {
  id: string;
  question: string;
  options: { value: string; label: string }[];
  correct: string;
  explanation: string;
  topic: string;
}

// === Questions ===

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    question: 'Niacinamide (Vitamin B3) ne işe yarar?',
    options: [
      { value: 'a', label: 'Güneşten koruma' },
      { value: 'b', label: 'Gözenek küçültme ve leke giderme' },
      { value: 'c', label: 'Saç güçlendirme' },
      { value: 'd', label: 'Kas gevşetme' },
    ],
    correct: 'b',
    explanation: 'Niacinamide gözenekleri sıkıştıran, leke ve ton eşitsizliğini azaltan güçlü bir aktiftir.',
    topic: 'Aktif Maddeler',
  },
  {
    id: 'q2',
    question: 'Retinol ile hangisi birlikte kullanılMAMALI?',
    options: [
      { value: 'a', label: 'Hyaluronik Asit' },
      { value: 'b', label: 'Ceramide' },
      { value: 'c', label: 'AHA/BHA' },
      { value: 'd', label: 'Niacinamide' },
    ],
    correct: 'c',
    explanation: 'Retinol + AHA/BHA birlikte aşırı eksfoliasyona ve tahrişe neden olabilir. Farklı saatlerde kullanın.',
    topic: 'İçerik Etkileşimleri',
  },
  {
    id: 'q3',
    question: 'SPF 30 güneş ışınlarının yüzde kaçını engeller?',
    options: [
      { value: 'a', label: '%30' },
      { value: 'b', label: '%97' },
      { value: 'c', label: '%50' },
      { value: 'd', label: '%100' },
    ],
    correct: 'b',
    explanation: 'SPF 30, UVB ışınlarının %97\'sini engeller. SPF 50 ise %98. Aradaki fark sanıldığından küçüktür.',
    topic: 'Güneş Koruma',
  },
  {
    id: 'q4',
    question: 'Hyaluronik Asit ne yapar?',
    options: [
      { value: 'a', label: 'Yağ üretimini kontrol eder' },
      { value: 'b', label: 'Ağırlığının 1000 katı su tutar' },
      { value: 'c', label: 'Kollajen üretimini artırır' },
      { value: 'd', label: 'Ölü hücreleri yok eder' },
    ],
    correct: 'b',
    explanation: 'Hyaluronik Asit güçlü bir nemlendiricidir. Ağırlığının 1000 katına kadar su tutabilir.',
    topic: 'Aktif Maddeler',
  },
  {
    id: 'q5',
    question: 'Hangisi bir AHA (Alpha Hydroxy Acid) değildir?',
    options: [
      { value: 'a', label: 'Glikolik Asit' },
      { value: 'b', label: 'Laktik Asit' },
      { value: 'c', label: 'Salisilik Asit' },
      { value: 'd', label: 'Mandelik Asit' },
    ],
    correct: 'c',
    explanation: 'Salisilik Asit bir BHA\'dır (Beta Hydroxy Acid). Yağ çözünürlüğü sayesinde gözeneklerin içine nüfuz eder.',
    topic: 'Asitler',
  },
  {
    id: 'q6',
    question: 'Cilt bariyerinin ana yapıtaşı hangisidir?',
    options: [
      { value: 'a', label: 'Retinol' },
      { value: 'b', label: 'Ceramide' },
      { value: 'c', label: 'Vitamin C' },
      { value: 'd', label: 'Benzoyl Peroxide' },
    ],
    correct: 'b',
    explanation: 'Ceramideler cilt bariyerinin %50\'sini oluşturur. Bariyer hasar gördüğünde ceramide takviyesi onarımda yardımcı olur.',
    topic: 'Cilt Bariyeri',
  },
  {
    id: 'q7',
    question: 'Vitamin C serumları için ideal pH aralığı nedir?',
    options: [
      { value: 'a', label: 'pH 2.5-3.5' },
      { value: 'b', label: 'pH 5.5-6.5' },
      { value: 'c', label: 'pH 7.0 (nötr)' },
      { value: 'd', label: 'pH 8.0-9.0' },
    ],
    correct: 'a',
    explanation: 'L-Askorbik Asit formu pH 2.5-3.5 arasında en etkilidir. Daha yüksek pH\'da stabilite ve etkinlik düşer.',
    topic: 'Asitler',
  },
  {
    id: 'q8',
    question: 'Hangisi ciltte kollajen üretimini ARTTIRIR?',
    options: [
      { value: 'a', label: 'Mineral Oil' },
      { value: 'b', label: 'Retinol (Vitamin A)' },
      { value: 'c', label: 'Parfüm' },
      { value: 'd', label: 'Silikon' },
    ],
    correct: 'b',
    explanation: 'Retinol hücre yenilenmesini hızlandırır ve kollajen sentezini uyarır. Anti-aging için altın standart.',
    topic: 'Anti-Aging',
  },
  {
    id: 'q9',
    question: '"Fragrance-free" ve "unscented" aynı anlama gelir mi?',
    options: [
      { value: 'a', label: 'Evet, aynı şey' },
      { value: 'b', label: 'Hayır — unscented maskeleme kokusu içerebilir' },
      { value: 'c', label: 'Hayır — fragrance-free daha tehlikeli' },
      { value: 'd', label: 'Sadece Avrupa\'da farklı' },
    ],
    correct: 'b',
    explanation: '"Unscented" ürünler kokuyu nötralize eden kimyasallar içerebilir. "Fragrance-free" hiç koku bileşeni içermez.',
    topic: 'Güvenlik',
  },
  {
    id: 'q10',
    question: 'Hangi vitamin güneş ışığıyla ciltte sentezlenir?',
    options: [
      { value: 'a', label: 'Vitamin A' },
      { value: 'b', label: 'Vitamin C' },
      { value: 'c', label: 'Vitamin D' },
      { value: 'd', label: 'Vitamin E' },
    ],
    correct: 'c',
    explanation: 'UVB ışınları ciltte D vitamini sentezini tetikler. Güneş kremi kullanımı D vitamini üretimini azaltabilir — takviye önemlidir.',
    topic: 'Vitaminler',
  },
];

// === Component ===

export default function IngredientQuizPage() {
  const [mode, setMode] = useState<'intro' | 'quick' | 'detailed'>('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);

  const activeQuestions = mode === 'quick' ? QUESTIONS.slice(0, 5) : QUESTIONS;
  const q = activeQuestions[currentQ];
  const totalQ = activeQuestions.length;

  const handleAnswer = (value: string) => {
    if (showExplanation) return;
    setUserAnswers((prev) => ({ ...prev, [q.id]: value }));
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentQ === totalQ - 1) {
      setFinished(true);
    } else {
      setCurrentQ((c) => c + 1);
    }
  };

  if (finished) {
    const correct = activeQuestions.filter((qq) => userAnswers[qq.id] === qq.correct).length;
    const pct = Math.round((correct / totalQ) * 100);

    const wrongTopics = activeQuestions
      .filter((qq) => userAnswers[qq.id] !== qq.correct)
      .map((qq) => qq.topic);
    const uniqueWrongTopics = [...new Set(wrongTopics)];

    let level: string;
    let levelMessage: string;
    if (pct >= 90) { level = 'UZMAN'; levelMessage = 'Sen bu işi biliyorsun! Neredeyse bize iş kalmadı.'; }
    else if (pct >= 70) { level = 'İLERİ'; levelMessage = 'Güzel bilgi birikimin var. Birkaç detayı tamamla.'; }
    else if (pct >= 50) { level = 'ORTA'; levelMessage = 'İyi başlangıç! Biraz daha öğrenmeye devam.'; }
    else { level = 'BAŞLANGIÇ'; levelMessage = 'Endişelenme, herkes bir yerden başlar. İşte sana özel okuma listesi:'; }

    const resultData: QuizResultData = {
      headline: `Bilgi Seviyen: ${level}`,
      subheadline: levelMessage,
      score: { value: correct, max: totalQ, label: `%${pct} başarı` },
      sections: [
        ...(uniqueWrongTopics.length > 0
          ? [{
              title: 'Eksik Kaldığın Konular',
              icon: 'menu_book',
              items: uniqueWrongTopics.map((t) => ({
                label: t,
                detail: 'Bu konuda rehberimizi oku',
                type: 'negative' as const,
              })),
            }]
          : []),
        {
          title: 'Doğru Bildiğin Konular',
          icon: 'check_circle',
          items: [...new Set(
            activeQuestions.filter((qq) => userAnswers[qq.id] === qq.correct).map((qq) => qq.topic),
          )].map((t) => ({
            label: t,
            type: 'positive' as const,
          })),
        },
      ],
      cta: { label: 'Rehberleri Oku', href: '/rehber' },
      secondaryCta: { label: 'Tekrar Dene', href: '/icerik-testi' },
      shareText: `REVELA İçerik Bilgi Testi: ${correct}/${totalQ} doğru! Seviye: ${level}`,
    };

    return (
      <div className="curator-section max-w-[1200px] mx-auto">
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
          <span className="text-outline">/</span>
          <span className="text-on-surface font-medium">İçerik Testi</span>
        </nav>
        <QuizResult data={resultData} />
      </div>
    );
  }

  const selected = userAnswers[q.id];
  const isCorrect = selected === q.correct;
  const pctDone = Math.round(((currentQ + 1) / totalQ) * 100);

  if (mode === 'intro') {
    return (
      <div className="curator-section max-w-[1200px] mx-auto">
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
          <span className="text-outline">/</span>
          <span className="text-on-surface font-medium">İçerik Testi</span>
        </nav>

        <div className="max-w-2xl mx-auto text-center py-8">
          <span className="material-icon text-primary mb-4 block" style={{ fontSize: '64px' }} aria-hidden="true">quiz</span>
          <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface mb-2">İÇERİK BİLGİ TESTİ</h1>
          <p className="text-on-surface-variant text-sm mb-10">Ne kadar biliyorsun? Hazırlan, sınav var.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            <button onClick={() => setMode('quick')} className="curator-card p-6 text-left group hover:border-primary/30 transition-all">
              <span className="material-icon text-primary text-[28px] mb-3 block" aria-hidden="true">bolt</span>
              <p className="font-semibold text-on-surface">Hızlı Test</p>
              <p className="text-xs text-on-surface-variant mt-1">5 soru, ~2 dakika</p>
              <p className="text-xs text-outline mt-2">Anında sonuç al</p>
            </button>
            <button onClick={() => setMode('detailed')} className="curator-card p-6 text-left group hover:border-primary/30 transition-all">
              <span className="material-icon text-primary text-[28px] mb-3 block" aria-hidden="true">science</span>
              <p className="font-semibold text-on-surface">Detaylı Test</p>
              <p className="text-xs text-on-surface-variant mt-1">10 soru, ~4 dakika</p>
              <p className="text-xs text-outline mt-2">Kapsamlı analiz</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="curator-section max-w-[1200px] mx-auto">
      <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
        <span className="text-outline">/</span>
        <span className="text-on-surface font-medium">İçerik Testi</span>
      </nav>

      {currentQ === 0 && !showExplanation && (
        <div className="text-center mb-12">
          <p className="label-caps text-outline mb-3 tracking-[0.4em]">Bilgi Testi</p>
          <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface mb-3">
            İÇERİK BİLGİ TESTİ
          </h1>
          <p className="text-on-surface-variant max-w-md mx-auto">
            {mode === 'quick' ? '5 soruda kozmetik bilgini ölç.' : '10 soruda kozmetik bilgini ölç.'}
          </p>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-on-surface-variant">Soru {currentQ + 1} / {totalQ}</span>
            <span className="text-xs text-on-surface-variant">%{pctDone}</span>
          </div>
          <div className="h-1 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${pctDone}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <span className="label-caps text-outline mb-2 block">{q.topic}</span>
          <h2 className="text-xl lg:text-2xl font-bold text-on-surface">{q.question}</h2>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {q.options.map((opt) => {
            let borderClass = 'border-outline-variant/20 hover:border-outline-variant/50';
            let bgClass = 'bg-surface';

            if (showExplanation) {
              if (opt.value === q.correct) {
                borderClass = 'border-score-high';
                bgClass = 'bg-score-high/5';
              } else if (opt.value === selected && !isCorrect) {
                borderClass = 'border-score-low';
                bgClass = 'bg-score-low/5';
              } else {
                borderClass = 'border-outline-variant/10';
                bgClass = 'bg-surface opacity-50';
              }
            } else if (opt.value === selected) {
              borderClass = 'border-primary';
              bgClass = 'bg-primary/5';
            }

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleAnswer(opt.value)}
                disabled={showExplanation}
                className={`w-full text-left p-4 rounded-sm border transition-all duration-200 ${borderClass} ${bgClass}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full border-2 border-outline-variant/30 flex items-center justify-center text-sm font-bold text-on-surface-variant shrink-0">
                    {opt.value.toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-on-surface">{opt.label}</span>
                  {showExplanation && opt.value === q.correct && (
                    <span className="material-icon text-score-high ml-auto" aria-hidden="true">check_circle</span>
                  )}
                  {showExplanation && opt.value === selected && !isCorrect && (
                    <span className="material-icon text-score-low ml-auto" aria-hidden="true">cancel</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className={`p-4 rounded-sm border mb-8 ${isCorrect ? 'border-score-high/30 bg-score-high/5' : 'border-score-low/30 bg-score-low/5'}`}>
            <p className={`text-sm font-bold mb-1 ${isCorrect ? 'text-score-high' : 'text-score-low'}`}>
              {isCorrect ? 'Doğru!' : 'Yanlış!'}
            </p>
            <p className="text-sm text-on-surface-variant">{q.explanation}</p>
          </div>
        )}

        {/* Next */}
        {showExplanation && (
          <div className="text-right">
            <button
              type="button"
              onClick={handleNext}
              className="curator-btn-primary text-sm px-8 py-3"
            >
              {currentQ === totalQ - 1 ? 'Sonuçları Gör' : 'Sonraki Soru'}
              <span className="material-icon material-icon-sm ml-1" aria-hidden="true">arrow_forward</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
