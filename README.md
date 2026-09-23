# Habits — Stand Reminder

Chromium (Manifest V3) browser extension. Works in Chrome and Brave.

## Requirements

- Google Chrome or Brave (desktop).
- Git.
- No package manager, dependencies, environment variables, or build step.

## Run locally

1. Open `chrome://extensions` (Chrome) or `brave://extensions` (Brave).
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this repository folder.
4. Click the extension toolbar icon to open the popup.

## Repository layout

```text
manifest.json                # extension manifest (entry point)
src/popup.html, src/popup.css # toolbar popup UI
docs/                        # product definition, architecture, decisions
.opencode/                   # agents, commands, skills
AGENTS.md                    # working rules for this repo
opencode.jsonc               # OpenCode project configuration
```

## Docs

- `docs/product.md` — what the extension should do.
- `docs/architecture.md` — how it is structured.
- `docs/decisions/` — durable technical and scope choices.
- `AGENTS.md` — how to work in this repository.
