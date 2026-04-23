#!/usr/bin/env bash
# Revela Gece Vardiyası — master orchestrator
# Usage: ./night-shift/run.sh
#
# Sırayla phase1..phase5 koşar, logları tee'ler, 07:00 TRT'de TG bildirimi atar.
# Trigger: "Revela için gece vardiyasına başla"
set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
# System clock is already Europe/Istanbul; avoid TZ= prefix because Git Bash on
# Windows doesn't ship zoneinfo and that path falls back to UTC.
DATE="$(date +%Y-%m-%d)"
DATE_COMPACT="$(date +%Y%m%d)"
REPORT_DIR="$ROOT/night-shift-reports/$DATE"
LOG_DIR="$ROOT/night-shift/logs/$DATE"
STATE_DIR="$ROOT/night-shift-reports/state"

mkdir -p "$REPORT_DIR" "$LOG_DIR" "$STATE_DIR"

MASTER_LOG="$LOG_DIR/master.log"

log() {
  echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] $*" | tee -a "$MASTER_LOG"
}

run_phase() {
  local name="$1"
  local script="$2"
  local log_file="$LOG_DIR/${name}.log"
  log "=== START $name ==="
  local start=$(date +%s)
  if bash "$ROOT/run-prod.sh" "$script" --report-dir="$REPORT_DIR" > "$log_file" 2>&1; then
    local dur=$(( $(date +%s) - start ))
    log "=== DONE $name in ${dur}s ==="
    return 0
  else
    local rc=$?
    local dur=$(( $(date +%s) - start ))
    log "=== FAIL $name rc=$rc after ${dur}s (see $log_file) ==="
    return $rc
  fi
}

log "================================"
log "Revela Night Shift START $DATE"
log "Report dir: $REPORT_DIR"
log "Log dir:    $LOG_DIR"
log "================================"

# Phase 1 — Affiliate audit (read + re-check failing links, flag dead)
run_phase "phase1" "src/scripts/night-shift/phase1-affiliate-audit.ts" || log "phase1 non-fatal continue"

# Phase 2 — Image health (HEAD check + URL upgrade)
run_phase "phase2" "src/scripts/night-shift/phase2-image-health.ts" || log "phase2 non-fatal continue"

# Phase 3 — Price intelligence (read-only SQL)
run_phase "phase3" "src/scripts/night-shift/phase3-price-intel.ts" || log "phase3 non-fatal continue"

# Phase 4 — Data quality (read-only SQL)
run_phase "phase4" "src/scripts/night-shift/phase4-data-quality.ts" || log "phase4 non-fatal continue"

# Phase 5 — Morning report aggregation (pure node, no DB)
log "=== START phase5 ==="
AGENTS_ROOT="c:/Users/Yusuf Cemre/OneDrive/Desktop/AGENTS"
MORNING_REPORT="$AGENTS_ROOT/MORNING_REPORT_REVELA_${DATE_COMPACT}.md"
pushd "$ROOT/apps/api" > /dev/null
if npx ts-node -r tsconfig-paths/register -P tsconfig.scripts.json \
    src/scripts/night-shift/phase5-morning-report.ts \
    --report-dir="$REPORT_DIR" \
    --out="$MORNING_REPORT" \
    > "$LOG_DIR/phase5.log" 2>&1; then
  log "=== DONE phase5 — report: $MORNING_REPORT ==="
else
  log "=== FAIL phase5 (see $LOG_DIR/phase5.log) ==="
fi
popd > /dev/null

# --- TG notification at 07:00 Europe/Istanbul ---
TG_TOKEN="8731808968:AAFYDTAMeae2CHWXtPDGpyZQ2D5WUdhNClA"
TG_CHAT="1579089540"

# System clock is already Europe/Istanbul.
NOW_TRT_H=$(date +%H)
NOW_TRT_M=$(date +%M)
NOW_TRT_S=$(date +%S)
TARGET_H=7
TARGET_MIN=$((7 * 3600))
NOW_MIN=$((10#$NOW_TRT_H * 3600 + 10#$NOW_TRT_M * 60 + 10#$NOW_TRT_S))

if [ "$NOW_MIN" -lt "$TARGET_MIN" ]; then
  SLEEP_SEC=$((TARGET_MIN - NOW_MIN))
  log "Sleeping ${SLEEP_SEC}s until 07:00 Europe/Istanbul for TG send"
  sleep "$SLEEP_SEC"
else
  log "Past 07:00 TRT already — sending TG now"
fi

# Build TG message (Markdown-lite, no telegram-reserved special chars)
SUMMARY_MSG="🌅 Revela Gece Vardiyası — ${DATE}

"
if [ -f "$REPORT_DIR/phase1_summary.json" ]; then
  P1_CHECKED=$(node -e "console.log(require('$REPORT_DIR/phase1_summary.json').checked || 0)" 2>/dev/null || echo "?")
  P1_DEAD=$(node -e "console.log(require('$REPORT_DIR/phase1_summary.json').flagged_dead || 0)" 2>/dev/null || echo "?")
  P1_RECOV=$(node -e "console.log(require('$REPORT_DIR/phase1_summary.json').recovered || 0)" 2>/dev/null || echo "?")
  SUMMARY_MSG+="1️⃣ Affiliate: ${P1_CHECKED} re-check, ${P1_DEAD} dead, ${P1_RECOV} recovered
"
fi
if [ -f "$REPORT_DIR/phase2_summary.json" ]; then
  P2_CHECKED=$(node -e "console.log(require('$REPORT_DIR/phase2_summary.json').checked || 0)" 2>/dev/null || echo "?")
  P2_BROKEN=$(node -e "console.log(require('$REPORT_DIR/phase2_summary.json').broken_count || 0)" 2>/dev/null || echo "?")
  P2_UP=$(node -e "console.log(require('$REPORT_DIR/phase2_summary.json').url_upgrade_applied || 0)" 2>/dev/null || echo "?")
  SUMMARY_MSG+="2️⃣ Image: ${P2_CHECKED} kontrol, ${P2_BROKEN} broken, ${P2_UP} upgraded
"
fi
if [ -f "$REPORT_DIR/phase3_summary.json" ]; then
  P3_DRIFT=$(node -e "console.log(require('$REPORT_DIR/phase3_summary.json').drift_events || 0)" 2>/dev/null || echo "?")
  SUMMARY_MSG+="3️⃣ Price: ${P3_DRIFT} drift
"
fi
if [ -f "$REPORT_DIR/phase4_summary.json" ]; then
  P4_DUP=$(node -e "console.log(require('$REPORT_DIR/phase4_summary.json').duplicate_candidates || 0)" 2>/dev/null || echo "?")
  P4_MISS=$(node -e "console.log(require('$REPORT_DIR/phase4_summary.json').missing_inci_cosmetic || 0)" 2>/dev/null || echo "?")
  SUMMARY_MSG+="4️⃣ Data Quality: ${P4_DUP} dup, ${P4_MISS} missing INCI
"
fi

SUMMARY_MSG+="
📝 Tam rapor: MORNING_REPORT_REVELA_${DATE_COMPACT}.md"

# Send via curl POST to keep message size safe
log "Sending TG notification to chat $TG_CHAT"
curl -s -X POST "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
  --data-urlencode "chat_id=${TG_CHAT}" \
  --data-urlencode "text=${SUMMARY_MSG}" \
  --data-urlencode "parse_mode=HTML" \
  --data-urlencode "disable_web_page_preview=true" \
  > "$LOG_DIR/tg_response.json" 2>&1

TG_OK=$(node -e "try { const r=require('$LOG_DIR/tg_response.json'); console.log(r.ok?'1':'0') } catch(e){ console.log('0') }" 2>/dev/null || echo "0")
if [ "$TG_OK" = "1" ]; then
  log "TG sent OK"
else
  log "TG send FAILED (see $LOG_DIR/tg_response.json)"
fi

log "================================"
log "Revela Night Shift COMPLETE"
log "================================"
