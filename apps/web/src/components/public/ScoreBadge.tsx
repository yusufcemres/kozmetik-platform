'use client';

interface ScoreBadgeProps {
  score: number;
  grade?: 'A' | 'B' | 'C' | 'D' | 'F';
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-10 h-10 text-sm',
  md: 'w-14 h-14 text-2xl',
  lg: 'w-24 h-24 text-3xl',
};

const borderSizeMap = {
  sm: 'border-2',
  md: 'border-[3px]',
  lg: 'border-4',
};

function getScoreColor(score: number) {
  if (score >= 85) return { border: 'border-green-500', text: 'text-green-600', bg: 'bg-green-500' };
  if (score >= 70) return { border: 'border-lime-500', text: 'text-lime-600', bg: 'bg-lime-500' };
  if (score >= 55) return { border: 'border-amber-500', text: 'text-amber-600', bg: 'bg-amber-500' };
  if (score >= 40) return { border: 'border-orange-500', text: 'text-orange-600', bg: 'bg-orange-500' };
  return { border: 'border-red-500', text: 'text-red-600', bg: 'bg-red-500' };
}

function getGrade(score: number): string {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

export default function ScoreBadge({ score, grade, size = 'md' }: ScoreBadgeProps) {
  const color = getScoreColor(score);
  const resolvedGrade = grade ?? getGrade(score);
  const sizeClass = sizeMap[size];
  const borderClass = borderSizeMap[size];

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${sizeClass} ${borderClass} ${color.border} rounded-full flex items-center justify-center font-bold ${color.text}`}
      >
        {score}
      </div>
      {size !== 'sm' && (
        <span className={`text-xs font-semibold ${color.text} uppercase tracking-wider`}>
          {resolvedGrade}
        </span>
      )}
    </div>
  );
}

/** Küçük overlay rozet — kart image üstüne */
export function ScoreOverlayBadge({ score }: { score: number }) {
  const color = getScoreColor(score);
  return (
    <div className={`absolute top-3 right-3 z-10 ${color.bg} text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold shadow-md`}>
      {score}
    </div>
  );
}
