#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_DIR="/mnt/c/Users/Rafael Carvalho/Documents/plugins-development/.obsidian/plugins/sync-obsidian-notes-with-sop"

BUILD_FILES=(
  "main.js"
  "manifest.json"
  "styles.css"
)

mkdir -p "$TARGET_DIR"

for file in "${BUILD_FILES[@]}"; do
  SOURCE_FILE="$ROOT_DIR/$file"

  if [[ ! -f "$SOURCE_FILE" ]]; then
    echo "Missing build artifact: $SOURCE_FILE" >&2
    exit 1
  fi

  cp "$SOURCE_FILE" "$TARGET_DIR/$file"
done

echo "Copied build artifacts to: $TARGET_DIR"
