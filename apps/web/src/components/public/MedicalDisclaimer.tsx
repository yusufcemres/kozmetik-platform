/**
 * KVKK + Reklam Kurulu uyumu için tıbbi disclaimer banner.
 *
 * Kullanım: foto/quiz/AI-bazlı cilt/saç/beslenme analiz sayfalarının üst kısmında render edilir.
 * "Bu bir tıbbi tanı değildir" mesajı, kullanıcının bilinçli karar vermesini destekler.
 *
 * 2026-05-15 audit (Madde 6) ile eklendi.
 */
export interface MedicalDisclaimerProps {
  /** Variant: 'inline' (paragraf alta yerleşik) veya 'banner' (page üstü öne çıkan). */
  variant?: 'inline' | 'banner';
  /** Opsiyonel ek metin (sayfaya özel detay). */
  detail?: string;
}

export function MedicalDisclaimer({ variant = 'banner', detail }: MedicalDisclaimerProps) {
  if (variant === 'inline') {
    return (
      <p className="text-xs text-on-surface-variant italic mt-3">
        ⚠️ Bu analiz <strong>tıbbi tanı veya tedavi tavsiyesi değildir</strong>. Cilt, saç veya genel sağlık sorunlarınız için lütfen bir dermatolog, eczacı veya hekime başvurun. REVELA sonuçları yalnızca bilgilendirme amaçlıdır.
        {detail ? <> {detail}</> : null}
      </p>
    );
  }
  return (
    <div
      role="note"
      aria-label="Tıbbi disclaimer"
      className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-4 py-3 text-sm text-amber-900 dark:text-amber-200 mb-6"
    >
      <p className="font-semibold mb-1">⚠️ Tıbbi tanı değildir</p>
      <p className="leading-relaxed">
        Bu test eğitim amaçlı bilgilendirme sağlar; <strong>tanı, tedavi veya hekim tavsiyesinin yerine geçmez</strong>. Sürekli veya ciddi cilt/saç/sağlık sorunlarınız için lütfen dermatolog, eczacı veya hekime başvurun.
        {detail ? <> {detail}</> : null}
      </p>
    </div>
  );
}
