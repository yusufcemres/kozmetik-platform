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
    question: 'Niacinamide (Vitamin B3) ne ise yarar?',
    options: [
      { value: 'a', label: 'Gunesten koruma' },
      { value: 'b', label: 'Gozenek kucultme ve leke giderme' },
      { value: 'c', label: 'Sac guclendirme' },
      { value: 'd', label: 'Kas gevsetme' },
    ],
    correct: 'b',
    explanation: 'Niacinamide gozenekleri sikistiran, leke ve ton esitsizligini azaltan guclu bir aktiftir.',
    topic: 'Aktif Maddeler',
  },
  {
    id: 'q2',
    question: 'Retinol ile hangisi birlikte kullanilMAMALI?',
    options: [
      { value: 'a', label: 'Hyaluronik Asit' },
      { value: 'b', label: 'Ceramide' },
      { value: 'c', label: 'AHA/BHA' },
      { value: 'd', label: 'Niacinamide' },
    ],
    correct: 'c',
    explanation: 'Retinol + AHA/BHA birlikte asiri eksfoliasyona ve tahrise neden olabilir. Farkli saatlerde kullanin.',
    topic: 'Icerik Etkilesimleri',
  },
  {
    id: 'q3',
    question: 'SPF 30 gunes isinlarinin yuzde kacini engeller?',
    options: [
      { value: 'a', label: '%30' },
      { value: 'b', label: '%97' },
      { value: 'c', label: '%50' },
      { value: 'd', label: '%100' },
    ],
    correct: 'b',
    explanation: 'SPF 30, UVB isinlarinin %97\'sini engeller. SPF 50 ise %98. Aradaki fark sanildigindan kucuktur.',
    topic: 'Gunes Koruma',
  },
  {
    id: 'q4',
    question: 'Hyaluronik Asit ne yapar?',
    options: [
      { value: 'a', label: 'Yag uretimini kontrol eder' },
      { value: 'b', label: 'Agirliginin 1000 kati su tutar' },
      { value: 'c', label: 'Kollajen uretimini arttirir' },
      { value: 'd', label: 'Olup hucreleri yok eder' },
    ],
    correct: 'b',
    explanation: 'Hyaluronik Asit guclu bir nemlendiricidirr. Agirliginin 1000 katina kadar su tutabilir.',
    topic: 'Aktif Maddeler',
  },
  {
    id: 'q5',
    question: 'Hangisi bir AHA (Alpha Hydroxy Acid) degildir?',
    options: [
      { value: 'a', label: 'Glikolik Asit' },
      { value: 'b', label: 'Laktik Asit' },
      { value: 'c', label: 'Salisilik Asit' },
      { value: 'd', label: 'Mandelik Asit' },
    ],
    correct: 'c',
    explanation: 'Salisilik Asit bir BHA\'dir (Beta Hydroxy Acid). Yag cozunurlugu sayesinde gozeneklerin icine nufuz eder.',
    topic: 'Asitler',
  },
  {
    id: 'q6',
    question: 'Cilt bariyerinin ana yapitasi hangisidir?',
    options: [
      { value: 'a', label: 'Retinol' },
      { value: 'b', label: 'Ceramide' },
      { value: 'c', label: 'Vitamin C' },
      { value: 'd', label: 'Benzoyl Peroxide' },
    ],
    correct: 'b',
    explanation: 'Ceramideler cilt bariyerinin %50\'sini olusturur. Bariyer hasar gordugunde ceramide takviyesi onarimda yardimci olur.',
    topic: 'Cilt Bariyeri',
  },
  {
    id: 'q7',
    question: 'Vitamin C serumlari icin ideal pH araligi nedir?',
    options: [
      { value: 'a', label: 'pH 2.5-3.5' },
      { value: 'b', label: 'pH 5.5-6.5' },
      { value: 'c', label: 'pH 7.0 (notr)' },
      { value: 'd', label: 'pH 8.0-9.0' },
    ],
    correct: 'a',
    explanation: 'L-Askorbik Asit formu pH 2.5-3.5 arasinda en etkilidir. Daha yuksek pH\'da stabilite ve etkinlik duser.',
    topic: 'Asitler',
  },
  {
    id: 'q8',
    question: 'Hangisi ciltte kollajen uretimini ARTTIRIR?',
    options: [
      { value: 'a', label: 'Mineral Oil' },
      { value: 'b', label: 'Retinol (Vitamin A)' },
      { value: 'c', label: 'Parfum' },
      { value: 'd', label: 'Silikon' },
    ],
    correct: 'b',
    explanation: 'Retinol hucre yenilenmesini hizlandirir ve kollajen sentezini uyarir. Anti-aging icin altin standart.',
    topic: 'Anti-Aging',
  },
  {
    id: 'q9',
    question: '"Fragrance-free" ve "unscented" ayni anlama gelir mi?',
    options: [
      { value: 'a', label: 'Evet, ayni sey' },
      { value: 'b', label: 'Hayir — unscented maskeleme kokusu icerebilir' },
      { value: 'c', label: 'Hayir — fragrance-free daha tehlikeli' },
      { value: 'd', label: 'Sadece Avrupa\'da farkli' },
    ],
    correct: 'b',
    explanation: '"Unscented" urunler kokuyu notralize eden kimyasallar icerebilir. "Fragrance-free" hic koku bileseni icermez.',
    topic: 'Guvenlik',
  },
  {
    id: 'q10',
    question: 'Hangi vitamin gunes isigiyla ciltte sentezlenir?',
    options: [
      { value: 'a', label: 'Vitamin A' },
      { value: 'b', label: 'Vitamin C' },
      { value: 'c', label: 'Vitamin D' },
      { value: 'd', label: 'Vitamin E' },
    ],
    correct: 'c',
    explanation: 'UVB isinlari ciltte D vitamini sentezini tetikler. Gunes kremi kullanimi D vitamini uretimini azaltabilir — takviye onemlidir.',
    topic: 'Vitaminler',
  },
];

// === Component ===

export default function IngredientQuizPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = QUESTIONS[currentQ];
  const totalQ = QUESTIONS.length;

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
    const correct = QUESTIONS.filter((qq) => userAnswers[qq.id] === qq.correct).length;
    const pct = Math.round((correct / totalQ) * 100);

    const wrongTopics = QUESTIONS
      .filter((qq) => userAnswers[qq.id] !== qq.correct)
      .map((qq) => qq.topic);
    const uniqueWrongTopics = [...new Set(wrongTopics)];

    let level: string;
    let levelMessage: string;
    if (pct >= 90) { level = 'UZMAN'; levelMessage = 'Sen bu isi biliyorsun! Neredeyse bize is kalmadi.'; }
    else if (pct >= 70) { level = 'ILERI'; levelMessage = 'Guzel bilgi birikimin var. Birkac detayi tamamla.'; }
    else if (pct >= 50) { level = 'ORTA'; levelMessage = 'Iyi baslangic! Biraz daha ogrenmeye devam.'; }
    else { level = 'BASLANGIC'; levelMessage = 'Endiselenme, herkes bir yerden baslar. Iste sana ozel okuma listesi:'; }

    const resultData: QuizResultData = {
      headline: `Bilgi Seviyen: ${level}`,
      subheadline: levelMessage,
      score: { value: correct, max: totalQ, label: `%${pct} basari` },
      sections: [
        ...(uniqueWrongTopics.length > 0
          ? [{
              title: 'Eksik Kaldigin Konular',
              icon: 'menu_book',
              items: uniqueWrongTopics.map((t) => ({
                label: t,
                detail: 'Bu konuda rehberimizi oku',
                type: 'negative' as const,
              })),
            }]
          : []),
        {
          title: 'Dogru Bildigin Konular',
          icon: 'check_circle',
          items: [...new Set(
            QUESTIONS.filter((qq) => userAnswers[qq.id] === qq.correct).map((qq) => qq.topic),
          )].map((t) => ({
            label: t,
            type: 'positive' as const,
          })),
        },
      ],
      cta: { label: 'Rehberleri Oku', href: '/rehber' },
      secondaryCta: { label: 'Tekrar Dene', href: '/icerik-testi' },
      shareText: `REVELA Icerik Bilgi Testi: ${correct}/${totalQ} dogru! Seviye: ${level}`,
    };

    return (
      <div className="curator-section max-w-[1200px] mx-auto">
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
          <span className="text-outline">/</span>
          <span className="text-on-surface font-medium">Icerik Testi</span>
        </nav>
        <QuizResult data={resultData} />
      </div>
    );
  }

  const selected = userAnswers[q.id];
  const isCorrect = selected === q.correct;
  const pctDone = Math.round(((currentQ + 1) / totalQ) * 100);

  return (
    <div className="curator-section max-w-[1200px] mx-auto">
      <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-8">
        <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
        <span className="text-outline">/</span>
        <span className="text-on-surface font-medium">Icerik Testi</span>
      </nav>

      {currentQ === 0 && !showExplanation && (
        <div className="text-center mb-12">
          <p className="label-caps text-outline mb-3 tracking-[0.4em]">Bilgi Testi</p>
          <h1 className="text-3xl lg:text-4xl headline-tight text-on-surface mb-3">
            İÇERİK BİLGİ TESTİ
          </h1>
          <p className="text-on-surface-variant max-w-md mx-auto">
            Ne kadar biliyorsun? Hazirlan, sinav var. 10 soruda kozmetik bilgini olc.
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
              {isCorrect ? 'Dogru!' : 'Yanlis!'}
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
              {currentQ === totalQ - 1 ? 'Sonuclari Gor' : 'Sonraki Soru'}
              <span className="material-icon material-icon-sm ml-1" aria-hidden="true">arrow_forward</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
