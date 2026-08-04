#!/usr/bin/env bash
# Seed the database for every app with a single command.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [[ -d .venv ]]; then
  VENV_PYTHON=".venv/bin/python"
else
  VENV_PYTHON="python3"
fi

echo "== Running migrations =="
"$VENV_PYTHON" manage.py migrate --noinput

echo ""
echo "== Seeding all apps =="
"$VENV_PYTHON" seed_all.py

echo ""
echo "Seed complete."
