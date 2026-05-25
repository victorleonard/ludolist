#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"
if [[ ! -d node_modules ]]; then
  echo "gluestack-mcp: run npm install in tools/gluestack-mcp" >&2
  exit 1
fi
exec node "$ROOT/index.js"
