---
name: Chrome Extension
description: Guidance for building the Chromium Manifest V3 stand-reminder extension
---

# Chrome Extension (MV3) — Stand Reminder

## When to use

Building or modifying `manifest.json`, background service worker, alarms, notifications, or options/popup pages.

## Rules

1. Manifest V3 only (`"manifest_version": 3`). Must work in Chrome and Brave.
2. Permissions stay minimal: `alarms`, `notifications`, `storage`.
3. Timers: use `chrome.alarms` only. Never rely on `setTimeout`/`setInterval` in the service worker — it suspends.
4. Alarm discipline: sequential one-shot alarms (`work`, `snooze`, `activity`); only one scheduled at a time — every transition clears all three first. Rebuild a fresh `work` alarm on `onInstalled`, `onStartup`, and settings change.
5. Day gating: check local weekday against `activeDays` from `chrome.storage.local` at fire time. Inactive or empty days stay silent; keep rechecking each interval.
6. Notifications: reminder with `Start break/standing` + `Snooze 10 min` buttons via `chrome.notifications.onButtonClicked`. Body click or close (`byUser`) = ignore → fresh work interval. Completion notification auto-restarts work; its click/close only clears the badge. Guard `onClosed` with `byUser` since programmatic clears also fire it.
7. Snooze V1: one-shot `delayInMinutes: 10`. Activity: `5` min stretch break, `10` min standing desk. Persist `{ phase, nextAt, mode }` under storage key `cycle` for popup status; settings-change handling must ignore `cycle` writes.
8. Settings shape: `{ activeDays: number[], intervalMinutes: number, activityMode: 'stretch-break' | 'standing-desk' }`, stored in `chrome.storage.local`. No sync, server, or external requests.
9. No build step in V1: plain HTML/CSS/JS. Options page writes storage; background re-creates alarms on `chrome.storage.onChanged`.

## Verification

- Load unpacked via `chrome://extensions` (Developer mode).
- Test with a short interval, confirm: fresh start resets timer; Start schedules 5/10 min by mode; completion notifies and auto-restarts; Snooze delays 10 min; close/ignore restarts a fresh interval; inactive day stays silent; popup status and next time are accurate.
