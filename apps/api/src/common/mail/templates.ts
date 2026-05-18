/**
 * Reusable mail HTML templates (Resend) — LAUNCH_CHECKLIST 2026-05-19 polish.
 *
 * Welcome: ilk login (magic link veya OAuth) sonrası 1 kez gönderilir
 * Newsletter: haftalık/aylık opt-in mailing (boş queue ile başlar)
 *
 * Stil: tüm template'ler container max-width 560px, system font, ışık tema.
 * Üst banner #1F1F1F (REVELA marka rengi), CTA aynı renk.
 *
 * Caller signature: buildWelcomeHtml({ to, siteUrl }) → string (Resend.send.html'e geçer)
 */

export interface WelcomeMailParams {
  to: string;
  siteUrl: string;
  displayName?: string | null;
}

export function buildWelcomeHtml(params: WelcomeMailParams): string {
  const greeting = params.displayName ? `Merhaba ${escapeHtml(params.displayName)}` : 'Merhaba';
  return `<!DOCTYPE html>
<html lang="tr"><head><meta charset="UTF-8"/></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:0;color:#1F1F1F;background:#fafafa;">
  <div style="background:#1F1F1F;color:white;padding:24px;text-align:center;">
    <h1 style="font-size:22px;font-weight:600;margin:0;letter-spacing:-0.02em;">REVELA'ya hoş geldin</h1>
  </div>
  <div style="padding:32px 24px;background:white;">
    <p style="font-size:15px;line-height:1.5;">${greeting}, REVELA ailesine katıldığın için teşekkürler.</p>
    <p style="font-size:14px;line-height:1.6;color:#444;">
      REVELA'da yapabileceklerin:
    </p>
    <ul style="font-size:14px;line-height:1.7;color:#444;padding-left:20px;">
      <li><strong>Cilt analizi</strong> — selfie ile 6 boyutlu cilt skoru + INCI öneri</li>
      <li><strong>İçerik tarayıcısı</strong> — ürün barkodu veya etiketten kanıt-bazlı yorumlama</li>
      <li><strong>Kişiselleştirilmiş öneriler</strong> — cilt tipine + ihtiyaçlarına uygun ürünler</li>
      <li><strong>AI Cilt Danışmanı</strong> (Premium) — analiz üzerine soru-cevap</li>
    </ul>
    <p style="margin:32px 0;text-align:center;">
      <a href="${params.siteUrl}/cilt-analizi" style="display:inline-block;padding:12px 28px;background:#1F1F1F;color:white;text-decoration:none;border-radius:4px;font-weight:500;">İlk Analizimi Yap</a>
    </p>
    <p style="font-size:13px;color:#666;line-height:1.5;">
      Sorun olursa <a href="mailto:info@revela.com.tr" style="color:#1F1F1F;">info@revela.com.tr</a> üzerinden bize ulaş.
    </p>
  </div>
  <div style="padding:16px 24px;text-align:center;color:#999;font-size:11px;">
    <p style="margin:0;">REVELA — Türkiye'nin kanıt-bazlı kozmetik & takviye platformu.</p>
    <p style="margin:6px 0 0;">Bu mail ${params.to} adresine REVELA hesabı için gönderildi.</p>
  </div>
</body></html>`;
}

export interface NewsletterMailParams {
  to: string;
  siteUrl: string;
  edition: string; // örn. "Mayıs 2026"
  headlineTitle: string;
  headlineExcerpt: string;
  headlineHref: string;
  articles: Array<{ title: string; excerpt: string; href: string }>;
  unsubscribeUrl: string;
}

export function buildNewsletterHtml(params: NewsletterMailParams): string {
  const articleRows = params.articles
    .map(
      (a) => `
    <div style="padding:16px 0;border-bottom:1px solid #eee;">
      <a href="${a.href}" style="color:#1F1F1F;text-decoration:none;">
        <h3 style="font-size:15px;font-weight:600;margin:0 0 4px;">${escapeHtml(a.title)}</h3>
      </a>
      <p style="font-size:13px;line-height:1.5;color:#666;margin:0;">${escapeHtml(a.excerpt)}</p>
    </div>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="tr"><head><meta charset="UTF-8"/></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:0;color:#1F1F1F;background:#fafafa;">
  <div style="background:#1F1F1F;color:white;padding:18px 24px;">
    <div style="display:flex;justify-content:space-between;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;opacity:0.7;">
      <span>REVELA Bülten</span>
      <span>${escapeHtml(params.edition)}</span>
    </div>
  </div>
  <div style="padding:32px 24px;background:white;">
    <a href="${params.headlineHref}" style="text-decoration:none;color:inherit;">
      <h2 style="font-size:20px;font-weight:600;margin:0 0 12px;line-height:1.3;">${escapeHtml(params.headlineTitle)}</h2>
    </a>
    <p style="font-size:14px;line-height:1.6;color:#444;margin:0 0 24px;">${escapeHtml(params.headlineExcerpt)}</p>
    <a href="${params.headlineHref}" style="display:inline-block;padding:10px 22px;background:#1F1F1F;color:white;text-decoration:none;border-radius:4px;font-size:13px;font-weight:500;">Devamını oku →</a>

    <h3 style="font-size:13px;font-weight:600;margin:40px 0 8px;text-transform:uppercase;letter-spacing:0.08em;color:#666;">Diğer içerikler</h3>
    ${articleRows}
  </div>
  <div style="padding:16px 24px;text-align:center;color:#999;font-size:11px;">
    <p style="margin:0;">Bu maili ${params.to} adresine REVELA bülten aboneliğin için gönderildi.</p>
    <p style="margin:6px 0 0;">
      <a href="${params.unsubscribeUrl}" style="color:#999;">Abonelikten çık</a>
      &nbsp;·&nbsp;
      <a href="${params.siteUrl}" style="color:#999;">REVELA</a>
    </p>
  </div>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
