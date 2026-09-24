#!/bin/sh
# Build a clean, loadable copy of the Stand Reminder extension.
# No dependencies beyond POSIX sh, cp, mkdir, rm, and (for --zip) zip.
#
#   ./scripts/build.sh        -> dist/stand-reminder/
#   ./scripts/build.sh --zip  -> dist/stand-reminder/ + dist/stand-reminder-<version>.zip
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/dist/stand-reminder"
ZIP=0

if [ "${1:-}" = "--zip" ]; then
  ZIP=1
elif [ $# -gt 0 ]; then
  echo "usage: $0 [--zip]" >&2
  exit 1
fi

# Manifest must parse and expose a version for the zip name.
VERSION="$(python3 -c "import json; print(json.load(open('$ROOT/manifest.json'))['version'])")"

# Required runtime entries: every path the manifest or pages reference,
# plus the tester instructions.
for f in manifest.json INSTALL.txt \
  src/background.js src/settings.js src/popup.html src/popup.js \
  src/options.html src/options.js \
  src/styles/tokens.css src/styles/components.css \
  icons/icon-16.png icons/icon-32.png icons/icon-48.png icons/icon-128.png; do
  if [ ! -f "$ROOT/$f" ]; then
    echo "missing required file: $f" >&2
    exit 1
  fi
done

# Recreate only our own output directory; never anything else.
rm -rf "$OUT"
mkdir -p "$OUT/src/styles" "$OUT/icons"
cp "$ROOT/manifest.json" "$ROOT/INSTALL.txt" "$OUT/"
cp "$ROOT"/src/*.js "$ROOT"/src/*.html "$OUT/src/"
cp "$ROOT"/src/styles/*.css "$OUT/src/styles/"
cp "$ROOT"/icons/*.png "$OUT/icons/"

echo "built $OUT"

if [ "$ZIP" -eq 1 ]; then
  if ! command -v zip >/dev/null 2>&1; then
    echo "zip not found; folder built, skipping archive" >&2
    exit 1
  fi
  ARCHIVE="$ROOT/dist/stand-reminder-$VERSION.zip"
  rm -f "$ARCHIVE"
  (cd "$ROOT/dist" && zip -qr "stand-reminder-$VERSION.zip" stand-reminder)
  echo "packaged $ARCHIVE"
fi
