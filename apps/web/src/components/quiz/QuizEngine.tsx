'use client';

import { useState, useCallback } from 'react';

// === Types ===

export interface QuizOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

export interface QuizStep {
  id: string;
  question: string;
  description?: string;
  type: 'single' | 'multi' | 'slider';
  options?: QuizOption[];
  maxSelections?: number;
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
  sliderUnit?: string;
}

export type QuizAnswers = Record<string, string | string[] | number>;

export interface QuizConfig {
  quizId: string;
  title: string;
  subtitle: string;
  icon?: string;
  steps: QuizStep[];
  onComplete: (answers: QuizAnswers) => void;
}

// === Sub-components ===

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round(((current + 1) / total) * 100);
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-on-surface-variant">
          {current + 1} / {total}
        </span>
        <span className="text-xs text-on-surface-variant">%{pct}</span>
      </div>
      <div className="h-1 bg-surface-container rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function SingleSelect({
  step,
  value,
  onChange,
}: {
  step: QuizStep;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {step.options?.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`text-left p-4 rounded-sm border transition-all duration-200 ${
            value === opt.value
              ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
              : 'border-outline-variant/20 hover:border-outline-variant/50 bg-surface'
          }`}
        >
          <div className="flex items-start gap-3">
            {opt.icon && (
              <span className="material-icon text-primary shrink-0" aria-hidden="true">
                {opt.icon}
              </span>
            )}
            <div>
              <p className="font-semibold text-sm text-on-surface">{opt.label}</p>
              {opt.description && (
                <p className="text-xs text-on-surface-variant mt-0.5">{opt.description}</p>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function MultiSelect({
  step,
  value,
  onChange,
}: {
  step: QuizStep;
  value: string[];
  onChange: (val: string[]) => void;
}) {
  const max = step.maxSelections || 99;

  const toggle = (v: string) => {
    if (value.includes(v)) {
      onChange(value.filter((x) => x !== v));
    } else if (value.length < max) {
      onChange([...value, v]);
    }
  };

  return (
    <div>
      {step.maxSelections && (
        <p className="text-xs text-on-surface-variant mb-3">
          En fazla {step.maxSelections} seçim yapabilirsiniz ({value.length}/{step.maxSelections})
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {step.options?.map((opt) => {
          const selected = value.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`text-left p-4 rounded-sm border transition-all duration-200 ${
                selected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                  : 'border-outline-variant/20 hover:border-outline-variant/50 bg-surface'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    selected ? 'border-primary bg-primary' : 'border-outline-variant'
                  }`}
                >
                  {selected && (
                    <span className="material-icon text-on-primary text-sm" aria-hidden="true">check</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm text-on-surface">{opt.label}</p>
                  {opt.description && (
                    <p className="text-xs text-on-surface-variant mt-0.5">{opt.description}</p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SliderInput({
  step,
  value,
  onChange,
}: {
  step: QuizStep;
  value: number;
  onChange: (val: number) => void;
}) {
  const min = step.sliderMin ?? 0;
  const max = step.sliderMax ?? 100;
  const stepVal = step.sliderStep ?? 1;

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="text-center mb-8">
        <span className="text-5xl font-bold text-primary">{value}</span>
        {step.sliderUnit && (
          <span className="text-lg text-on-surface-variant ml-1">{step.sliderUnit}</span>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={stepVal}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-surface-container rounded-full appearance-none cursor-pointer accent-primary"
      />
      <div className="flex justify-between mt-2 text-xs text-on-surface-variant">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

// === Main Engine ===

export default function QuizEngine({ config }: { config: QuizConfig }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [animating, setAnimating] = useState(false);

  const step = config.steps[currentStep];
  const isLast = currentStep === config.steps.length - 1;

  const canProceed = useCallback(() => {
    const val = answers[step.id];
    if (step.type === 'slider') return true;
    if (step.type === 'multi') return Array.isArray(val) && val.length > 0;
    return !!val;
  }, [answers, step]);

  const goNext = () => {
    if (!canProceed()) return;
    setAnimating(true);
    setTimeout(() => {
      if (isLast) {
        config.onComplete(answers);
      } else {
        setCurrentStep((s) => s + 1);
      }
      setAnimating(false);
    }, 200);
  };

  const goBack = () => {
    if (currentStep === 0) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep((s) => s - 1);
      setAnimating(false);
    }, 200);
  };

  const updateAnswer = (value: string | string[] | number) => {
    setAnswers((prev) => ({ ...prev, [step.id]: value }));
  };

  // Auto-advance on single select
  const handleSingleSelect = (val: string) => {
    setAnswers((prev) => ({ ...prev, [step.id]: val }));
    if (!isLast) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentStep((s) => s + 1);
        setAnimating(false);
      }, 300);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <ProgressBar current={currentStep} total={config.steps.length} />

      <div
        className={`transition-opacity duration-200 ${animating ? 'opacity-0' : 'opacity-100'}`}
      >
        {/* Question */}
        <div className="mb-8">
          <h2 className="text-xl lg:text-2xl font-bold text-on-surface mb-2">
            {step.question}
          </h2>
          {step.description && (
            <p className="text-sm text-on-surface-variant">{step.description}</p>
          )}
        </div>

        {/* Input */}
        {step.type === 'single' && (
          <SingleSelect
            step={step}
            value={(answers[step.id] as string) || ''}
            onChange={handleSingleSelect}
          />
        )}
        {step.type === 'multi' && (
          <MultiSelect
            step={step}
            value={(answers[step.id] as string[]) || []}
            onChange={(val) => updateAnswer(val)}
          />
        )}
        {step.type === 'slider' && (
          <SliderInput
            step={step}
            value={(answers[step.id] as number) ?? step.sliderMin ?? 25}
            onChange={(val) => updateAnswer(val)}
          />
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-10">
          <button
            type="button"
            onClick={goBack}
            className={`flex items-center gap-1 text-sm text-on-surface-variant hover:text-on-surface transition-colors ${
              currentStep === 0 ? 'invisible' : ''
            }`}
          >
            <span className="material-icon material-icon-sm" aria-hidden="true">arrow_back</span>
            Geri
          </button>

          {(step.type === 'multi' || step.type === 'slider') && (
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed()}
              className="curator-btn-primary text-sm px-8 py-3 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isLast ? 'Sonuçları Gör' : 'Devam'}
              <span className="material-icon material-icon-sm ml-1" aria-hidden="true">
                {isLast ? 'check' : 'arrow_forward'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
