interface UserProfile {
  skin_type_detailed: string | null;
  skin_concerns: string[] | null;
  pregnancy_status: string | null;
  age_group: string | null;
  budget_tier: string | null;
  routine_complexity: string | null;
  last_quiz_at: string | null;
}

const LABELS: Record<string, string> = {
  yagli: 'Yağlı',
  kuru: 'Kuru',
  karma: 'Karma',
  hassas: 'Hassas',
  normal: 'Normal',
};

export function ProfileCard({ profile }: { profile: UserProfile | null }) {
  if (!profile) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-sm text-neutral-600">
        Cilt testini tamamla, kişisel profilin burada görünür.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="mb-3 text-xs uppercase tracking-wide text-neutral-500">Profil</div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Row label="Cilt tipi" value={profile.skin_type_detailed ? LABELS[profile.skin_type_detailed] || profile.skin_type_detailed : '—'} />
        <Row label="Yaş aralığı" value={profile.age_group || '—'} />
        <Row label="Rutin" value={profile.routine_complexity || '—'} />
        <Row label="Bütçe" value={profile.budget_tier || '—'} />
      </div>
      {profile.skin_concerns && profile.skin_concerns.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 text-xs uppercase text-neutral-500">Sorunlar</div>
          <div className="flex flex-wrap gap-2">
            {profile.skin_concerns.map((c) => (
              <span key={c} className="rounded-full border border-neutral-300 px-3 py-1 text-xs">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
      {profile.pregnancy_status && profile.pregnancy_status !== 'none' && (
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Hamilelik/emzirme filtresi aktif — retinoid ve yüksek salisilik otomatik gizlenir.
        </p>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase text-neutral-500">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
