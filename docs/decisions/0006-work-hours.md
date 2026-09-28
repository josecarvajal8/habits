# ADR 0006 — Optional work hours

Date: 2026-09-24
Status: Accepted
Amends: 0001 and 0005

## Context

Reminders should stay quiet outside the user's workday without requiring them to toggle days or disable the extension.

## Decisions

1. Settings gain `workHours: { enabled: false, start: '09:00', end: '17:00' }`. Off by default; existing behavior unchanged until enabled.
2. Local browser time, same-day windows only in V1 (`start < end`, validated; invalid input falls back to defaults and is rejected inline in the UI).
3. Outside the window the worker parks on a one-shot `wakeup` alarm for the next window start and persists `{ phase: 'paused', nextAt }`. The wakeup handler begins one full work interval inside the window, so the first reminder is a full interval after opening.
4. Snoozes crossing closing time defer via the normal inactive path; an activity ending after close still shows its completion notification before parking.
5. Popup shows `Paused until {time}` while parked.
6. “Pause for today” stays out of scope; no days selected still means paused with no resume time.

## Consequences

- Fourth alarm name (`wakeup`); the one-alarm-at-a-time discipline now covers four names.
- Shared time helpers (`isActiveNow`, `nextResumeTime`) live in `src/settings.js` for testability.
