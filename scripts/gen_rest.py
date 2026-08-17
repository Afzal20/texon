#!/usr/bin/env python3
"""Regenerate lib/api/*.ts module files: swap the GraphQL helpers for the REST
helpers (lib/api/rest.ts), which hit the generic layer in backend/core/api.py.

Run from the repo root: python3 scripts/gen_rest.py
"""

import re
import sys
from pathlib import Path

API_DIR = Path(__file__).resolve().parent.parent / "frontend" / "texon-ui" / "lib" / "api"
DATA_DIR = Path(__file__).resolve().parent.parent / "frontend" / "texon-ui" / "lib" / "data"

OLD_IMPORT = 'import { gqlList, gqlGet, gqlCreate, gqlUpdate, gqlDelete } from "./graphql"'
NEW_IMPORT = 'import { restList, restGet, restCreate, restUpdate, restDelete } from "./rest"'

OLD_DATA_IMPORT = 'from "@/lib/api/graphql"'
NEW_DATA_IMPORT = 'from "@/lib/api/rest"'

RENAMES = {
    "gqlList": "restList",
    "gqlGet": "restGet",
    "gqlCreate": "restCreate",
    "gqlUpdate": "restUpdate",
    "gqlDelete": "restDelete",
}


def main() -> int:
    changed = 0
    for path in sorted(API_DIR.glob("*.ts")):
        if path.name in {"auth.ts", "ai.ts", "client.ts", "graphql.ts", "rest.ts"}:
            continue
        text = path.read_text()
        if OLD_IMPORT not in text:
            continue
        text = text.replace(OLD_IMPORT, NEW_IMPORT)
        for old, new in RENAMES.items():
            text = re.sub(rf"\b{old}\b", new, text)
        path.write_text(text)
        changed += 1
        print(f"rewrote {path.name}")

    for path in sorted(DATA_DIR.glob("*-actions.ts")):
        text = path.read_text()
        if OLD_DATA_IMPORT not in text:
            continue
        text = text.replace(OLD_DATA_IMPORT, NEW_DATA_IMPORT)
        for old, new in RENAMES.items():
            text = re.sub(rf"\b{old}\b", new, text)
        path.write_text(text)
        changed += 1
        print(f"rewrote {path.name}")

    print(f"{changed} files rewritten")
    return 0


if __name__ == "__main__":
    sys.exit(main())