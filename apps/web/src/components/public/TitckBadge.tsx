interface Props {
  status: 'not_checked' | 'verified' | 'not_found' | 'expired' | 'banned';
  notificationNo?: string | null;
}

export function TitckBadge({ status, notificationNo }: Props) {
  if (status === 'verified') {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full border border-emerald-500 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800"
        title={notificationNo ? `Bildirim No: ${notificationNo}` : undefined}
      >
        ✓ TİTCK Bildirilmiş
      </span>
    );
  }
  if (status === 'banned') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-500 bg-red-50 px-3 py-1 text-xs font-medium text-red-800">
        ⚠ Yasaklı İçerik
      </span>
    );
  }
  if (status === 'expired') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
        ⏱ Bildirim Süresi Dolmuş
      </span>
    );
  }
  return null;
}
