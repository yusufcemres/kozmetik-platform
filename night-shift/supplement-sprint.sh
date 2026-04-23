#!/usr/bin/env bash
# Master sprint entrypoint — runs Faz 1-4 end-to-end autonomously.
#
# Usage: ./night-shift/supplement-sprint.sh
#
# Env required:
#   ANTHROPIC_API_KEY — for Claude JSON-gen
#   TAVILY_API_KEY    — for affiliate URL cross-ref (optional)
#   TG_BOT_TOKEN      — for morning Telegram send
#   TG_CHAT_ID        — target chat (default 1579089540)
#   DATABASE_URL      — Neon pooler (via .env)

set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DATE_STR=$(date +%Y%m%d)
LOG_DIR="$ROOT/night-shift/logs/supplement-sprint"
mkdir -p "$LOG_DIR"

MASTER_LOG="$LOG_DIR/sprint-$DATE_STR.log"
SINCE="$(date -u '+%Y-%m-%d %H:%M:%S')"

log() {
  local msg="$1"
  echo "[$(date +'%H:%M:%S')] $msg" | tee -a "$MASTER_LOG"
}

log "=== REVELA SUPPLEMENT SPRINT — $(date) ==="
log "Since timestamp: $SINCE"
log ""

# --------------- FAZ 0 — Prereqs ---------------
log "FAZ 0 — Prereq check"
if [ -z "${ANTHROPIC_API_KEY:-}" ]; then
  log "ERROR: ANTHROPIC_API_KEY not set"; exit 1
fi
if [ ! -f "$LOG_DIR/ready-ingredients.json" ]; then
  log "Refreshing ready-ingredients cache..."
  bash ./run-prod.sh src/scripts/night-shift/list-ready-ingredients.ts 2>&1 \
    | sed -n '/^{/,$p' > "$LOG_DIR/ready-ingredients.json"
fi
READY_COUNT=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$LOG_DIR/ready-ingredients.json','utf8')).ready_count)")
log "  Ready ingredients: $READY_COUNT"
log ""

# --------------- FAZ 1 — Scrape Orzax ---------------
log "FAZ 1 — Orzax site scrape (sitemap → product pages)"
SCRAPED_BEFORE=$(ls "$LOG_DIR/orzax-raw/"*.json 2>/dev/null | wc -l)
if [ "$SCRAPED_BEFORE" -lt 50 ]; then
  bash ./run-prod.sh src/scripts/night-shift/scan-orzax-site.ts 2>&1 | tee -a "$MASTER_LOG"
else
  log "  Skipping — $SCRAPED_BEFORE raws already present"
fi
SCRAPED_AFTER=$(ls "$LOG_DIR/orzax-raw/"*.json 2>/dev/null | wc -l)
log "  Raws total: $SCRAPED_AFTER"
log ""

# --------------- FAZ 2 — Bulk Claude JSON-gen ---------------
log "FAZ 2 — Claude JSON generation + quality gate"
bash ./run-prod.sh src/scripts/night-shift/supplement-bulk-ingest.ts --batch --skip-existing 2>&1 \
  | tee -a "$MASTER_LOG"

READY=$(ls "$ROOT/apps/api/src/database/seeds/products-queue/_ready/"*.json 2>/dev/null | wc -l)
log "  Ready JSONs: $READY"
log ""

# --------------- FAZ 3 — Bulk Onboard ---------------
log "FAZ 3 — Bulk onboard via onboard-supplement.ts"
bash ./night-shift/bulk-onboard-runner.sh 2>&1 | tee -a "$MASTER_LOG"
log ""

# --------------- FAZ 4 — Verify + Morning Report ---------------
log "FAZ 4 — Verify + morning report"
bash ./run-prod.sh src/scripts/night-shift/supplement-verify.ts --since="$SINCE" --fix-inactive 2>&1 \
  | tee -a "$MASTER_LOG"

bash ./run-prod.sh src/scripts/night-shift/supplement-ingest-report.ts --since="$SINCE" 2>&1 \
  | tee -a "$MASTER_LOG"

# --------------- FAZ 5 — Telegram send ---------------
if [ -n "${TG_BOT_TOKEN:-}" ] && [ -f "$LOG_DIR/tg-message.txt" ]; then
  TG_CHAT="${TG_CHAT_ID:-1579089540}"
  log "FAZ 5 — Telegram send to chat $TG_CHAT"
  # Use fs.readFileSync pattern (not bash string passing) to avoid Windows path/space issues
  TG_URL="https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage"
  curl -s -X POST "$TG_URL" \
    --data-urlencode "chat_id=$TG_CHAT" \
    --data-urlencode "text@$LOG_DIR/tg-message.txt" \
    > "$LOG_DIR/tg-response.json"
  log "  TG response: $(cat "$LOG_DIR/tg-response.json" | head -c 200)"
else
  log "FAZ 5 — Skipping TG send (TG_BOT_TOKEN not set)"
fi

# --------------- Done ---------------
touch "$LOG_DIR/sprint-$DATE_STR.done"
log ""
log "=== SPRINT COMPLETE ==="
log "Log: $MASTER_LOG"
log "Report: $ROOT/MORNING_REPORT_SUPPLEMENT_INGEST_$DATE_STR.md"
