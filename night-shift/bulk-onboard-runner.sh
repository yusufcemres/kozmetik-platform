#!/usr/bin/env bash
# Sequentially onboard every _ready/*.json via onboard-supplement.ts --yes.
# Logs each product's output, tracks success/fail, writes summary JSON.
#
# Usage: ./night-shift/bulk-onboard-runner.sh
# Env:   NEON DB creds (via .env) — run-prod.sh handles
#        ANTHROPIC_API_KEY optional (Stage 2 product-research may use Claude)

set -u  # no -e — we want to continue on failure

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
READY_DIR="$ROOT/apps/api/src/database/seeds/products-queue/_ready"
FAILED_DIR="$ROOT/apps/api/src/database/seeds/products-queue/_failed"
LOG_DIR="$ROOT/night-shift/logs/supplement-sprint/onboard"
SUMMARY="$ROOT/night-shift/logs/supplement-sprint/onboard-summary.json"

mkdir -p "$LOG_DIR" "$FAILED_DIR"

SUCCESS=0
FAIL=0
SKIPPED=0
TOTAL=0
START_TS=$(date +%s)
FAILED_LIST=()
SUCCESS_LIST=()

cd "$ROOT"

for f in "$READY_DIR"/*.json; do
  [ -e "$f" ] || { echo "No _ready/*.json files — nothing to onboard."; break; }
  TOTAL=$((TOTAL + 1))
  BASENAME="$(basename "$f" .json)"
  LOG_FILE="$LOG_DIR/$BASENAME.log"

  echo ""
  echo "=== [$TOTAL] $BASENAME ==="

  # Run onboard-supplement with --yes (no interactive). Allow Stage 4 QA (patron wants quality).
  # Use absolute path since run-prod.sh cd's to apps/api before invoking.
  ABS_PATH="$READY_DIR/$BASENAME.json"

  if bash ./run-prod.sh src/scripts/onboarding/onboard-supplement.ts "$ABS_PATH" --yes > "$LOG_FILE" 2>&1; then
    echo "    OK  $BASENAME"
    SUCCESS=$((SUCCESS + 1))
    SUCCESS_LIST+=("$BASENAME")
  else
    EXIT=$?
    echo "    FAIL $BASENAME (exit $EXIT) — see $LOG_FILE"
    FAIL=$((FAIL + 1))
    FAILED_LIST+=("$BASENAME")
    mv "$f" "$FAILED_DIR/" 2>/dev/null || true
  fi

  # Brief breathing room for Neon pooler + scoring endpoint
  sleep 2

  # Every 10 products, print progress
  if [ $((TOTAL % 10)) -eq 0 ]; then
    ELAPSED=$(( $(date +%s) - START_TS ))
    echo "--- Progress: $TOTAL done, $SUCCESS ok, $FAIL fail, ${ELAPSED}s elapsed ---"
  fi
done

END_TS=$(date +%s)
DURATION=$((END_TS - START_TS))

cat > "$SUMMARY" <<EOF
{
  "total": $TOTAL,
  "success": $SUCCESS,
  "fail": $FAIL,
  "duration_sec": $DURATION,
  "finished_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "successes": [$(printf '"%s",' "${SUCCESS_LIST[@]}" | sed 's/,$//')],
  "failures": [$(printf '"%s",' "${FAILED_LIST[@]}" | sed 's/,$//')]
}
EOF

echo ""
echo "============================================"
echo "BULK ONBOARD COMPLETE"
echo "  Total:   $TOTAL"
echo "  Success: $SUCCESS"
echo "  Fail:    $FAIL"
echo "  Time:    ${DURATION}s"
echo "  Summary: $SUMMARY"
echo "============================================"
