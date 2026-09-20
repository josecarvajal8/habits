# Habits — Stand Reminder

A minimal Chrome / Brave (Manifest V3) extension that reminds you to stand during configured days.

## V1 scope

- Browser notification after a user-defined interval.
- Timer starts fresh on browser startup.
- Notification actions: **Snooze 10 min** and **Dismiss**.
- Settings: active weekdays + one shared reminder interval.
- Snooze is fixed at 10 minutes in V1.
- Storage is local-only via `chrome.storage.local`. No account, sync, backend, or analytics.

See `docs/product.md` for the full definition and non-goals.

## Project layout

```text
AGENTS.md                    # how to work in this repo (approval-first)
docs/product.md              # what V1 does
docs/architecture.md         # how the extension is structured
docs/decisions/              # durable choices (ADRs)
.opencode/agents/            # product, architect, reviewer profiles
.opencode/commands/          # /define-feature, /plan-feature, /review
.opencode/skills/            # reusable task guidance (e.g. chrome-extension)
opencode.jsonc               # project OpenCode configuration
src/                         # created only after design approval (not in V1 foundation)
```

## Workflow

1. Describe an idea.
2. Clarify it into `docs/product.md` acceptance criteria.
3. Approve the definition before any code.
4. Approve a small technical plan.
5. Implement only that plan.
6. Review the diff.

Details in `AGENTS.md`.
