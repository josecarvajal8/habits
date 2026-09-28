# Architecture — Stand Reminder V1

## Overview

Stand Reminder is a dependency-free Chromium Manifest V3 extension for Chrome
and Brave. It uses plain HTML, CSS, and JavaScript with no build step. Runtime
state is recoverable from `chrome.storage.local` and `chrome.alarms`; the
service worker never depends on in-memory timers.

## Runtime components

```text
manifest.json          MV3 manifest, permissions, and entry points
src/background.js      Alarm, notification, badge, and cycle transitions
src/settings.js        Shared defaults, validation, and work-window helpers
src/options.html|js    Auto-saving settings interface
src/popup.html|js      Current status, countdown, and immediate actions
src/styles/            Shared visual tokens and component styles
```

The extension requires only `alarms`, `notifications`, and `storage`. It makes
no external network requests.

## Settings and persisted state

User settings live in `chrome.storage.local`:

```text
{
  activeDays: number[],
  intervalMinutes: 30 | 45 | 60 | 90,
  activityMode: 'stretch-break' | 'standing-desk',
  activityDurationMinutes: number,
  workHours: { enabled: boolean, start: 'HH:MM', end: 'HH:MM' }
}
```

Defaults are Monday–Friday, a 45-minute reminder interval, stretch break, a
10-minute activity duration, and work hours disabled with a 09:00–17:00
local-time window. Activity duration must be a whole number from 1–60.
Work-hour windows must start before they end; overnight windows are outside V1
scope.

The worker stores cycle status separately under `cycle`:

```text
{ phase, nextAt, mode }
```

The popup uses this record to render working, awaiting, snoozed, activity, and
paused states after the service worker has suspended. Settings-change handling
ignores `cycle` writes.

## Alarm and activity cycle

The worker uses sequential one-shot alarms:

```text
Working
  ↓ configured interval (`work`)
Reminder awaiting action
  ├─ Start activity → Activity (`activity`, configured 1–60 min)
  ├─ Snooze         → Snoozed (`snooze`, 10 min) → Reminder
  └─ Close/click    → Working (fresh interval)

Activity
  ↓ configured activity duration
Completion notification + automatically restart Working
```

The fourth alarm, `wakeup`, parks the worker until the next enabled work window.
Only one of `work`, `snooze`, `activity`, or `wakeup` is scheduled at a time;
every transition clears all four before creating the next alarm.

## Work-window behavior

The worker checks the local weekday and optional work hours when a work or
snooze alarm fires. Outside an enabled window it schedules `wakeup` for the next
active window. When `wakeup` fires, a complete work interval begins, so a
reminder does not appear immediately at opening time.

When work hours are disabled, inactive times are rechecked after a fresh work
interval. With no active days, notifications remain silent and the popup shows
Paused without a resume time.

A snooze that crosses closing time follows the same inactive path. An activity
that finishes after closing still shows its completion notification, then parks
until the next window.

## Notifications and badge

The reminder notification has two buttons:

1. **Start break** or **Start standing** starts the selected activity timer for
   the configured duration.
2. **Snooze 10 min** schedules the fixed snooze alarm.

Clicking the reminder body or closing it is treated as Ignore and starts a fresh
work interval. Programmatic notification clears also trigger `onClosed`, so the
worker acts only when `byUser === true`.

The toolbar badge shows `!` while a reminder or completion notification is
outstanding. Completion automatically starts the next work interval; clicking
or closing that notification only clears the badge.

## Lifecycle and data flow

1. `onInstalled`, `onStartup`, or a settings change loads stored settings.
2. If the current time is active, the worker schedules a fresh `work` alarm;
   otherwise it parks on `wakeup` when a future enabled window exists.
3. A `work` or `snooze` alarm rechecks the current day and time before notifying.
4. Reminder actions schedule `activity`, `snooze`, or a fresh `work` interval.
5. An `activity` alarm shows completion and automatically re-enters the cycle.
6. The popup can start or end an activity through `start-now` and `end-now`
   messages, using the same worker transitions.

## Reliability and privacy

- Service workers suspend, so timers use `chrome.alarms`, never `setTimeout` or
  `setInterval` in the worker.
- Startup always rebuilds scheduling from stored settings instead of trusting
  stale in-memory state.
- Day and time checks use the browser's local time at alarm fire time.
- Settings remain in `chrome.storage.local`; there is no sync, backend,
  analytics, or tracking.

## Verification (manual for V1)

1. Open `chrome://extensions` or `brave://extensions`, enable Developer mode,
   and load the repository folder unpacked.
2. Select today and a short test interval, then restart the browser and confirm
   that a fresh interval begins.
3. Set the activity duration to a valid value, confirm Start uses it for both
   activity modes, completion notifies, and the next work interval starts.
4. Confirm Snooze delays the reminder by exactly 10 minutes.
5. Confirm clicking or closing a reminder starts a fresh interval.
6. Confirm inactive days and times stay silent, and an enabled future work
   window shows `Paused until …` before beginning a full interval.
7. Confirm the popup status, countdown, next time, and toolbar badge follow each
   transition accurately.
