#!/usr/bin/env bash
# MD -> PDF (Edge headless)
# Once: node scripts/md-to-html-batch.mjs (HTML uretir)
# Sonra: bash scripts/md-to-pdf-edge.sh

set -e

OUT="$(cd "$(dirname "$0")/../pdf-exports" && pwd)"
EDGE="C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"

if [ ! -d "$OUT" ]; then
  echo "PDF dizini yok. Once: node scripts/md-to-html-batch.mjs"
  exit 1
fi

cd "$OUT"
for html in *.html; do
  pdf="${html%.html}.pdf"
  "$EDGE" --headless --disable-gpu --no-sandbox --print-to-pdf="$OUT/${pdf}" "$OUT/${html}" 2>/dev/null
  if [ -f "$pdf" ]; then
    echo "OK $pdf"
  else
    echo "FAIL $pdf"
  fi
done

echo "Tum PDF: $OUT"
