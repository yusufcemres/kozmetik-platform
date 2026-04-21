#!/usr/bin/env bash
# Run a ts-node script against prod Neon DB by parsing DATABASE_URL into DB_* vars.
# Usage: ./run-prod.sh <relative-script-path-from-apps/api>
set -e
cd "$(dirname "$0")"

export TMP_ENV="$(mktemp)"
trap "rm -f '$TMP_ENV'" EXIT

node <<'JS'
require('dotenv').config();
const url = new URL(process.env.DATABASE_URL);
const fs = require('fs');
const out = [
  'DB_HOST=' + url.hostname,
  'DB_PORT=' + (url.port || 5432),
  'DB_USER=' + url.username,
  'DB_PASS=' + decodeURIComponent(url.password),
  'DB_NAME=' + url.pathname.slice(1).split('?')[0],
].join('\n');
fs.writeFileSync(process.env.TMP_ENV, out);
JS

set -a
. "$TMP_ENV"
set +a
export DB_SSL=true
export DB_MIGRATIONS_RUN=false
export DB_SYNC=false
export NODE_ENV=production
export SKIP_DB=false

cd apps/api
npx ts-node -r tsconfig-paths/register -P tsconfig.scripts.json "$@"
