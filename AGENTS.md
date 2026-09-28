# Habits — Project Instructions

## Purpose

Stand-reminder browser extension (Chrome/Brave, Manifest V3). V1 source of truth: `docs/product.md`.

## Approval-first workflow (mandatory)

1. Discuss ambiguity — do not invent product behavior. Ask when requirements are unclear.
2. Update the relevant doc (`docs/product.md`, `docs/architecture.md`, or `docs/decisions/`) before implementation.
3. Propose a short plan before multi-file changes and wait for approval.
4. Implement only the approved plan. Do not expand scope without approval.
5. Run verification after changes (typecheck/lint if added; otherwise the manual checklist in `docs/architecture.md`).
6. Keep commits atomic and conventional (`feat:`, `fix:`, `docs:`, ...), title under 72 chars. Never commit secrets or `.env` values. Never commit directly to `main`/`master`.

## Scope guardrails

- V1 uses notifications plus an outstanding badge, startup-based timing, fixed 10-min snooze, active days, optional same-day work hours, one shared interval, and `chrome.storage.local` only.
- Out of scope without an approved decision: backends, sync, analytics, per-day intervals, custom snooze, activity detection, mobile.
- If a request conflicts with `docs/product.md`, say so and propose a doc update first.

## Technical rules

- Manifest V3 only. Use `chrome.alarms` for timers (never `setTimeout` in the service worker).
- Service worker must rebuild state from `chrome.storage.local` + alarms; no in-memory timer assumptions.
- Permissions stay minimal: `alarms`, `notifications`, `storage`.
- No build step in V1; plain HTML/CSS/JS under `src/`.
- No external network calls from the extension.
