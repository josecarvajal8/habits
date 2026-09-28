# Contributing

Thank you for helping improve Stand Reminder.

## Branch and review policy

- Do not push directly to the default branch.
- Create a focused branch for each change.
- Submit changes through a pull request.
- Only maintainers merge pull requests after review.

Public repository access does not grant write access. The repository's GitHub
ruleset should require a pull request before changes can reach the default
branch.

## Before implementation

1. Check `docs/product.md` and `docs/decisions/` for the current product scope.
2. Clarify ambiguous behavior instead of guessing.
3. Update the relevant product, architecture, or decision document before code.
4. Keep the change limited to the agreed requirement.

## Technical requirements

- Chromium Manifest V3, compatible with Chrome and Brave.
- Plain HTML, CSS, and JavaScript with no build step.
- Use `chrome.alarms` for service-worker timers.
- Keep permissions limited to `alarms`, `notifications`, and `storage`.
- Store settings in `chrome.storage.local`; do not add networking, sync,
  analytics, or tracking.

## Pull-request checklist

- Review the diff for unrelated files and sensitive data.
- Run the manual checklist in `docs/architecture.md`.
- Update documentation when behavior or architecture changes.
- Use a concise Conventional Commit message such as `feat:`, `fix:`, or `docs:`.
