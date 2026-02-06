#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

OG_IMAGE_URL="https://rbediner.github.io/romanbediner.com/assets/og-logo/og.png"
OG_IMAGE_PATH="$ROOT_DIR/assets/og-logo/og.png"

PAGES=(
  "$ROOT_DIR/index.html"
  "$ROOT_DIR/about.html"
  "$ROOT_DIR/services.html"
  "$ROOT_DIR/contact.html"
)

fail=0

if [[ ! -f "$OG_IMAGE_PATH" ]]; then
  echo "FAIL: OG image file not found at $OG_IMAGE_PATH"
  fail=1
fi

for page in "${PAGES[@]}"; do
  if [[ ! -f "$page" ]]; then
    echo "FAIL: Missing page $page"
    fail=1
    continue
  fi

  count_og_image=$(grep -c 'property="og:image"' "$page" || true)
  count_tw_image=$(grep -c 'name="twitter:image"' "$page" || true)

  if [[ "$count_og_image" -ne 1 ]]; then
    echo "FAIL: $page has $count_og_image og:image tags"
    fail=1
  fi
  if [[ "$count_tw_image" -ne 1 ]]; then
    echo "FAIL: $page has $count_tw_image twitter:image tags"
    fail=1
  fi

  if ! grep -q "$OG_IMAGE_URL" "$page"; then
    echo "FAIL: $page does not reference $OG_IMAGE_URL"
    fail=1
  fi
done

if [[ "$fail" -eq 0 ]]; then
  echo "PASS: OG image file exists and all pages reference $OG_IMAGE_URL exactly once."
  exit 0
fi

exit 1
