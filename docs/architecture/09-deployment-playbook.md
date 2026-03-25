# Deployment Playbook

## Purpose

এই doc production deployment-এর current boundary explain করে।

Goal:
- আজ কী supported
- কী partially scaffolded
- কী এখনো future milestone

## Current Supported Paths

### 1. Local Developer Install

From repo root:

```bash
npm run install:local
```

This is the current supported real install path.

### 2. Dashboard Local Serve

```bash
npm run dashboard:serve
```

Then open:

```text
http://localhost:4173
```

### 3. Production Bootstrap Boundary Check

```bash
npm run install:production:check
```

This confirms that the install boundary script and plan are in place.

## Deployment Layers

### App Layer

- CLI entry
- dashboard static build
- runtime bootstrap

### State Layer

- `walkie-talkie.config.json`
- `.walkie-talkie/storage/entities.snapshot.json`
- `.walkie-talkie/storage/runtime.snapshot.json`

### Secret Layer

Supported today:

- direct config values
- env-bound secret resolution
- `env:VAR_NAME` references

Tracked env vars:

- `WALKIE_DEFAULT_AI_API_KEY`
- `WALKIE_TELEGRAM_BOT_TOKEN`

## Server-Oriented Deployment Notes

When deploying in server mode:

- use `runtime.environment = "server"`
- keep dashboard serving separate from webhook/polling runtime processes
- prefer env-backed secrets over committed config secrets
- keep `.walkie-talkie/` writable

## Telegram Runtime Notes

### Polling

- works best as a long-running worker process
- should later run through background worker contract

### Webhook

- requires:
  - `runtime.telegram.delivery.mode = "webhook"`
  - `runtime.telegram.publicBaseUrl`
  - Telegram bot token

## Not Yet Claimed As Supported

- GitHub-hosted one-line installer
- full Windows installer
- process supervisor templates
- Docker packaging
- cloud-specific deployment recipe

Those belong to later productization/distribution work:

- `M21`

## Recommended Release Sequence

1. typecheck
2. unit tests
3. integration tests
4. dashboard build + serve check
5. production boundary check
6. tag release notes
7. then publish repo/release artifact
