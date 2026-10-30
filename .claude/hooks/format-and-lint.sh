#!/bin/bash
FILE=$(jq -r '.tool_input.file_path')
cd "/Users/jovanix/Desktop/Claude code/05-arcade-vault"
npx prettier --write "$FILE" 2>&1 | sed 's/^/[prettier] /' >&2 || true
sed -i '' '/^[[:space:]]*$/d' "$FILE" 2>/dev/null || true
npx eslint --fix "$FILE" 2>&1 | sed 's/^/[eslint] /' >&2 || true
