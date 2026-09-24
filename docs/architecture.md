# Architecture — Stand Reminder V1

## Phase 0 — Extension scaffold (current)

Loadable hello-world only: `manifest.json` plus a static popup (`src/popup.html`, `src/popup.css`). No permissions, no background service worker, no alarms, no notifications, no storage, no options page. Those arrive with the reminder milestone.

## Worker logic (this branch)

Sequential one-shot alarms replace the earlier periodic-alarm design:

```text
Working
  ↓ configured interval
Reminder awaiting action
  ├─ Start activity → Activity (5 min stretch / 10 min standing)
  ├─ Snooze         → Snoozed (10 min) → Reminder
  └─ Close/click    → Working (fresh interval, "ignore")

Activity
  ↓ 5 or 10 min
Completion notification + automatically restart Working
```

Named alarms: `work`, `snooze`, `activity`. Only one is ever scheduled: every transition clears all three first. Cycle state `{ phase, nextAt, mode }` persists in `chrome.storage.local` under `cycle` so the popup can render status after worker suspension. The popup primary action starts/ends the activity immediately through `start-now` / `end-now` messages; the legacy `test-reminder` message fires an immediate real reminder through the same code path as the timer.

## UI polish (this branch)

Visual system adapted from the exported Stand & Sit design package (`tokens.css` + curated `components.css` under `src/styles/`): light/dark surfaces, blue working state, orange activity state, state pill + progress ring + countdown + next-event status card, contextual primary action (Start break/standing now, End break/Sit now), dedicated auto-saving options page with day chips, interval presets, and activity choices. Excluded for now: daily timeline/goals, minute-countdown badge, stateful toolbar icons, Pause, and bundled Manrope (system font stack, no remote requests). Extension icons replaced with the design package PNGs.

## Test slice — Alerts and badge (superseded)

Popup **Test reminder** button sends a message to the service worker, which shows one notification and sets the toolbar badge to `!` (outstanding reminder). Clicking or closing the notification clears the badge. No alarms, no settings, no storage, no Snooze/Dismiss yet.

## Settings (this branch)

Options page (`src/options.html`) edits `{ activeDays, intervalMinutes, activityMode }` in `chrome.storage.local` via the shared `src/settings.js` module (defaults: Mon–Fri, 45 min, stretch break). The popup shows a one-line summary and links to settings; the test notification text follows the saved activity mode. Timed cycles (alarms, break/standing completion, snooze) are deferred to the next branch.

## Platform

Chromium Manifest V3 extension. Compatible with Chrome and Brave. No build step required for V1; plain HTML/CSS/JS.

## Components

```text
manifest.json          # MV3 manifest, permissions, entry points
src/background.js      # service worker: alarms, day checks, notifications
src/options.html|js    # settings UI: active days + interval
src/popup.html|js      # optional lightweight status view (V1: link to options)
```

## APIs and permissions

`manifest.json` needs:

- `"permissions": ["alarms", "notifications", "storage"]`
- `"background": { "service_worker": "src/background.js" }`
- `"options_page"` pointing at the settings page.
- `"action"` for the toolbar popup.

Why:

- `alarms` — reliable interval + snooze timers that survive service-worker suspension. Do not use `setTimeout` in the worker.
- `notifications` — `chrome.notifications.create` with two buttons (`Snooze`, `Dismiss`), handled via `chrome.notifications.onButtonClicked`.
- `storage` — `chrome.storage.local` for `{ activeDays, intervalMinutes }`. Local-only satisfies V1 privacy.

## Data flow

1. `onInstalled` / `onStartup` / settings change → clear all alarms, create one-shot `work` alarm with `delayInMinutes = intervalMinutes`, persist `{ phase: 'working', nextAt }`.
2. `work`/`snooze` alarm fires → check current weekday against `activeDays`. Inactive (or no days) → schedule a fresh `work` alarm and keep checking. Active → reminder notification with Start + Snooze buttons, badge `!`, phase `awaiting`.
3. Reminder action:
   - Start → one-shot `activity` alarm (`5` min stretch / `10` min standing), phase `activity`.
   - Snooze → one-shot `snooze` alarm (`10` min), phase `snoozed`.
   - Click body / close (`byUser`) → fresh `work` alarm (“ignore”).
4. `activity` alarm fires → completion notification, badge `!`, immediately schedule a fresh `work` alarm (auto-restart).
5. Completion click/close clears the badge; the next cycle is already running.
6. Options page reads/writes `chrome.storage.local`; settings changes rebuild the work alarm. `storage.onChanged` ignores the worker's own `cycle` writes.

Browser startup always rebuilds the periodic alarm from stored settings, giving the "fresh cycle" behavior.

## Reliability notes

- Service workers suspend; all timer state must be re-derivable from `chrome.storage.local` + alarms, not in-memory variables.
- Only one alarm (`work`, `snooze`, or `activity`) is ever scheduled; every transition clears all three first.
- `notifications.clear()` fires `onClosed` with `byUser === false`; only explicit user dismissal restarts the cycle.
- Day check uses local time at fire time.

## Verification (manual for V1)

- Load via `chrome://extensions` → Developer mode → Load unpacked.
- Set interval to a small test value, select today, restart browser, confirm fresh timer.
- Confirm notification, Snooze (10 min), Dismiss, and no notification on deselected day.
