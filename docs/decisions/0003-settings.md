# ADR 0003 — Initial settings model

Date: 2026-09-23
Status: Accepted, amended by ADRs 0004, 0006, and 0007

> ADR 0004 delivers the timed cycle that this record deferred. ADR 0006 adds
> `workHours` to the settings shape. ADR 0007 replaces the fixed activity
> recommendations with one configurable duration.

## Context

Reminders need user-configurable days and frequency, plus an activity recommendation that differs for standing-desk owners.

## Decisions

1. Settings shape: `{ activeDays: number[], intervalMinutes: number, activityMode: 'stretch-break' | 'standing-desk' }` in `chrome.storage.local`.
2. Defaults: Monday–Friday, 45 minutes, stretch break.
3. Frequency presets: 30, 45, 60, 90 minutes (no free-form input in V1).
4. Stretch break recommends moving/stretching for 5 minutes; standing-desk mode recommends working standing for 10 minutes. Durations are suggestion text, not configurable.
5. No days selected means reminders pause.
6. Shared `src/settings.js` module (classic script) used by the options page, popup, and service worker via `importScripts`, with sanitizing on load and save.
7. This branch delivers settings persistence and preview only; timed work/break cycles come next.

## Consequences

- Adds the `storage` permission and an options page.
- Test reminder text follows the saved activity mode.
