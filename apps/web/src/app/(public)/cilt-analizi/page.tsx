'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

// === Types ===

interface Need {
  need_id: number;
  need_name: string;
  need_slug: string;
  need_group?: string;
  short_description?: string;
}

interface QuizState {
  // 1. Cilt tipi
  skin_type: string;
  // 2. Cilt hissi
  skin_feel: string;
  // 3. Gözenek
  pore_size: string;
  // 4. T-bölge davranışı
  tzone_behavior: string;
  // 5. Yanak durumu
  cheek_condition: string;
  // 6. Yaş
  age_range: string;
  // 7. Cinsiyet (hormonal)
  gender: string;
  hormonal_factor: string;
  // 8. Bilinen cilt rahatsızlıkları
  skin_conditions: string[];
  // 9. Cilt ihtiyaçları
  concerns: number[];
  // 10. Şiddet
  concern_severity: Record<number, 'mild' | 'moderate' | 'severe'>;
  // 11. Sorun bölgeleri
  problem_areas: string[];
  // 12. Hassasiyetler
  sensitivities: Record<string, boolean>;
  past_reactions: string;
  // 13. Mevcut rutin
  routine: {
    morning_steps: number;
    evening_steps: number;
    sunscreen: boolean;
    makeup: boolean;
    double_cleanse: boolean;
    aftershave: boolean;
    exfoliate_freq: string;
    mask_freq: string;
  };
  // 14. Kullanılan aktifler
  current_actives: string[];
  // 15. Yaşam tarzı
  lifestyle: {
    sun_exposure: string;
    stress: string;
    sleep: string;
    sleep_hours: string;
    water: string;
    diet: string;
    exercise: string;
    smoking: boolean;
    alcohol_consumption: string;
    screen_time: string;
  };
  // 16. Çevresel faktörler
  environment: {
    climate: string;
    pollution: string;
    indoor_heating: boolean;
    water_hardness: string;
    ac_exposure: boolean;
  };
  // 17. Bakım hedefleri
  goals: string[];
  // 18. Ürün tercihleri
  texture_preference: string[];
  fragrance_preference: string;
  ingredient_preference: string[];
  // 19. Bütçe
  budget: string;
}

const INITIAL: QuizState = {
  skin_type: '',
  skin_feel: '',
  pore_size: '',
  tzone_behavior: '',
  cheek_condition: '',
  age_range: '',
  gender: '',
  hormonal_factor: '',
  skin_conditions: [],
  concerns: [],
  concern_severity: {},
  problem_areas: [],
  sensitivities: {},
  past_reactions: '',
  routine: {
    morning_steps: 0, evening_steps: 0, sunscreen: false, makeup: false,
    double_cleanse: false, aftershave: false, exfoliate_freq: 'never', mask_freq: 'never',
  },
  current_actives: [],
  lifestyle: {
    sun_exposure: 'moderate', stress: 'moderate', sleep: 'good', sleep_hours: '7-8',
    water: 'moderate', diet: 'mixed', exercise: 'moderate', smoking: false,
    alcohol_consumption: 'none', screen_time: 'moderate',
  },
  environment: {
    climate: 'temperate', pollution: 'moderate', indoor_heating: false,
    water_hardness: 'soft', ac_exposure: false,
  },
  goals: [],
  texture_preference: [],
  fragrance_preference: 'no_preference',
  ingredient_preference: [],
  budget: '',
};

// === Step Data ===

const skinTypes = [
  { value: 'oily', label: 'Yağlı', desc: 'Gün içinde parlama, geniş gözenekler', icon: 'water_drop' },
  { value: 'dry', label: 'Kuru', desc: 'Sıkılık hissi, pullanma, mat görünüm', icon: 'air' },
  { value: 'combination', label: 'Karma', desc: 'T-bölge yağlı, yanaklar normal/kuru', icon: 'contrast' },
  { value: 'normal', label: 'Normal', desc: 'Dengeli nem, az sorun', icon: 'check_circle' },
  { value: 'sensitive', label: 'Hassas', desc: 'Kızarıklık, tahriş, batma hissi', icon: 'warning_amber' },
];

const skinFeelOptions = [
  { value: 'tight', label: 'Gergin & Sıkı', desc: 'Yıkama sonrası çekme hissi', icon: 'compress' },
  { value: 'oily_midday', label: 'Öğlene Kadar Yağlanır', desc: 'Sabah temiz ama öğlende parlak', icon: 'schedule' },
  { value: 'flaky', label: 'Pullanma & Soyulma', desc: 'Kuru bölgelerde pul pul dökülme', icon: 'grain' },
  { value: 'comfortable', label: 'Rahat & Dengeli', desc: 'Gün boyunca konforlu', icon: 'sentiment_satisfied' },
  { value: 'reactive', label: 'Reaktif & Kızarık', desc: 'Ürünlere veya hava değişimine tepki verir', icon: 'local_fire_department' },
  { value: 'rough', label: 'Pürüzlü & Düzensiz', desc: 'Doku düzensizliği, kabarıklık', icon: 'texture' },
];

const poreSizeOptions = [
  { value: 'small', label: 'Küçük / Görünmez' },
  { value: 'medium', label: 'Orta — Burun ve çenede fark edilir' },
  { value: 'large', label: 'Büyük — T-bölgede geniş' },
  { value: 'mixed', label: 'Karma — Bölgeye göre değişken' },
];

const tzoneBehaviors = [
  { value: 'very_oily', label: 'Çok Yağlı', desc: '2-3 saat içinde parlıyor' },
  { value: 'slightly_oily', label: 'Hafif Yağlı', desc: 'Öğleden sonra hafif parlama' },
  { value: 'balanced', label: 'Dengeli', desc: 'Gün boyunca stabil' },
  { value: 'dry', label: 'Kuru', desc: 'Burun ve alında bile kurukluk' },
];

const cheekConditions = [
  { value: 'normal', label: 'Normal / Sorunsuz' },
  { value: 'dry_patches', label: 'Kuru Bölgeler Var' },
  { value: 'redness', label: 'Kızarıklık / Yüzeysel Damarlar' },
  { value: 'acne_prone', label: 'Sivilce Eğilimli' },
  { value: 'textured', label: 'Doku Düzensizliği' },
];

const ageRanges = [
  { value: '13-17', label: '13–17', desc: 'Ergenlik — hormonal değişim, temel hijyen' },
  { value: '18-24', label: '18–24', desc: 'Genç — sivilce kontrolü, temel koruma' },
  { value: '25-29', label: '25–29', desc: 'Erken önleme — antioksidan, SPF' },
  { value: '30-34', label: '30–34', desc: 'Önleme — retinol başlangıç, nem bariyeri' },
  { value: '35-39', label: '35–39', desc: 'İlk ince çizgiler — peptit, vitamin C' },
  { value: '40-44', label: '40–44', desc: 'Anti-aging — retinol, niacinamide' },
  { value: '45-54', label: '45–54', desc: 'Aktif onarım — sıkılaştırma, pigment' },
  { value: '55+', label: '55+', desc: 'Yoğun beslenme — bariyer, hacim, elastikiyet' },
];

const genderOptions = [
  { value: 'female', label: 'Kadın' },
  { value: 'male', label: 'Erkek' },
  { value: 'non_binary', label: 'Non-Binary' },
  { value: 'prefer_not', label: 'Belirtmek İstemiyorum' },
];

const hormonalFactorsBase = [
  { value: 'none', label: 'Yok / Fark Etmiyorum' },
  { value: 'thyroid', label: 'Tiroid rahatsızlığı' },
];

const hormonalFactorsFemale = [
  ...hormonalFactorsBase,
  { value: 'menstrual', label: 'Regl döneminde sivilce artıyor' },
  { value: 'pregnancy', label: 'Hamilelik / Emzirme' },
  { value: 'menopause', label: 'Menopoz dönemi' },
  { value: 'pcos', label: 'PCOS teşhisi' },
  { value: 'birth_control', label: 'Doğum kontrol hapı kullanıyorum' },
];

const hormonalFactorsMale = [
  ...hormonalFactorsBase,
  { value: 'testosterone', label: 'Yüksek testosteron / Yağlanma' },
  { value: 'hair_loss', label: 'Saç dökülmesi (androgenetik)' },
  { value: 'shaving_irritation', label: 'Tıraş sonrası tahriş / kızarıklık' },
  { value: 'beard_acne', label: 'Sakal bölgesinde sivilce' },
];

// non_binary ve prefer_not: tüm seçenekleri cinsiyet-nötr şekilde göster
const hormonalFactorsNeutral = [
  ...hormonalFactorsBase,
  { value: 'menstrual', label: 'Adet döneminde cilt değişimi' },
  { value: 'pregnancy', label: 'Hamilelik / Emzirme' },
  { value: 'menopause', label: 'Menopoz dönemi' },
  { value: 'pcos', label: 'PCOS teşhisi' },
  { value: 'birth_control', label: 'Hormon tedavisi / Doğum kontrol' },
  { value: 'testosterone', label: 'Yüksek testosteron / Yağlanma' },
  { value: 'hair_loss', label: 'Hormonal saç dökülmesi' },
  { value: 'shaving_irritation', label: 'Tıraş sonrası tahriş' },
];

const skinConditionOptions = [
  { value: 'acne', label: 'Akne / Sivilce', icon: 'healing' },
  { value: 'rosacea', label: 'Rozasea', icon: 'local_fire_department' },
  { value: 'eczema', label: 'Egzama / Atopik Dermatit', icon: 'warning_amber' },
  { value: 'psoriasis', label: 'Sedef Hastalığı', icon: 'grain' },
  { value: 'melasma', label: 'Melazma / Hiperpigmentasyon', icon: 'contrast' },
  { value: 'dermatitis', label: 'Kontakt Dermatit', icon: 'error_outline' },
  { value: 'fungal', label: 'Fungal Akne', icon: 'bug_report' },
  { value: 'none', label: 'Hiçbiri', icon: 'check_circle' },
];

const problemAreaOptions = [
  { value: 'forehead', label: 'Alın' },
  { value: 'nose', label: 'Burun' },
  { value: 'chin', label: 'Çene' },
  { value: 'cheeks', label: 'Yanaklar' },
  { value: 'jawline', label: 'Çene Hattı' },
  { value: 'under_eyes', label: 'Göz Altı' },
  { value: 'lips', label: 'Dudak Çevresi' },
  { value: 'neck', label: 'Boyun' },
  { value: 'none', label: 'Genel / Bölgesel Değil' },
];

const sensitivities = [
  { key: 'fragrance', label: 'Parfüm / Koku', icon: 'spa', desc: 'Kokulu ürünlere kızarıklık veya kaşıntı' },
  { key: 'alcohol', label: 'Alkol', icon: 'science', desc: 'Alkol bazlı ürünlerde yanma, kurukluk' },
  { key: 'paraben', label: 'Paraben', icon: 'block', desc: 'Paraben koruyuculara reaksiyon' },
  { key: 'essential_oils', label: 'Esansiyel Yağlar', icon: 'eco', desc: 'Tea tree, lavanta gibi yağlara alerji' },
  { key: 'retinol', label: 'Retinol / Retinoid', icon: 'brightness_high', desc: 'Retinol ile pullanma, tahriş' },
  { key: 'aha_bha', label: 'AHA / BHA Asitler', icon: 'science', desc: 'Glikolik, salisilik aside tepki' },
  { key: 'niacinamide', label: 'Niacinamide', icon: 'science', desc: 'Yüksek konsantrasyonda kızarıklık' },
  { key: 'vitamin_c', label: 'Vitamin C', icon: 'light_mode', desc: 'Saf C vitamininde batma hissi' },
];

const activeIngredients = [
  { value: 'retinol', label: 'Retinol / Tretinoin' },
  { value: 'vitamin_c', label: 'Vitamin C (L-Askorbik Asit)' },
  { value: 'niacinamide', label: 'Niacinamide' },
  { value: 'hyaluronic_acid', label: 'Hyalüronik Asit' },
  { value: 'salicylic_acid', label: 'Salisilik Asit (BHA)' },
  { value: 'glycolic_acid', label: 'Glikolik Asit (AHA)' },
  { value: 'azelaic_acid', label: 'Azelaik Asit' },
  { value: 'benzoyl_peroxide', label: 'Benzoil Peroksit' },
  { value: 'ceramides', label: 'Ceramide' },
  { value: 'peptides', label: 'Peptit / Bakuchiol' },
  { value: 'centella', label: 'Centella Asiatica / Cica' },
  { value: 'spf', label: 'SPF (Güneş Koruma)' },
  { value: 'none', label: 'Hiçbirini kullanmıyorum' },
];

const goalOptions = [
  { value: 'anti_aging', label: 'Yaşlanma Karşıtı', icon: 'hourglass_empty' },
  { value: 'brightening', label: 'Aydınlatma & Leke Giderme', icon: 'light_mode' },
  { value: 'hydration', label: 'Yoğun Nemlendirme', icon: 'water_drop' },
  { value: 'acne_control', label: 'Sivilce & Akne Kontrolü', icon: 'healing' },
  { value: 'pore_minimize', label: 'Gözenek Sıkılaştırma', icon: 'blur_on' },
  { value: 'barrier_repair', label: 'Bariyer Onarımı', icon: 'shield' },
  { value: 'even_tone', label: 'Ton Eşitleme', icon: 'palette' },
  { value: 'firmness', label: 'Sıkılaştırma & Elastikiyet', icon: 'fitness_center' },
  { value: 'glow', label: 'Doğal Parlaklık (Glow)', icon: 'auto_awesome' },
  { value: 'calming', label: 'Yatıştırma & Kızarıklık Azaltma', icon: 'spa' },
];

const textureOptions = [
  { value: 'lightweight', label: 'Hafif / Jel' },
  { value: 'cream', label: 'Krem / Zengin' },
  { value: 'serum', label: 'Serum / Su Bazlı' },
  { value: 'oil', label: 'Yağ Bazlı' },
  { value: 'balm', label: 'Balm / Ointment' },
  { value: 'no_preference', label: 'Fark Etmez' },
];

const ingredientPreferences = [
  { value: 'natural', label: 'Doğal / Organik Tercih Ederim' },
  { value: 'vegan', label: 'Vegan & Cruelty-Free' },
  { value: 'minimal', label: 'Minimal İçerik (Az Bileşen)' },
  { value: 'clinical', label: 'Klinik / Eczane Markası' },
  { value: 'korean', label: 'Kore Kozmetik (K-Beauty)' },
  { value: 'no_preference', label: 'Fark Etmez' },
];

const environmentOptions = {
  climate: [
    { value: 'hot_humid', label: 'Sıcak & Nemli' },
    { value: 'hot_dry', label: 'Sıcak & Kuru' },
    { value: 'temperate', label: 'Ilıman' },
    { value: 'cold_dry', label: 'Soğuk & Kuru' },
    { value: 'variable', label: 'Değişken / Mevsimsel' },
  ],
  pollution: [
    { value: 'low', label: 'Az (kırsal)' },
    { value: 'moderate', label: 'Orta' },
    { value: 'high', label: 'Yüksek (büyükşehir)' },
  ],
  water_hardness: [
    { value: 'soft', label: 'Yumuşak Su' },
    { value: 'moderate', label: 'Orta' },
    { value: 'hard', label: 'Sert Su (kireçli)' },
    { value: 'dont_know', label: 'Bilmiyorum' },
  ],
};

const budgetOptions = [
  { value: 'budget', label: 'Uygun Fiyatlı', desc: 'Ürün başı ₺500 altı', icon: 'savings' },
  { value: 'mid', label: 'Orta Segment', desc: '₺500 – ₺1.500', icon: 'account_balance_wallet' },
  { value: 'premium', label: 'Premium', desc: '₺1.500 ve üzeri', icon: 'diamond' },
  { value: 'mixed', label: 'Karma', desc: 'Temel ürünlere uygun, aktif ürünlere yatırım', icon: 'tune' },
];

const TOTAL_STEPS = 19;

// === Helpers ===

function OptionCard({ selected, onClick, children, className = '' }: {
  selected: boolean; onClick: () => void; children: React.ReactNode; className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`curator-card p-4 text-left transition-all ${
        selected ? 'border-primary ring-1 ring-primary bg-primary/5' : 'hover:bg-surface-container-low'
      } ${className}`}
    >
      {children}
    </button>
  );
}

function SegmentedControl({ options, value, onChange }: {
  options: { value: string; label: string }[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-2.5 rounded-sm text-xs font-medium transition-colors ${
            value === opt.value ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function MultiChip({ items, selected, onToggle, max }: {
  items: { value: string; label: string; icon?: string }[];
  selected: string[];
  onToggle: (v: string) => void;
  max?: number;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isSelected = selected.includes(item.value);
        const disabled = !isSelected && max !== undefined && selected.length >= max;
        return (
          <button
            key={item.value}
            onClick={() => !disabled && onToggle(item.value)}
            className={`px-3 py-2 rounded-sm text-xs font-medium transition-colors flex items-center gap-1.5 ${
              isSelected
                ? 'bg-primary text-on-primary'
                : disabled
                  ? 'bg-surface-container-low text-outline-variant cursor-not-allowed opacity-50'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {item.icon && <span className="material-icon text-[14px]" aria-hidden="true">{item.icon}</span>}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

// === Page ===

type QuizMode = 'select' | 'quick' | 'detailed';

// Quick test: maps quick step numbers → which full step to render
const QUICK_STEPS = [1, 5, 6, 8, 11, 19] as const;
const QUICK_TOTAL = QUICK_STEPS.length;

const NEEDS_FALLBACK: Need[] = [
  { need_id: 1, need_name: 'Sivilce / Akne', need_slug: 'sivilce-akne', need_group: 'Cilt Sorunları' },
  { need_id: 2, need_name: 'Leke / Hiperpigmentasyon', need_slug: 'leke-hiperpigmentasyon', need_group: 'Cilt Sorunları' },
  { need_id: 3, need_name: 'Kırışıklık / Yaşlanma', need_slug: 'kirisiklik-yaslanma', need_group: 'Cilt Sorunları' },
  { need_id: 4, need_name: 'Kuruluk / Dehidrasyon', need_slug: 'kuruluk-dehidrasyon', need_group: 'Nem' },
  { need_id: 5, need_name: 'Bariyer Desteği', need_slug: 'bariyer-destegi', need_group: 'Bakım' },
  { need_id: 6, need_name: 'Gözenek Sıkılaştırma', need_slug: 'gozenek-sikalastirma', need_group: 'Cilt Sorunları' },
  { need_id: 7, need_name: 'Cilt Tonu Eşitleme', need_slug: 'cilt-tonu-esitleme', need_group: 'Bakım' },
  { need_id: 8, need_name: 'Güneş Koruması', need_slug: 'gunes-korumasi', need_group: 'Koruma' },
  { need_id: 9, need_name: 'Yağ Kontrolü', need_slug: 'yag-kontrolu', need_group: 'Cilt Sorunları' },
  { need_id: 10, need_name: 'Nemlendirme', need_slug: 'nemlendirme', need_group: 'Nem' },
  { need_id: 11, need_name: 'Hassasiyet', need_slug: 'hassasiyet', need_group: 'Bakım' },
  { need_id: 12, need_name: 'Anti-Oksidan Koruma', need_slug: 'anti-oksidan-koruma', need_group: 'Koruma' },
  { need_id: 17, need_name: 'Koyu Halka / Göz Altı Morluk', need_slug: 'koyu-halka-goz-alti-morluk', need_group: 'Cilt Sorunları' },
  { need_id: 18, need_name: 'Cilt Sarkması / Elastikiyet Kaybı', need_slug: 'cilt-sarkmasi-elastikiyet-kaybi', need_group: 'Cilt Sorunları' },
  { need_id: 19, need_name: 'Kızarıklık / Rozasea', need_slug: 'kizariklik-rozasea', need_group: 'Cilt Sorunları' },
  { need_id: 20, need_name: 'İnce Çizgi / Erken Kırışıklık', need_slug: 'ince-cizgi-erken-kirisiklik', need_group: 'Cilt Sorunları' },
  { need_id: 21, need_name: 'Cilt Doku Düzensizliği', need_slug: 'cilt-doku-duzensizligi', need_group: 'Cilt Sorunları' },
  { need_id: 22, need_name: 'Sivilce İzi / Akne Skarı', need_slug: 'sivilce-izi-akne-skari', need_group: 'Cilt Sorunları' },
  { need_id: 23, need_name: 'Göz Çevresi Bakımı', need_slug: 'goz-cevresi-bakimi', need_group: 'Bakım' },
  { need_id: 24, need_name: 'Dudak Bakımı', need_slug: 'dudak-bakimi', need_group: 'Bakım' },
  { need_id: 25, need_name: 'Boyun & Dekolte Bakımı', need_slug: 'boyun-dekolte-bakimi', need_group: 'Bakım' },
  { need_id: 26, need_name: 'Detoks / Arındırma', need_slug: 'detoks-arindirma', need_group: 'Bakım' },
  { need_id: 27, need_name: 'Parlaklık / Glow', need_slug: 'parlaklik-glow', need_group: 'Bakım' },
  { need_id: 28, need_name: 'Mavi Işık / Ekran Koruması', need_slug: 'mavi-isik-ekran-korumasi', need_group: 'Koruma' },
  { need_id: 29, need_name: 'Kirlilik / Çevre Koruması', need_slug: 'kirlilik-cevre-korumasi', need_group: 'Koruma' },
];

export default function SkinAnalysisPage() {
  const router = useRouter();
  const [quizMode, setQuizMode] = useState<QuizMode>('select');
  const [step, setStep] = useState(1);
  const [quiz, setQuiz] = useState<QuizState>(INITIAL);
  const [needs, setNeeds] = useState<Need[]>([]);

  // In quick mode, map step index to actual full step
  const actualStep = quizMode === 'quick' ? QUICK_STEPS[step - 1] : step;
  const totalSteps = quizMode === 'quick' ? QUICK_TOTAL : TOTAL_STEPS;

  useEffect(() => {
    api.get<{ data: Need[] }>('/needs?limit=50')
      .then((res) => {
        const fetched = (res.data || []).filter(n => n.need_group !== 'supplement');
        setNeeds(fetched.length > 0 ? fetched : NEEDS_FALLBACK);
      })
      .catch(() => setNeeds(NEEDS_FALLBACK));

    try {
      const stored = localStorage.getItem('skin_profile');
      if (stored) {
        const p = JSON.parse(stored);
        // Only restore basic profile info, NOT concerns/severity (user should pick fresh)
        setQuiz((prev) => ({
          ...prev,
          skin_type: p.skin_type || '',
          age_range: p.age_range || '',
          budget: p.budget || '',
        }));
      }
    } catch {}
  }, []);

  const canProceed = () => {
    const s = actualStep;
    switch (s) {
      case 1: return !!quiz.skin_type;
      case 2: return !!quiz.skin_feel;
      case 3: return !!quiz.pore_size && !!quiz.tzone_behavior;
      case 4: return !!quiz.cheek_condition;
      case 5: return !!quiz.age_range;
      case 6: return !!quiz.gender;
      case 7: return true; // skin conditions optional
      case 8: return quiz.concerns.length > 0;
      case 9: return quiz.concerns.length > 0;
      case 10: return quiz.problem_areas.length > 0;
      case 11: return true; // sensitivities optional
      case 12: return true; // routine
      case 13: return true; // current actives
      case 14: return true; // lifestyle
      case 15: return true; // environment
      case 16: return quiz.goals.length > 0;
      case 17: return true; // texture/fragrance
      case 18: return true; // ingredient preference
      case 19: return !!quiz.budget;
      default: return false;
    }
  };

  const handleFinish = () => {
    const profile = {
      anonymous_id: crypto.randomUUID(),
      ...quiz,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem('skin_profile', JSON.stringify(profile));

    const sensitivityKeys = Object.entries(quiz.sensitivities)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(',');

    const params = new URLSearchParams({
      quiz_mode: quizMode,
      skin_type: quiz.skin_type,
      skin_feel: quiz.skin_feel,
      pore_size: quiz.pore_size,
      tzone: quiz.tzone_behavior,
      cheeks: quiz.cheek_condition,
      age_range: quiz.age_range,
      gender: quiz.gender,
      hormonal: quiz.hormonal_factor,
      conditions: quiz.skin_conditions.join(','),
      concerns: quiz.concerns.join(','),
      severity: JSON.stringify(quiz.concern_severity),
      problem_areas: quiz.problem_areas.join(','),
      sensitivities: sensitivityKeys,
      budget: quiz.budget,
      goals: quiz.goals.join(','),
      texture: quiz.texture_preference.join(','),
      fragrance: quiz.fragrance_preference,
      ingredient_pref: quiz.ingredient_preference.join(','),
      actives: quiz.current_actives.join(','),
      climate: quiz.environment.climate,
      pollution: quiz.environment.pollution,
      water_hardness: quiz.environment.water_hardness,
      sun: quiz.lifestyle.sun_exposure,
      stress: quiz.lifestyle.stress,
      sleep: quiz.lifestyle.sleep,
      water: quiz.lifestyle.water,
      diet: quiz.lifestyle.diet,
      smoking: quiz.lifestyle.smoking ? 'yes' : 'no',
      screen_time: quiz.lifestyle.screen_time,
    });
    router.push(`/cilt-analizi/sonuc?${params.toString()}`);
  };

  const toggleArrayItem = (
    key: keyof QuizState,
    value: string,
    max?: number,
  ) => {
    setQuiz((prev) => {
      const arr = prev[key] as string[];
      if (arr.includes(value)) {
        return { ...prev, [key]: arr.filter((v) => v !== value) };
      }
      if (max !== undefined && arr.length >= max) return prev;
      return { ...prev, [key]: [...arr, value] };
    });
  };

  const toggleConcern = (id: number) => {
    setQuiz((prev) => {
      const has = prev.concerns.includes(id);
      const newConcerns = has
        ? prev.concerns.filter((c) => c !== id)
        : prev.concerns.length < (quizMode === 'quick' ? 3 : 5) ? [...prev.concerns, id] : prev.concerns;
      const newSeverity = { ...prev.concern_severity };
      if (!has && !newSeverity[id]) newSeverity[id] = 'moderate';
      if (has) delete newSeverity[id];
      return { ...prev, concerns: newConcerns, concern_severity: newSeverity };
    });
  };

  const stepLabelsDetailed = [
    'Cilt Tipi', 'Cilt Hissi', 'Gözenek & T-Bölge', 'Yanak Durumu', 'Yaş',
    'Cinsiyet & Hormonal', 'Cilt Rahatsızlıkları', 'İhtiyaçlar', 'Şiddet Seviyesi', 'Sorun Bölgeleri',
    'Hassasiyetler', 'Bakım Rutini', 'Kullanılan Aktifler', 'Yaşam Tarzı', 'Çevresel Faktörler',
    'Bakım Hedefleri', 'Doku & Koku', 'Marka & İçerik Tercihi', 'Bütçe',
  ];

  const stepLabelsQuick = ['Cilt Tipi', 'Yaş', 'Cinsiyet', 'İhtiyaçlar', 'Hassasiyetler', 'Bütçe'];

  // Step grouping for visual progress
  const stepGroupsDetailed = [
    { label: 'Cilt Analizi', steps: [1, 2, 3, 4] },
    { label: 'Profil', steps: [5, 6, 7] },
    { label: 'İhtiyaçlar', steps: [8, 9, 10] },
    { label: 'Hassasiyet & Rutin', steps: [11, 12, 13] },
    { label: 'Yaşam & Çevre', steps: [14, 15] },
    { label: 'Tercihler', steps: [16, 17, 18, 19] },
  ];

  const stepGroupsQuick = [
    { label: 'Temel Analiz', steps: [1, 2, 3] },
    { label: 'İhtiyaç & Bütçe', steps: [4, 5, 6] },
  ];

  const stepLabels = quizMode === 'quick' ? stepLabelsQuick : stepLabelsDetailed;
  const stepGroups = quizMode === 'quick' ? stepGroupsQuick : stepGroupsDetailed;
  const currentGroup = stepGroups.find((g) => g.steps.includes(step));

  // Gender-aware hormonal factors
  const activeHormonalFactors = quiz.gender === 'male'
    ? hormonalFactorsMale
    : quiz.gender === 'female'
      ? hormonalFactorsFemale
      : hormonalFactorsNeutral;

  return (
    <div className="curator-section max-w-3xl mx-auto">

      {/* === MODE SELECTION SCREEN === */}
      {quizMode === 'select' && (
        <div className="animate-slide-up">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl headline-tight text-on-surface mb-3">CİLT ANALİZİ</h1>
            <p className="text-on-surface-variant text-sm leading-relaxed max-w-md mx-auto mb-4">
              Sana en uygun ürünleri önerebilmemiz için cildini ve alışkanlıklarını yakından tanıyalım.
            </p>
            <p className="text-on-surface-variant/70 text-xs font-medium">Nasıl bir analiz istersin?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quick Test Card */}
            <button
              onClick={() => { setQuizMode('quick'); setStep(1); }}
              className="curator-card p-6 md:p-8 text-left hover:border-primary hover:ring-1 hover:ring-primary transition-all group"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="material-icon text-score-medium text-3xl" aria-hidden="true">bolt</span>
                <div>
                  <h2 className="text-xl font-bold text-on-surface">Hızlı Test</h2>
                  <span className="text-xs text-outline font-medium">~1 dk</span>
                </div>
              </div>
              <p className="text-sm text-on-surface-variant italic mb-4">&ldquo;Asansörde bile yetişir.&rdquo;</p>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                6 soru — cilt tipini ve temel ihtiyaçlarını belirle, hızlıca öneri al.
              </p>
              <span className="inline-flex items-center text-xs font-semibold text-primary group-hover:underline">
                Hızlı Başla
                <span className="material-icon material-icon-sm ml-1" aria-hidden="true">arrow_forward</span>
              </span>
            </button>

            {/* Detailed Test Card */}
            <button
              onClick={() => { setQuizMode('detailed'); setStep(1); }}
              className="curator-card p-6 md:p-8 text-left hover:border-primary hover:ring-1 hover:ring-primary transition-all group relative"
            >
              <div className="absolute top-3 right-3">
                <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Önerilen</span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <span className="material-icon text-primary text-3xl" aria-hidden="true">biotech</span>
                <div>
                  <h2 className="text-xl font-bold text-on-surface">Detaylı Test</h2>
                  <span className="text-xs text-outline font-medium">~4 dk</span>
                </div>
              </div>
              <p className="text-sm text-on-surface-variant italic mb-4">&ldquo;Bir kahve koy, cildini baştan sona tanıyalım.&rdquo;</p>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                19 soru — hormon, rutin, yaşam tarzı, çevresel faktörler dahil eksiksiz analiz.
              </p>
              <span className="inline-flex items-center text-xs font-semibold text-primary group-hover:underline">
                Detaylı Başla
                <span className="material-icon material-icon-sm ml-1" aria-hidden="true">arrow_forward</span>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* === QUIZ CONTENT (both modes) === */}
      {quizMode !== 'select' && (
        <>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase mb-4">
          <span className="material-icon material-icon-sm" aria-hidden="true">{quizMode === 'quick' ? 'bolt' : 'auto_awesome'}</span>
          {quizMode === 'quick' ? 'Hızlı Analiz' : 'Kapsamlı Analiz'}
        </div>
        <h1 className="text-3xl headline-tight text-on-surface">CİLT ANALİZİ</h1>
        <p className="text-on-surface-variant text-sm mt-2">
          {quizMode === 'quick'
            ? '6 soruluk hızlı analiz — temel ürün önerisi al.'
            : '19 soruluk derinlemesine analiz — bilimsel ürün önerisi al.'}
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="label-caps text-outline">{currentGroup?.label} — {step}/{totalSteps}</span>
          <span className="label-caps text-primary">{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
        {/* Step dots */}
        <div className="flex gap-1 mt-2">
          {stepGroups.map((group) => (
            <div key={group.label} className="flex gap-0.5 flex-1">
              {group.steps.map((s) => (
                <div
                  key={s}
                  className={`h-0.5 flex-1 rounded-full transition-colors ${
                    s <= step ? 'bg-primary' : 'bg-surface-container'
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* === STEP 1: Skin Type === */}
      {actualStep === 1 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Cilt tipin ne?</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Genel cilt tipini seç — emin değilsen en yakın olanı işaretle.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skinTypes.map((type) => (
              <OptionCard key={type.value} selected={quiz.skin_type === type.value} onClick={() => setQuiz((p) => ({ ...p, skin_type: type.value }))}>
                <div className="flex items-start gap-4">
                  <span className={`material-icon mt-0.5 ${quiz.skin_type === type.value ? 'text-primary' : 'text-outline-variant'}`} aria-hidden="true">{type.icon}</span>
                  <div>
                    <span className="font-semibold text-on-surface text-base">{type.label}</span>
                    <span className="block text-xs text-on-surface-variant mt-1">{type.desc}</span>
                  </div>
                </div>
              </OptionCard>
            ))}
          </div>
        </div>
      )}

      {/* === STEP 2: Skin Feel === */}
      {actualStep === 2 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Cildin gün içinde nasıl hissettiriyor?</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Cilt tipi doğrulaması ve ürün doku önerisi için.</p>
          <div className="grid grid-cols-1 gap-3">
            {skinFeelOptions.map((opt) => (
              <OptionCard key={opt.value} selected={quiz.skin_feel === opt.value} onClick={() => setQuiz((p) => ({ ...p, skin_feel: opt.value }))}>
                <div className="flex items-start gap-4">
                  <span className={`material-icon mt-0.5 ${quiz.skin_feel === opt.value ? 'text-primary' : 'text-outline-variant'}`} aria-hidden="true">{opt.icon}</span>
                  <div>
                    <span className="font-semibold text-on-surface">{opt.label}</span>
                    <span className="block text-xs text-on-surface-variant mt-1">{opt.desc}</span>
                  </div>
                </div>
              </OptionCard>
            ))}
          </div>
        </div>
      )}

      {/* === STEP 3: Pores + T-Zone === */}
      {actualStep === 3 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Gözenek & T-Bölge</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Bu bilgiler cilt tipi doğrulaması ve özelleştirilmiş öneri için kullanılır.</p>

          <div className="mb-6">
            <p className="text-sm font-medium text-on-surface mb-3">Gözenek boyutun</p>
            <div className="grid grid-cols-2 gap-2">
              {poreSizeOptions.map((opt) => (
                <OptionCard key={opt.value} selected={quiz.pore_size === opt.value} onClick={() => setQuiz((p) => ({ ...p, pore_size: opt.value }))} className="p-3 text-center text-xs">
                  <span className={quiz.pore_size === opt.value ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}>{opt.label}</span>
                </OptionCard>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-on-surface mb-3">T-bölge (alın + burun) nasıl davranıyor?</p>
            <div className="grid grid-cols-1 gap-2">
              {tzoneBehaviors.map((opt) => (
                <OptionCard key={opt.value} selected={quiz.tzone_behavior === opt.value} onClick={() => setQuiz((p) => ({ ...p, tzone_behavior: opt.value }))} className="p-3">
                  <span className={`text-sm ${quiz.tzone_behavior === opt.value ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}>{opt.label}</span>
                  <span className="text-xs text-outline block mt-0.5">{opt.desc}</span>
                </OptionCard>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* === STEP 4: Cheeks === */}
      {actualStep === 4 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Yanakların durumu</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">T-bölge ile yanak arasındaki fark karma cilt teşhisinde önemlidir.</p>
          <div className="grid grid-cols-1 gap-3">
            {cheekConditions.map((opt) => (
              <OptionCard key={opt.value} selected={quiz.cheek_condition === opt.value} onClick={() => setQuiz((p) => ({ ...p, cheek_condition: opt.value }))}>
                <span className={`text-sm ${quiz.cheek_condition === opt.value ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}>{opt.label}</span>
              </OptionCard>
            ))}
          </div>
        </div>
      )}

      {/* === STEP 5: Age === */}
      {actualStep === 5 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Yaş aralığın</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Yaşa göre farklı aktif maddeler ve stratejiler öne çıkar.</p>
          <div className="grid grid-cols-1 gap-2">
            {ageRanges.map((age) => (
              <OptionCard key={age.value} selected={quiz.age_range === age.value} onClick={() => setQuiz((p) => ({ ...p, age_range: age.value }))} className="p-4">
                <div className="flex items-center gap-4">
                  <span className="text-xl font-bold text-on-surface w-14 shrink-0">{age.label}</span>
                  <span className="text-xs text-on-surface-variant">{age.desc}</span>
                </div>
              </OptionCard>
            ))}
          </div>
        </div>
      )}

      {/* === STEP 6: Gender + Hormonal === */}
      {actualStep === 6 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Cinsiyet & hormonal faktörler</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Hormonal değişimler cilt sağlığını doğrudan etkiler.</p>

          <div className="mb-6">
            <p className="text-sm font-medium text-on-surface mb-3">Cinsiyet</p>
            <div className="flex gap-2">
              {genderOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setQuiz((p) => ({ ...p, gender: opt.value, hormonal_factor: '' }))}
                  className={`flex-1 py-3 rounded-sm text-sm font-medium transition-colors ${
                    quiz.gender === opt.value ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {quizMode === 'detailed' && quiz.gender && (
          <div>
            <p className="text-sm font-medium text-on-surface mb-3">Hormonal faktör var mı?</p>
            <div className="grid grid-cols-1 gap-2">
              {activeHormonalFactors.map((opt) => (
                <OptionCard key={opt.value} selected={quiz.hormonal_factor === opt.value} onClick={() => setQuiz((p) => ({ ...p, hormonal_factor: opt.value }))} className="p-3">
                  <span className={`text-sm ${quiz.hormonal_factor === opt.value ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}>{opt.label}</span>
                </OptionCard>
              ))}
            </div>
          </div>
          )}
        </div>
      )}

      {/* === STEP 7: Skin Conditions === */}
      {actualStep === 7 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Bilinen cilt rahatsızlığın var mı?</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Doktor teşhisi koymuş rahatsızlıkları işaretle. Yoksa &quot;Hiçbiri&quot; seç.</p>
          <div className="grid grid-cols-2 gap-3">
            {skinConditionOptions.map((opt) => {
              const isSelected = quiz.skin_conditions.includes(opt.value);
              const isNone = opt.value === 'none';
              return (
                <OptionCard
                  key={opt.value}
                  selected={isSelected}
                  onClick={() => {
                    if (isNone) {
                      setQuiz((p) => ({ ...p, skin_conditions: isSelected ? [] : ['none'] }));
                    } else {
                      setQuiz((p) => ({
                        ...p,
                        skin_conditions: isSelected
                          ? p.skin_conditions.filter((v) => v !== opt.value)
                          : [...p.skin_conditions.filter((v) => v !== 'none'), opt.value],
                      }));
                    }
                  }}
                  className="p-4 text-center flex flex-col items-center gap-2"
                >
                  <span className={`material-icon ${isSelected ? 'text-primary' : 'text-outline-variant'}`} aria-hidden="true">{opt.icon}</span>
                  <span className={`text-xs ${isSelected ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}>{opt.label}</span>
                </OptionCard>
              );
            })}
          </div>
        </div>
      )}

      {/* === STEP 8: Concerns === */}
      {actualStep === 8 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Cilt ihtiyaçların neler?</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">En fazla {quizMode === 'quick' ? 3 : 5} ihtiyaç seçebilirsin. ({quiz.concerns.length}/{quizMode === 'quick' ? 3 : 5})</p>
          <div className="grid grid-cols-2 gap-3">
            {needs.map((need) => (
              <button
                key={need.need_id}
                onClick={() => toggleConcern(need.need_id)}
                className={`curator-card p-4 text-left text-sm transition-all ${
                  quiz.concerns.includes(need.need_id)
                    ? 'border-primary ring-1 ring-primary bg-primary/5 font-semibold text-on-surface'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <span className={`material-icon material-icon-sm mr-1.5 align-text-bottom ${quiz.concerns.includes(need.need_id) ? 'text-primary' : 'text-outline-variant'}`} aria-hidden="true">
                  {quiz.concerns.includes(need.need_id) ? 'check_circle' : 'radio_button_unchecked'}
                </span>
                {need.need_name}
                {need.short_description && (
                  <span className="block text-[10px] text-on-surface-variant mt-1 ml-6">{need.short_description}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* === STEP 9: Concern Severity === */}
      {actualStep === 9 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">İhtiyaçlarının şiddeti</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Her ihtiyaç için şiddet belirle — daha doğru ürün önerisi için.</p>
          <div className="space-y-3">
            {quiz.concerns.map((id) => {
              const need = needs.find((n) => n.need_id === id);
              if (!need) return null;
              const severity = quiz.concern_severity[id] || 'moderate';
              return (
                <div key={id} className="curator-card p-5">
                  <p className="font-semibold text-on-surface mb-3">{need.need_name}</p>
                  <div className="flex gap-2">
                    {([
                      { value: 'mild' as const, label: 'Hafif', color: 'bg-score-high text-on-primary' },
                      { value: 'moderate' as const, label: 'Orta', color: 'bg-score-medium text-on-primary' },
                      { value: 'severe' as const, label: 'Şiddetli', color: 'bg-score-low text-on-primary' },
                    ]).map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setQuiz((p) => ({
                          ...p,
                          concern_severity: { ...p.concern_severity, [id]: opt.value },
                        }))}
                        className={`flex-1 py-2.5 rounded-sm text-xs font-medium transition-colors ${
                          severity === opt.value ? opt.color : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* === STEP 10: Problem Areas === */}
      {actualStep === 10 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Sorunlar en çok nerede?</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Problemlerin yoğunlaştığı bölgeleri seç.</p>
          <div className="grid grid-cols-3 gap-2">
            {[...problemAreaOptions, ...(quiz.gender !== 'female' ? [{ value: 'beard_area', label: 'Sakal Bölgesi' }] : [])].map((opt) => {
              const sel = quiz.problem_areas.includes(opt.value);
              return (
                <OptionCard
                  key={opt.value}
                  selected={sel}
                  onClick={() => toggleArrayItem('problem_areas', opt.value)}
                  className="p-3 text-center"
                >
                  <span className={`text-xs ${sel ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}>{opt.label}</span>
                </OptionCard>
              );
            })}
          </div>
        </div>
      )}

      {/* === STEP 11: Sensitivities === */}
      {actualStep === 11 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Hassasiyetlerin var mı?</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Bilinen hassasiyetlerin varsa işaretle, yoksa atla.</p>
          <div className="grid grid-cols-2 gap-3">
            {sensitivities.map((s) => (
              <OptionCard
                key={s.key}
                selected={!!quiz.sensitivities[s.key]}
                onClick={() => setQuiz((p) => ({
                  ...p,
                  sensitivities: { ...p.sensitivities, [s.key]: !p.sensitivities[s.key] },
                }))}
                className={`p-4 text-center flex flex-col items-center gap-2 ${
                  quiz.sensitivities[s.key] ? '!border-error !ring-error !bg-error/5' : ''
                }`}
              >
                <span className={`material-icon ${quiz.sensitivities[s.key] ? 'text-error' : 'text-outline-variant'}`} aria-hidden="true">{s.icon}</span>
                <span className={`text-sm ${quiz.sensitivities[s.key] ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}>{s.label}</span>
                <span className="text-[10px] text-outline">{s.desc}</span>
              </OptionCard>
            ))}
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-on-surface mb-2">Geçmişte yaşadığın bir ürün reaksiyonu var mı?</p>
            <textarea
              value={quiz.past_reactions}
              onChange={(e) => setQuiz((p) => ({ ...p, past_reactions: e.target.value }))}
              placeholder="Opsiyonel — örn: 'X marka yüz yıkama jeli kızarıklık yaptı'"
              className="curator-input text-sm h-20 resize-none"
            />
          </div>
        </div>
      )}

      {/* === STEP 12: Routine === */}
      {actualStep === 12 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Mevcut bakım rutinin</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Şu anki rutinin başlangıç noktamız.</p>
          <div className="space-y-4">
            <div className="curator-card p-5">
              <label className="text-sm font-medium text-on-surface flex items-center gap-2 mb-3">
                <span className="material-icon material-icon-sm text-score-medium" aria-hidden="true">light_mode</span>
                Sabah kaç adım?
              </label>
              <SegmentedControl
                options={[0, 1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: n === 0 ? 'Yok' : n === 5 ? '5+' : String(n) }))}
                value={String(quiz.routine.morning_steps)}
                onChange={(v) => setQuiz((p) => ({ ...p, routine: { ...p.routine, morning_steps: Number(v) } }))}
              />
            </div>
            <div className="curator-card p-5">
              <label className="text-sm font-medium text-on-surface flex items-center gap-2 mb-3">
                <span className="material-icon material-icon-sm text-primary" aria-hidden="true">dark_mode</span>
                Akşam kaç adım?
              </label>
              <SegmentedControl
                options={[0, 1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: n === 0 ? 'Yok' : n === 5 ? '5+' : String(n) }))}
                value={String(quiz.routine.evening_steps)}
                onChange={(v) => setQuiz((p) => ({ ...p, routine: { ...p.routine, evening_steps: Number(v) } }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(() => {
                const g = quiz.gender;
                const items: { key: keyof typeof quiz.routine; icon: string; label: string; color: string }[] = [
                  { key: 'sunscreen', icon: 'wb_sunny', label: 'Güneş kremi', color: 'score-high' },
                  ...(g !== 'male' ? [{ key: 'makeup' as const, icon: 'face_retouching_natural', label: 'Düzenli makyaj', color: 'primary' }] : []),
                  { key: 'double_cleanse', icon: 'water_drop', label: 'Çift temizleme', color: 'primary' },
                  ...(g !== 'female' ? [{ key: 'aftershave' as const, icon: 'content_cut', label: 'Tıraş sonrası bakım', color: 'primary' }] : []),
                ];
                return items.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setQuiz((p) => ({ ...p, routine: { ...p.routine, [item.key]: !p.routine[item.key as keyof typeof p.routine] } }))}
                    className={`curator-card p-3 text-center text-xs transition-all ${
                      quiz.routine[item.key as keyof typeof quiz.routine] ? `border-${item.color} ring-1 ring-${item.color} bg-${item.color}/5` : ''
                    }`}
                  >
                    <span className={`material-icon block mb-1 ${quiz.routine[item.key as keyof typeof quiz.routine] ? `text-${item.color}` : 'text-outline-variant'}`} aria-hidden="true">{item.icon}</span>
                    {item.label}
                  </button>
                ));
              })()}
            </div>
            <div className="curator-card p-4">
              <label className="text-sm font-medium text-on-surface mb-2 block">Peeling / Eksfolyan sıklığı</label>
              <SegmentedControl
                options={[
                  { value: 'never', label: 'Yok' },
                  { value: 'weekly', label: 'Haftada 1' },
                  { value: '2_3_weekly', label: '2-3/hafta' },
                  { value: 'daily', label: 'Her gün' },
                ]}
                value={quiz.routine.exfoliate_freq}
                onChange={(v) => setQuiz((p) => ({ ...p, routine: { ...p.routine, exfoliate_freq: v } }))}
              />
            </div>
            <div className="curator-card p-4">
              <label className="text-sm font-medium text-on-surface mb-2 block">Maske sıklığı</label>
              <SegmentedControl
                options={[
                  { value: 'never', label: 'Yok' },
                  { value: 'monthly', label: 'Ayda 1-2' },
                  { value: 'weekly', label: 'Haftada 1' },
                  { value: '2_weekly', label: 'Haftada 2+' },
                ]}
                value={quiz.routine.mask_freq}
                onChange={(v) => setQuiz((p) => ({ ...p, routine: { ...p.routine, mask_freq: v } }))}
              />
            </div>
          </div>
        </div>
      )}

      {/* === STEP 13: Current Actives === */}
      {actualStep === 13 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Şu an kullandığın aktif bileşenler</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Hangi aktifleri kullanıyorsun? Çakışma ve sinerjileri değerlendireceğiz.</p>
          <div className="grid grid-cols-1 gap-2">
            {activeIngredients.map((item) => {
              const sel = quiz.current_actives.includes(item.value);
              return (
                <OptionCard key={item.value} selected={sel} onClick={() => {
                  if (item.value === 'none') {
                    setQuiz((p) => ({ ...p, current_actives: sel ? [] : ['none'] }));
                  } else {
                    toggleArrayItem('current_actives', item.value);
                  }
                }} className="p-3">
                  <div className="flex items-center gap-3">
                    <span className={`material-icon material-icon-sm ${sel ? 'text-primary' : 'text-outline-variant'}`} aria-hidden="true">
                      {sel ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className={`text-sm ${sel ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}>{item.label}</span>
                  </div>
                </OptionCard>
              );
            })}
          </div>
        </div>
      )}

      {/* === STEP 14: Lifestyle === */}
      {actualStep === 14 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Yaşam tarzın</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Cilt sağlığını etkileyen günlük alışkanlıklar.</p>
          <div className="space-y-4">
            {[
              { key: 'sun_exposure', label: 'Güneşe maruz kalma', icon: 'wb_sunny', options: [
                { value: 'low', label: 'Az' }, { value: 'moderate', label: 'Orta' }, { value: 'high', label: 'Yüksek' },
              ]},
              { key: 'stress', label: 'Stres seviyesi', icon: 'psychology', options: [
                { value: 'low', label: 'Düşük' }, { value: 'moderate', label: 'Orta' }, { value: 'high', label: 'Yüksek' },
              ]},
              { key: 'sleep', label: 'Uyku kalitesi', icon: 'bedtime', options: [
                { value: 'poor', label: 'Kötü' }, { value: 'moderate', label: 'Orta' }, { value: 'good', label: 'İyi' },
              ]},
              { key: 'sleep_hours', label: 'Günlük uyku', icon: 'schedule', options: [
                { value: 'under_6', label: '<6 saat' }, { value: '6-7', label: '6-7' }, { value: '7-8', label: '7-8' }, { value: '8+', label: '8+' },
              ]},
              { key: 'water', label: 'Günlük su tüketimi', icon: 'local_drink', options: [
                { value: 'low', label: '<1L' }, { value: 'moderate', label: '1-2L' }, { value: 'high', label: '2L+' },
              ]},
              { key: 'diet', label: 'Beslenme alışkanlığı', icon: 'restaurant', options: [
                { value: 'healthy', label: 'Sağlıklı' }, { value: 'mixed', label: 'Karma' }, { value: 'processed', label: 'İşlenmiş gıda ağırlıklı' },
              ]},
              { key: 'exercise', label: 'Egzersiz sıklığı', icon: 'fitness_center', options: [
                { value: 'none', label: 'Yok' }, { value: 'moderate', label: '2-3/hafta' }, { value: 'active', label: '4+/hafta' },
              ]},
              { key: 'screen_time', label: 'Günlük ekran süresi', icon: 'computer', options: [
                { value: 'low', label: '<4 saat' }, { value: 'moderate', label: '4-8 saat' }, { value: 'high', label: '8+ saat' },
              ]},
            ].map((item) => (
              <div key={item.key} className="curator-card p-4">
                <label className="text-sm font-medium text-on-surface flex items-center gap-2 mb-3">
                  <span className="material-icon material-icon-sm text-outline-variant" aria-hidden="true">{item.icon}</span>
                  {item.label}
                </label>
                <SegmentedControl
                  options={item.options}
                  value={quiz.lifestyle[item.key as keyof typeof quiz.lifestyle] as string}
                  onChange={(v) => setQuiz((p) => ({ ...p, lifestyle: { ...p.lifestyle, [item.key]: v } }))}
                />
              </div>
            ))}
            <div className="curator-card p-4 flex items-center justify-between">
              <label className="text-sm font-medium text-on-surface flex items-center gap-2">
                <span className="material-icon material-icon-sm text-outline-variant" aria-hidden="true">smoking_rooms</span>
                Sigara kullanıyor musun?
              </label>
              <button
                onClick={() => setQuiz((p) => ({ ...p, lifestyle: { ...p.lifestyle, smoking: !p.lifestyle.smoking } }))}
                className={`px-4 py-2 rounded-sm text-xs font-medium transition-colors ${
                  quiz.lifestyle.smoking ? 'bg-error text-on-primary' : 'bg-surface-container-low text-on-surface-variant'
                }`}
              >
                {quiz.lifestyle.smoking ? 'Evet' : 'Hayır'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === STEP 15: Environment === */}
      {actualStep === 15 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Çevresel faktörler</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Yaşadığın ortam cilt bariyerini doğrudan etkiler.</p>
          <div className="space-y-4">
            <div className="curator-card p-4">
              <label className="text-sm font-medium text-on-surface flex items-center gap-2 mb-3">
                <span className="material-icon material-icon-sm text-outline-variant" aria-hidden="true">thermostat</span>
                Yaşadığın iklim
              </label>
              <div className="flex flex-wrap gap-2">
                {environmentOptions.climate.map((opt) => (
                  <button key={opt.value} onClick={() => setQuiz((p) => ({ ...p, environment: { ...p.environment, climate: opt.value } }))}
                    className={`px-3 py-2 rounded-sm text-xs font-medium transition-colors ${
                      quiz.environment.climate === opt.value ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}>{opt.label}</button>
                ))}
              </div>
            </div>
            <div className="curator-card p-4">
              <label className="text-sm font-medium text-on-surface flex items-center gap-2 mb-3">
                <span className="material-icon material-icon-sm text-outline-variant" aria-hidden="true">factory</span>
                Hava kirliliği
              </label>
              <SegmentedControl
                options={environmentOptions.pollution}
                value={quiz.environment.pollution}
                onChange={(v) => setQuiz((p) => ({ ...p, environment: { ...p.environment, pollution: v } }))}
              />
            </div>
            <div className="curator-card p-4">
              <label className="text-sm font-medium text-on-surface flex items-center gap-2 mb-3">
                <span className="material-icon material-icon-sm text-outline-variant" aria-hidden="true">water_drop</span>
                Su sertliği
              </label>
              <SegmentedControl
                options={environmentOptions.water_hardness}
                value={quiz.environment.water_hardness}
                onChange={(v) => setQuiz((p) => ({ ...p, environment: { ...p.environment, water_hardness: v } }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setQuiz((p) => ({ ...p, environment: { ...p.environment, indoor_heating: !p.environment.indoor_heating } }))}
                className={`curator-card p-4 text-center text-xs transition-all ${
                  quiz.environment.indoor_heating ? 'border-primary ring-1 ring-primary bg-primary/5' : ''
                }`}
              >
                <span className={`material-icon block mb-1 ${quiz.environment.indoor_heating ? 'text-primary' : 'text-outline-variant'}`} aria-hidden="true">local_fire_department</span>
                Kapalı alan ısıtma (kalorifer/soba)
              </button>
              <button
                onClick={() => setQuiz((p) => ({ ...p, environment: { ...p.environment, ac_exposure: !p.environment.ac_exposure } }))}
                className={`curator-card p-4 text-center text-xs transition-all ${
                  quiz.environment.ac_exposure ? 'border-primary ring-1 ring-primary bg-primary/5' : ''
                }`}
              >
                <span className={`material-icon block mb-1 ${quiz.environment.ac_exposure ? 'text-primary' : 'text-outline-variant'}`} aria-hidden="true">ac_unit</span>
                Klimaya uzun süre maruz kalma
              </button>
            </div>
          </div>
        </div>
      )}

      {/* === STEP 16: Goals === */}
      {actualStep === 16 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Bakım hedeflerin</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">En fazla 3 hedef seç. ({quiz.goals.length}/3)</p>
          <div className="grid grid-cols-2 gap-3">
            {goalOptions.map((opt) => {
              const sel = quiz.goals.includes(opt.value);
              return (
                <OptionCard key={opt.value} selected={sel} onClick={() => toggleArrayItem('goals', opt.value, 3)} className="p-4 text-center flex flex-col items-center gap-2">
                  <span className={`material-icon ${sel ? 'text-primary' : 'text-outline-variant'}`} aria-hidden="true">{opt.icon}</span>
                  <span className={`text-xs ${sel ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}>{opt.label}</span>
                </OptionCard>
              );
            })}
          </div>
        </div>
      )}

      {/* === STEP 17: Texture + Fragrance === */}
      {actualStep === 17 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Ürün doku & koku tercihin</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Hangi dokuyu tercih edersin?</p>

          <div className="mb-8">
            <p className="text-sm font-medium text-on-surface mb-3">Tercih ettiğin doku (birden fazla seçebilirsin)</p>
            <MultiChip items={textureOptions} selected={quiz.texture_preference} onToggle={(v) => toggleArrayItem('texture_preference', v)} />
          </div>

          <div>
            <p className="text-sm font-medium text-on-surface mb-3">Koku tercihin</p>
            <SegmentedControl
              options={[
                { value: 'fragrance_free', label: 'Kokusuz' },
                { value: 'light', label: 'Hafif Koku' },
                { value: 'no_preference', label: 'Fark Etmez' },
              ]}
              value={quiz.fragrance_preference}
              onChange={(v) => setQuiz((p) => ({ ...p, fragrance_preference: v }))}
            />
          </div>
        </div>
      )}

      {/* === STEP 18: Ingredient / Brand preference === */}
      {actualStep === 18 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Marka & içerik tercihin</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Özel bir tercihin var mı?</p>
          <MultiChip items={ingredientPreferences} selected={quiz.ingredient_preference} onToggle={(v) => toggleArrayItem('ingredient_preference', v)} />
        </div>
      )}

      {/* === STEP 19: Budget === */}
      {actualStep === 19 && (
        <div className="animate-slide-up">
          <h2 className="text-xl font-bold text-on-surface mb-2 text-center">Bütçe tercihin</h2>
          <p className="text-sm text-on-surface-variant text-center mb-8">Ürün başına harcama beklentin.</p>
          <div className="grid grid-cols-1 gap-3">
            {budgetOptions.map((opt) => (
              <OptionCard key={opt.value} selected={quiz.budget === opt.value} onClick={() => setQuiz((p) => ({ ...p, budget: opt.value }))}>
                <div className="flex items-center gap-4">
                  <span className={`material-icon text-2xl ${quiz.budget === opt.value ? 'text-primary' : 'text-outline-variant'}`} aria-hidden="true">{opt.icon}</span>
                  <div>
                    <span className="font-semibold text-on-surface text-base">{opt.label}</span>
                    <span className="block text-xs text-on-surface-variant mt-0.5">{opt.desc}</span>
                  </div>
                </div>
              </OptionCard>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-10">
        {step > 1 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 curator-btn-outline py-3.5 text-xs"
          >
            <span className="material-icon material-icon-sm mr-1 align-text-bottom" aria-hidden="true">arrow_back</span>
            GERİ
          </button>
        )}
        {step === 1 && (
          <button
            onClick={() => { setQuizMode('select'); setStep(1); }}
            className="flex-1 curator-btn-outline py-3.5 text-xs"
          >
            <span className="material-icon material-icon-sm mr-1 align-text-bottom" aria-hidden="true">arrow_back</span>
            TEST SEÇİMİ
          </button>
        )}
        {step < totalSteps ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="flex-1 curator-btn-primary py-3.5 text-xs disabled:opacity-50"
          >
            DEVAM
            <span className="material-icon material-icon-sm ml-1 align-text-bottom" aria-hidden="true">arrow_forward</span>
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={!canProceed()}
            className="flex-1 curator-btn-primary py-3.5 text-xs disabled:opacity-50"
          >
            <span className="material-icon material-icon-sm mr-1 align-text-bottom" aria-hidden="true">auto_awesome</span>
            SONUÇLARIMI GÖR
          </button>
        )}
      </div>
        </>
      )}
    </div>
  );
}
