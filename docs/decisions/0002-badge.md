# ADR 0002 — Toolbar badge for outstanding reminders

Date: 2026-09-23
Status: Accepted
Amends: 0001 (which scoped V1 to notifications only, no badge)

## Context

A notification alone can be missed or dismissed without acting. A lightweight toolbar signal makes an outstanding reminder visible until resolved.

## Decision

The toolbar badge shows `!` while a stand reminder is outstanding and is cleared when the user snoozes, dismisses, clicks, or closes the notification. No countdown, no persistent status badge.

## Consequences

- `manifest.json` keeps minimal permissions; badge uses the `action` API, no new permission.
- First delivery is a test slice: popup button triggers one notification plus badge, without scheduling or settings.
