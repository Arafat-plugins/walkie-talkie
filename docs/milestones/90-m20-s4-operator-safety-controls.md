# M20-S4: Operator Safety Controls

## Summary

This step adds the first shared operator safety policy contract.

The goal is to give future runtime execution a single place to evaluate:

- budget limits
- approval requirements
- allowlist restrictions

## Added

- `packages/runtime/src/operator-safety.ts`
  - safety risk levels
  - approval channels
  - budget policy
  - allowlist policy
  - approval policy
  - evaluation helper
  - readable profile summary

## What It Can Express

- max runtime budget
- max AI calls per run
- max tool calls per run
- max background jobs per hour
- allowed skills
- allowed MCP servers
- allowed integrations
- allowed models
- allowed trigger kinds
- approval-required execution for high-risk or autonomous runs

## Scope Boundary

This step does not enforce the policy inside orchestration yet.

It intentionally stops at:

- shared contract
- deterministic evaluator
- readable summary

That gives later runtime enforcement a stable safety shape to plug into.
