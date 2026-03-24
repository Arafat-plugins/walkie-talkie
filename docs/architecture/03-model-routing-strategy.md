# Model Routing Strategy

## Why This Exists

Telegram bot বা future agent যদি প্রতিটা message premium model-এ পাঠায়, তাহলে:
- unnecessary token loss হবে
- simple server/tool questions too expensive হয়ে যাবে
- user value আর cost ratio খারাপ হবে

এই project-এ model use করার আগে routing layer থাকা উচিত।

## Core Principle

`config valid` আর `runtime ready` যেমন এক জিনিস না, তেমনি
`message received` আর `premium model needed` এক জিনিস না।

## Routing Order

1. Tool-first
- যদি question direct tool/system check দিয়ে answer করা যায়, model use করো না
- example:
  - package installed?
  - file exists?
  - process running?
  - version check?

2. Cheap-model-first
- simple explanation/classification হলে small/cheap model use
- example:
  - short help
  - FAQ
  - known command explanation
  - small response formatting

3. Premium escalation
- only when complexity justifies it
- example:
  - multi-step reasoning
  - ambiguous troubleshooting
  - long-context analysis
  - code generation

## Policy Fields

Recommended policy contract:
- `mode`
  - `tool-first`
  - `cheap-first`
  - `premium-always`
- `defaultTier`
  - `none`
  - `small`
  - `standard`
  - `premium`
- `escalationPolicy`
  - `never`
  - `on-low-confidence`
  - `on-failure`
  - `manual-only`
- `allowToolBypass`
- `dailyPremiumBudget`

## Recommended Default

For Telegram and assistant-style agents:
- `mode: tool-first`
- `defaultTier: small`
- `escalationPolicy: on-low-confidence`
- `allowToolBypass: true`
- `dailyPremiumBudget: 20`

## Example

User asks:
`amar server e cursor install ache naki`

Best route:
- classify as `system-check`
- use direct tool path
- answer from tool result
- premium model cost: `0`

User asks:
`amar workflow ta keno fail kortese full analysis kore bolo`

Best route:
- cheap router/classifier first
- if ambiguous or complex, escalate to premium model

## Future Integration Points

- `packages/agents`
  - agent-level routing policy
- `packages/skills`
  - tool-capable skill routing
- `packages/integrations/src/ai`
  - provider tier mapping
- `packages/pipeline`
  - escalation node / fallback branch
- `apps/dashboard`
  - user-visible routing policy editor

## Non-Negotiables

- premium model should not be default for every incoming Telegram message
- direct system/tool answer should bypass LLM when practical
- escalation should be explicit and testable
- routing policy should be configurable per agent later
