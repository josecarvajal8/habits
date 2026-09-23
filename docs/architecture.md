# Architecture — Stand Reminder V1

## Phase 0 — Extension scaffold (current)

Loadable hello-world only: `manifest.json` plus a static popup (`src/popup.html`, `src/popup.css`). No permissions, no background service worker, no alarms, no notifications, no storage, no options page. Those arrive with the reminder milestone.

## Test slice — Alerts and badge (current branch)

Popup **Test reminder** button sends a message to the service worker, which shows one notification and sets the toolbar badge to `!` (outstanding reminder). Clicking or closing the notification clears the badge. No alarms, no settings, no storage, no Snooze/Dismiss yet.

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

1. `onInstalled` / `onStartup` / settings change → (re)create repeating alarm with `periodInMinutes = intervalMinutes`.
2. Alarm fires → check current weekday against `activeDays`.
3. Active day → `notifications.create`. Inactive day → do nothing, wait for next alarm.
4. Button click:
   - Snooze → one-shot `alarms.create({ delayInMinutes: 10 })`.
   - Dismiss → do nothing; periodic alarm continues.
5. Options page reads/writes `chrome.storage.local`; on change, background rebuilds the alarm.

Browser startup always rebuilds the periodic alarm from stored settings, giving the "fresh cycle" behavior.

## Reliability notes

- Service workers suspend; all timer state must be re-derivable from `chrome.storage.local` + alarms, not in-memory variables.
- Keep one named periodic alarm (e.g. `stand-reminder`) plus one transient snooze alarm (e.g. `stand-snooze`). Clear/recreate on settings change to avoid duplicates.
- Day check uses local time at fire time.

## Verification (manual for V1)

- Load via `chrome://extensions` → Developer mode → Load unpacked.
- Set interval to a small test value, select today, restart browser, confirm fresh timer.
- Confirm notification, Snooze (10 min), Dismiss, and no notification on deselected day.
