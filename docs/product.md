# Product — Stand Reminder V1

## Goal

Help users remember to stand during configured days while using Chrome or Brave.

## User

A desktop browser user who sits for long periods and wants a lightweight nudge.

## Settings

| Setting | V1 rule |
|---|---|
| Active days | User-selectable weekdays (e.g. Mon–Fri) |
| Reminder interval | One shared interval for all active days (user-defined, e.g. 45 min) |
| Snooze duration | Fixed at 10 minutes, not configurable |

## Behavior

1. On browser startup, begin the interval timer from zero.
2. On an active day, show a browser notification after the interval elapses.
3. Each notification offers two actions:
   - **Snooze 10 min** — next reminder in 10 minutes.
   - **Dismiss** — resume the normal interval cycle.
4. On inactive days, show no reminders.
5. All configuration lives in browser-local extension storage (`chrome.storage.local`).
6. While a reminder is outstanding (notification visible), the toolbar badge shows `!`. Snoozing, dismissing, or closing the notification clears it.

## Acceptance criteria

- [ ] User can select active days and they persist across restarts.
- [ ] User can set one reminder interval and it persists.
- [ ] Fresh browser start restarts the timer; no stale timers fire immediately.
- [ ] Notification appears after the interval on an active day.
- [ ] Snooze delays exactly one cycle by 10 minutes.
- [ ] Dismiss resumes the normal interval.
- [ ] No notification on inactive days.
- [ ] Works in both Chrome and Brave (Chromium Manifest V3).

## Non-goals for V1

- Accounts, sync, backend, analytics, or tracking.
- Active-hours scheduling.
- Per-day intervals.
- Custom snooze duration.
- Physical-activity detection.
- Mobile support.
- Health claims.
