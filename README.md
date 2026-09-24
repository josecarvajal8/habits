# Habits — Stand Reminder

Chromium (Manifest V3) browser extension. Works in Chrome and Brave.

## Requirements

- Google Chrome or Brave (desktop).
- Git.
- macOS or Linux with `sh`, `python3` (manifest validation only), and `zip` (packaging only).
- No package manager, dependencies, or build toolchain.

## Run locally

```sh
./scripts/build.sh
```

1. Open `chrome://extensions` (Chrome) or `brave://extensions` (Brave).
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select `dist/stand-reminder/`.
4. Click the extension toolbar icon to open the popup.

## Share with testers

```sh
./scripts/build.sh --zip
```

This also creates `dist/stand-reminder-<version>.zip` (version from `manifest.json`). Testers unzip it and load the folder with **Load unpacked** as above — never the ZIP itself. `dist/` is git-ignored; share the ZIP (e.g. as a GitHub Release asset).

## Repository layout

```text
manifest.json                # extension manifest (entry point)
src/                         # popup, options, worker, styles (no external requests)
icons/                       # extension icons
scripts/build.sh             # dependency-free build + packaging (see below)
docs/                        # product definition, architecture, decisions
.opencode/                   # agents, commands, skills
AGENTS.md                    # working rules for this repo
opencode.jsonc               # OpenCode project configuration
```

## Packaging

`scripts/build.sh` copies only the runtime whitelist (`manifest.json`, `INSTALL.txt`, `src/`, `icons/`) into `dist/stand-reminder/` and validates that every manifest entry point resolves. With `--zip` it also creates the versioned tester archive. `dist/` is git-ignored; always test from the built folder, never the repo root.

## Docs

- `docs/product.md` — what the extension should do.
- `docs/architecture.md` — how it is structured.
- `docs/decisions/` — durable technical and scope choices.
- `AGENTS.md` — how to work in this repository.
