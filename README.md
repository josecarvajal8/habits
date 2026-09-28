# Habits — Stand Reminder

A lightweight Chromium Manifest V3 extension that reminds you to stand or take
a short movement break. It works in Google Chrome and Brave and keeps all
settings in local browser storage.

## Requirements

- Google Chrome or Brave on desktop.
- No package manager, dependencies, environment variables, or build step.
- Git is optional; you can also download the repository as a ZIP.

## Install and run locally

1. Get the source:
   - Clone it with `git clone https://github.com/josecarvajal8/habits.git`, or
   - Use **Code → Download ZIP** on GitHub and extract the archive.
2. Open `chrome://extensions` in Chrome or `brave://extensions` in Brave.
3. Enable **Developer mode**.
4. Select **Load unpacked**.
5. Choose the repository folder containing `manifest.json`.
6. Pin **Stand Reminder** from the browser's extensions menu if desired.
7. Open the toolbar popup, then use its Settings button to configure active
   days, reminder interval, activity mode, and optional work hours.

After pulling or downloading an update, return to the extensions page and click
the extension's **Reload** button.

## Privacy

The extension uses `chrome.storage.local`. It has no accounts, synchronization,
backend, analytics, tracking, or external network requests.

## Share with testers

```sh
./scripts/build.sh --zip
```

This also creates `dist/stand-reminder-<version>.zip` (version from `manifest.json`). Testers unzip it and load the folder with **Load unpacked** as above — never the ZIP itself. `dist/` is git-ignored; share the ZIP (e.g. as a GitHub Release asset).

## Repository layout

```text
manifest.json                 Extension manifest and entry points
src/                          Plain HTML, CSS, and JavaScript runtime
icons/                        Extension icons
docs/                         Product, architecture, decisions, AI workflow
.opencode/                    Project agents, commands, and skills
AGENTS.md                     Rules for AI-assisted work in this repository
opencode.jsonc                OpenCode project configuration and permissions
```

## Documentation

- [`docs/product.md`](docs/product.md) — product behavior and V1 scope.
- [`docs/architecture.md`](docs/architecture.md) — runtime design and manual verification.
- [`docs/decisions/`](docs/decisions/) — durable product and technical decisions.
- [`docs/ai-workflow.md`](docs/ai-workflow.md) — optional OpenCode-assisted development workflow.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — branch and pull-request policy.

OpenCode is not required to install or use the extension.

## Contributions

Do not push directly to the default branch. Use a separate branch and pull
request so changes can be reviewed before merging. See
[`CONTRIBUTING.md`](CONTRIBUTING.md).

## License

Licensed under the [MIT License](LICENSE).
