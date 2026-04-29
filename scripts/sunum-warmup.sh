#!/usr/bin/env bash
# REVELA sunum öncesi Render warm-up — cold start (~30s) sunum sırasında yaşanmasın
# Kullanım: 4 May 2026 Pzt sabah 10:30 civarı çalıştır (sunum 11:00)
# Render free tier 15 dk inactivity sonrası uyur. Bu script API'yı uyandırır + sıcak tutar.

set -e

API="https://kozmetik-api.onrender.com/api/v1"
WEB="https://kozmetik-platform.vercel.app"

echo "==> 1/3 API health probe (cold start warmup)"
time curl -sf -o /dev/null -w "  api  %{http_code}  %{time_total}s\n" "${API}/health" -m 60

echo
echo "==> 2/3 Hot path priming (top-by-concern + product detail)"
curl -sf -o /dev/null -w "  top-by-concern  %{http_code}  %{time_total}s\n" "${API}/products/top-by-concern/sivilce-akne" -m 30
curl -sf -o /dev/null -w "  ihtiyaclar      %{http_code}  %{time_total}s\n" "${API}/needs" -m 30
curl -sf -o /dev/null -w "  brands          %{http_code}  %{time_total}s\n" "${API}/brands?limit=10" -m 30

echo
echo "==> 3/3 Frontend critical paths"
for path in "/sunum" "/portfoy" "/" "/ai-arama" "/ihtiyaclar/sivilce-akne"; do
  curl -sf -o /dev/null -w "  ${path}  %{http_code}  %{time_total}s\n" "${WEB}${path}" -m 30
done

echo
echo "==> Hazır. Sunum başlasın."
