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
4. Alarm discipline: one periodic alarm (e.g. `stand-reminder`) + one transient snooze alarm (e.g. `stand-snooze`). Rebuild on `onInstalled`, `onStartup`, and settings change.
5. Day gating: check local weekday against `activeDays` from `chrome.storage.local` at fire time.
6. Notifications: `chrome.notifications.create` with buttons `Snooze 10 min` / `Dismiss`; handle via `chrome.notifications.onButtonClicked`.
7. Snooze V1: one-shot `delayInMinutes: 10`. Dismiss: no action, periodic alarm continues.
8. Settings shape: `{ activeDays: number[], intervalMinutes: number }`, stored in `chrome.storage.local`. No sync, server, or external requests.
9. No build step in V1: plain HTML/CSS/JS. Options page writes storage; background re-creates alarms on `chrome.storage.onChanged`.

## Verification

- Load unpacked via `chrome://extensions` (Developer mode).
- Test with a short interval, confirm: fresh start resets timer, notification fires on active day, Snooze delays 10 min, Dismiss resumes, inactive day stays silent.
