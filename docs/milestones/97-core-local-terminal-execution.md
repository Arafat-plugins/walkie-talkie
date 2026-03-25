# Core Patch: Local Terminal Execution

## What changed

- added core terminal execution contract:
  - `packages/core/src/terminal-execution.ts`
- added built-in terminal skill:
  - `createLocalTerminalSkill()`
- exported both core and skill surfaces
- added unit and integration tests

## Why this patch exists

Walkie-Talkie is meant to support OpenClaw-style machine access, but that should not start as raw unrestricted shell execution.

This patch adds a safe core local terminal layer that later Telegram, dashboard, and LLM flows can use without re-inventing command execution rules each time.

## Safety model

The current terminal core is safe-by-default:

- explicit `command` + `args`
- no raw shell string execution
- allowlist support
- blocked command support
- blocked pattern support
- working-directory allowlist
- timeout support
- output capture

## Current built-in skill

`createLocalTerminalSkill()` expects:

- `input.command`
- optional `input.args`
- optional `input.cwd`
- optional `input.timeoutMs`

It returns structured terminal execution output instead of only free text.

## Verification

Verified with:

```bash
node --test --experimental-strip-types tests/unit/terminal-execution.test.ts tests/integration/local-terminal-skill.integration.test.ts
npx tsc -p tsconfig.json --noEmit
```

## Next practical use

This core patch is ready to be used by:

- Telegram machine-status flows
- dashboard-run command actions
- later remote SSH bridge design
