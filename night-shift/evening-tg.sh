#!/usr/bin/env bash
# Evening TG — waits until 21:00 Europe/Istanbul, then posts a summary of today's
# night-shift reports to Telegram chat 1579089540.
#
# Usage: ./night-shift/evening-tg.sh [--target-hour=21] [--date=YYYY-MM-DD]
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

TARGET_H=21
DATE="$(date +%Y-%m-%d)"
DATE_COMPACT="$(date +%Y%m%d)"

for arg in "$@"; do
  case "$arg" in
    --target-hour=*) TARGET_H="${arg#*=}" ;;
    --date=*)
      DATE="${arg#*=}"
      DATE_COMPACT="$(date -d "$DATE" +%Y%m%d 2>/dev/null || echo "${DATE//-/}")"
      ;;
  esac
done

REPORT_DIR="$ROOT/night-shift-reports/$DATE"
LOG_DIR="$ROOT/night-shift/logs/$DATE"
mkdir -p "$LOG_DIR"

log() { echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] $*" | tee -a "$LOG_DIR/evening-tg.log"; }

log "=== Evening TG start, target=${TARGET_H}:00 TRT, date=$DATE ==="

NOW_H=$(date +%H)
NOW_M=$(date +%M)
NOW_S=$(date +%S)
TARGET_SEC=$((TARGET_H * 3600))
NOW_SEC=$((10#$NOW_H * 3600 + 10#$NOW_M * 60 + 10#$NOW_S))

if [ "$NOW_SEC" -lt "$TARGET_SEC" ]; then
  SLEEP_SEC=$((TARGET_SEC - NOW_SEC))
  log "Sleeping ${SLEEP_SEC}s until ${TARGET_H}:00"
  sleep "$SLEEP_SEC"
else
  log "Past target already — sending now"
fi

TG_TOKEN="8731808968:AAFYDTAMeae2CHWXtPDGpyZQ2D5WUdhNClA"
TG_CHAT="1579089540"

jval() {
  local file="$1" key="$2"
  if [ -f "$file" ]; then
    node -e "try{const v=require('$file')['$key'];console.log(v==null?0:v)}catch(e){console.log(0)}" 2>/dev/null || echo 0
  else
    echo 0
  fi
}

P1=$REPORT_DIR/phase1_summary.json
P2=$REPORT_DIR/phase2_summary.json
P2B=$REPORT_DIR/phase2b_summary.json
P3=$REPORT_DIR/phase3_summary.json
P4=$REPORT_DIR/phase4_summary.json

MSG="🌙 Revela Gece Vardiyası — ${DATE} akşam raporu

"
if [ -f "$P1" ]; then
  MSG+="1️⃣ Affiliate: $(jval $P1 checked) re-check / $(jval $P1 cohort_size) cohort
    • $(jval $P1 flagged_dead) dead flagged · $(jval $P1 recovered) recovered · $(jval $P1 still_failing) still failing
"
fi
if [ -f "$P2" ]; then
  MSG+="2️⃣ Image HEAD: $(jval $P2 checked) kontrol / $(jval $P2 broken_count) broken + $(jval $P2 tiny_count) tiny
"
fi
if [ -f "$P2B" ]; then
  MSG+="2️⃣b Recovery (og:image): $(jval $P2B recovered) görsel yenilendi / $(jval $P2B cohort) aday
"
fi
if [ -f "$P3" ]; then
  MSG+="3️⃣ Price: $(jval $P3 drift_events) drift / $(jval $P3 brands_with_dead_links) marka dead link
"
fi
if [ -f "$P4" ]; then
  MSG+="4️⃣ Data: $(jval $P4 duplicate_candidates) dup · $(jval $P4 missing_inci_cosmetic) INCI eksik · $(jval $P4 orphan_ingredients) orphan
"
fi

MSG+="
📝 Tam rapor: MORNING_REPORT_REVELA_${DATE_COMPACT}.md"

log "Sending TG"
curl -s -X POST "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
  --data-urlencode "chat_id=${TG_CHAT}" \
  --data-urlencode "text=${MSG}" \
  --data-urlencode "disable_web_page_preview=true" \
  > "$LOG_DIR/evening-tg-response.json" 2>&1

OK=$(node -e "try{const r=require('$LOG_DIR/evening-tg-response.json');console.log(r.ok?1:0)}catch(e){console.log(0)}" 2>/dev/null || echo 0)
if [ "$OK" = "1" ]; then
  log "TG sent OK"
else
  log "TG FAIL (see $LOG_DIR/evening-tg-response.json)"
fi
