# ADR 0007 — Configurable activity duration

Date: 2026-09-28
Status: Accepted

## Context

The initial settings model assigned fixed recommendations of 5 minutes for a
stretch break and 10 minutes for standing-desk activity. Users may need a
shorter or longer activity period regardless of the selected mode.

## Decisions

1. Add `activityDurationMinutes` to the settings stored in
   `chrome.storage.local`.
2. Use one duration for both stretch-break and standing-desk modes.
3. Accept whole minutes from 1–60, with a default of 10 minutes.
4. Keep snooze fixed at 10 minutes; this decision does not make snooze
   configurable.
5. Changing the activity duration follows the existing settings-change
   behavior and starts a fresh work cycle.

## Consequences

- Existing installations receive the 10-minute default when the setting is
  absent.
- Reminder copy, activity alarms, and popup progress use the saved duration.
- This decision supersedes ADR 0003's fixed activity recommendations and ADR
  0004's per-mode activity durations.
