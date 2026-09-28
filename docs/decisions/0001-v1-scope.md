# ADR 0001 — V1 scope

Date: 2026-09-20
Status: Accepted, amended by ADRs 0002, 0004, and 0006

> This record captures the initial V1 boundary. ADR 0002 adds a toolbar badge,
> ADR 0004 replaces Dismiss with the Start/Snooze activity cycle, and ADR 0006
> adds optional work hours. Those later accepted decisions take precedence.

## Context

Simple stand reminder as a Chrome/Brave extension, built as a vehicle for an approval-first agent workflow.

## Decisions

1. Browser notification only (no badge-only, tab, or sound in V1).
2. Timer starts fresh on browser startup; no cross-session elapsed-time tracking.
3. Snooze fixed at 10 minutes, exposed as a notification button alongside Dismiss.
4. Settings model: selectable active weekdays + one shared interval. No per-day intervals or active hours in V1.
5. Storage: `chrome.storage.local` only. No server, sync, or analytics.
6. Platform: Chromium Manifest V3 (Chrome + Brave), no build step for V1.

## Consequences

- Small, reviewable first implementation.
- Per-day schedules, active hours, custom snooze, and activity awareness are explicitly deferred.
- Timer reliability depends on `chrome.alarms`, not in-memory state.
