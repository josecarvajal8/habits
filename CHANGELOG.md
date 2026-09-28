# Changelog

All notable changes to Stand Reminder are documented in this file.

The project follows [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-09-28

### Added

- Manifest V3 extension support for Chrome and Brave.
- Configurable active weekdays and 30, 45, 60, or 90-minute reminder
  intervals.
- Stretch-break and standing-desk activity modes with a shared configurable
  duration from 1–60 minutes.
- Optional same-day work hours that pause reminders outside the configured
  window.
- Sequential work, activity, fixed 10-minute snooze, and wake-up alarms that
  recover after service-worker suspension.
- Reminder and completion notifications with an outstanding toolbar badge.
- Popup status, countdown, next scheduled time, and immediate activity actions.
- Responsive settings page with browser-local persistence and light/dark theme
  support.
- Dependency-free build and packaging script with installation guidance.

### Privacy

- Settings and cycle state remain in `chrome.storage.local`.
- No accounts, analytics, tracking, backend, or external network requests.
