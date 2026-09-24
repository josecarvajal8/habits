# ADR 0005 — Adopt Stand & Sit visual system

Date: 2026-09-24
Status: Accepted

## Context

The exported Stand & Sit design package provides tokens, component styles, and icons for a calmer, glanceable popup and settings page. Its product model (continuous sit/stand, daily goals, timelines, minute badge) is broader than our V1 work/activity cycle.

## Decisions

1. Reuse `tokens.css` verbatim and a curated subset of `components.css` under `src/styles/`. No remote font requests; system font stack only.
2. Popup: header with logo + Settings gear, status card (state pill, progress ring, `mm:ss` countdown ticking while open, next event), one contextual primary action. No settings tab, no timeline.
3. State mapping: Working = blue, Stretching/Standing/ due reminder = orange, Snoozed/Paused = neutral. Words always accompany color.
4. Primary action replaces the developer-facing Test reminder: Start break/standing now, End break/Sit now. Implemented as `start-now` / `end-now` worker messages reusing the cycle transitions.
5. Options page: grouped cards, day chips, interval presets, activity choices, auto-save with inline Saved feedback, no Save button.
6. Replace placeholder icons with the package PNGs (16/32/48/128).
7. Deferred: timeline/goals, minute badge, stateful toolbar icons, Pause, bundled Manrope, work hours (next branch).

## Consequences

- Popup and options markup rewritten around `ss-*` classes; old `popup.css` / `options.css` removed.
- Worker gains `start-now` / `end-now` handlers; `test-reminder` retained as a dev path.
