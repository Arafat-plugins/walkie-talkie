# M20-S5: Release Readiness and Deployment Docs

## Summary

This step closes the productization milestone by adding release-oriented operational docs.

## Added

- `docs/architecture/08-release-readiness-checklist.md`
- `docs/architecture/09-deployment-playbook.md`

## Updated

- `docs/architecture/07-system-map.md`
- `README.md`

## What These Docs Cover

### Release Checklist

- pre-release checks
- verification commands
- runtime readiness review
- UI readiness review
- safety readiness review
- stop-release conditions

### Deployment Playbook

- current supported install/deploy paths
- state and secret boundaries
- server-mode notes
- Telegram runtime notes
- current unsupported claims
- recommended release sequence

## Why This Step Matters

`M20` is about productization and operational clarity.

Without release/deployment docs, future collaborators would still need to infer:

- what is actually supported today
- what remains boundary-only
- how to validate a release safely

These docs make that explicit.
