# AI-assisted development workflow

This repository includes optional OpenCode resources for turning an idea into a
documented, planned, implemented, and reviewed change. They are development
helpers; OpenCode is not required to install or use the extension.

## Setup

Install [OpenCode V2](https://opencode.ai/v2/docs/) and open it from the
repository root. OpenCode discovers `opencode.jsonc`, `AGENTS.md`, and the
`.opencode/` resources automatically; no project-specific global configuration
is required.

## Intended workflow

```text
Feature idea
    │
    ▼
/define-feature
    │
    ▼
Product agent: clarify behavior and propose updates
    │
    ▼
Human approval and source-of-truth documentation
    │
    ▼
/plan-feature
    │
    ▼
Architect agent: smallest technical plan and verification
    │
    ▼
Human approval
    │
    ▼
Build agent + chrome-extension skill: implementation
    │
    ▼
/review
    │
    ▼
Reviewer agent: findings and approve/request-changes verdict
```

The human approval points are intentional. Agents must not invent ambiguous
product behavior or expand V1 scope silently.

## Commands

### Define a feature

```text
/define-feature Add an option to ...
```

This invokes the read-only `product` subagent. It compares the idea with
`docs/product.md` and accepted records in `docs/decisions/`, then returns a
clarified requirement, acceptance criteria, edge cases, non-goals, and open
questions. It does not edit code.

### Plan an approved feature

```text
/plan-feature <approved requirement>
```

This invokes the read-only `architect` subagent. It reads the product and
architecture documents and proposes the smallest implementation plan, including
files, alarm/notification/storage behavior, and verification. It does not edit
code.

### Review current changes

```text
/review
```

This invokes the read-only `reviewer` subagent. It can inspect Git status and
diffs but cannot edit files or run unrelated shell commands. It reports findings
in severity order and ends with an approve or request-changes verdict.

## Implementation

After the requirement and plan are approved, the default Build agent performs
the implementation. For extension runtime work, it should load the
`chrome-extension` skill before editing. The skill contains project-specific
Manifest V3, alarm, notification, storage, and verification rules.

Implementation remains constrained by `AGENTS.md`:

1. Update the relevant source-of-truth documentation first.
2. Implement only the approved plan.
3. Verify the result with automated checks when available and the manual
   checklist in `docs/architecture.md`.
4. Keep commits focused and use Conventional Commit messages.

## Resource map

| Resource | Purpose |
|---|---|
| `opencode.jsonc` | Selects the default agent and enforces project tool permissions. |
| `AGENTS.md` | Supplies product, workflow, scope, and technical instructions to agents. |
| `.opencode/agents/product.md` | Defines the requirements-clarification subagent. |
| `.opencode/agents/architect.md` | Defines the technical-planning subagent. |
| `.opencode/agents/reviewer.md` | Defines the read-only diff-review subagent. |
| `.opencode/commands/define-feature.md` | Routes `/define-feature` to the product agent. |
| `.opencode/commands/plan-feature.md` | Routes `/plan-feature` to the architect agent. |
| `.opencode/commands/review.md` | Routes `/review` to the reviewer agent. |
| `.opencode/skills/chrome-extension/SKILL.md` | Provides on-demand implementation guidance for this extension. |

Agent and command files are discovered automatically. A skill's full guidance
is loaded only when an agent invokes that skill. The custom agents are
subagents; the general Build agent remains the default interactive agent.

## Safety and release boundaries

The project configuration requires approval for general shell commands, permits
read-only Git inspection, denies `git push`, and denies reading `.env` files.
Agents must not commit secrets or work directly on `main` or `master`.

Publishing remains a maintainer action: push a feature branch, open a pull
request, review it, and merge it through GitHub rather than pushing directly to
the default branch.
