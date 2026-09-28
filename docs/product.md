# Product — Stand Reminder V1

## Goal

Help users remember to stand during configured days while using Chrome or Brave.

## User

A desktop browser user who sits for long periods and wants a lightweight nudge.

## Settings

| Setting | V1 rule |
|---|---|
| Active days | User-selectable weekdays (e.g. Mon–Fri); no days selected pauses reminders |
| Work hours | Optional, off by default; when enabled, same-day window (default 09:00–17:00 local) |
| Reminder interval | Preset: 30, 45, 60, or 90 minutes; default 45 |
| Activity mode | Stretch break (move/stretch 5 min, default) or standing desk (work standing 10 min) |
| Snooze duration | Fixed at 10 minutes, not configurable |

## Behavior

1. On install and browser startup, begin a fresh work interval from zero.
2. On an active day, show a reminder notification after the interval with two actions (at most two buttons are allowed):
   - **Start break / Start standing** — begins the activity timer: 5 minutes for stretch break, 10 minutes for standing desk.
   - **Snooze 10 min** — the reminder fires again in 10 minutes.
   - Closing the notification or clicking its body = **Ignore**, which restarts a fresh work interval.
3. When the activity timer ends, show a completion notification (“Break complete” / “You can sit down”) and automatically start the next work interval.
4. On inactive days, with no days selected, or outside enabled work hours, show no reminders; the worker sleeps until the next window opens, then begins one full interval before the first reminder. The popup shows `Paused until …`.
5. The popup shows live cycle status (working, snoozed, stretching, standing, awaiting action, paused) plus the next scheduled time.
6. All configuration lives in browser-local extension storage (`chrome.storage.local`).
7. While a reminder or completion notification is outstanding, the toolbar badge shows `!`. Acting on it, or clicking/closing it, clears the badge.

## Acceptance criteria

- [ ] User can select active days and they persist across restarts.
- [ ] User can optionally enable same-day work hours, and the setting persists.
- [ ] User can set one reminder interval and it persists.
- [ ] Fresh browser start restarts the timer; no stale timers fire immediately.
- [ ] Notification appears after the interval on an active day.
- [ ] Start begins a 5-minute (stretch) or 10-minute (standing desk) activity timer.
- [ ] Completion notification appears and the next work interval starts automatically.
- [ ] Snooze delays exactly one cycle by 10 minutes.
- [ ] Closing/ignoring restarts a fresh work interval.
- [ ] No notification on inactive days, with no days selected, or outside work hours.
- [ ] Popup shows accurate cycle status and next time, including `Paused until …`.
- [ ] Works in both Chrome and Brave (Chromium Manifest V3).

## Non-goals for V1

- Accounts, sync, backend, analytics, or tracking.
- Per-day intervals.
- Custom snooze duration.
- Physical-activity detection.
- Mobile support.
- Health claims.
