# ADR 0004 — Sequential work/activity cycle

Date: 2026-09-23
Status: Accepted, amended by ADRs 0006 and 0007

> ADR 0006 adds the `wakeup` alarm, extending the one-alarm-at-a-time rule from
> three alarm names to four. ADR 0007 replaces the per-mode activity durations
> with one configurable duration.

## Context

The earlier periodic-alarm design (Snooze/Dismiss on a repeating timer) cannot express the agreed two-state cycle: work interval → activity period → work interval, with per-mode durations.

## Decisions

1. Sequential one-shot alarms: `work` (configured interval), `snooze` (10 min), `activity` (5 min stretch / 10 min standing). Only one scheduled at a time; transitions clear all three first.
2. Reminder notification offers Start + Snooze (two-button limit). Body click or close = Ignore → fresh work interval.
3. Activity completion notifies (“Break complete” / “You can sit down”) and auto-restarts the work interval without waiting for acknowledgement.
4. Cycle state `{ phase, nextAt, mode }` persists under storage key `cycle` for popup rendering across worker restarts. Settings-change handling ignores `cycle` writes.
5. “Pause for today” / disabling the extension for a day is deferred as out of scope; no days selected = paused.
6. Popup Test reminder fires an immediate real reminder through the same code path as the timer.

## Consequences

- Adds the `alarms` permission (now `alarms`, `notifications`, `storage`).
- Supersedes the periodic-alarm data flow in `docs/architecture.md` and the skill guidance describing it.
