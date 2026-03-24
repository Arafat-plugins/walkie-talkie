# Execution Docs Framework

## Goal

Walkie-Talkie complete হওয়ার পর যেন যে কেউ docs খুলে বুঝতে পারে:
- কোন agent কী করে
- কোন skill কী করে
- কোন prompt কোথায় use হয়
- কোন command/tool run হয়
- কোন file কোন file-কে call করে
- কোন function call chain follow হয়

## Documentation Rule

Future-এ প্রতিটা major feature, tool, agent, skill, pipeline, integration-এর জন্য docs থাকতে হবে।

Minimum required docs:
- feature overview
- file map
- call flow
- prompt flow
- tool execution flow
- input/output contract
- failure path

## Required Doc Types

### 1. Agent Doc

Each agent must document:
- purpose
- trigger sources
- linked skills
- linked MCP/tools
- model routing policy
- prompt sources
- function call order
- execution examples

### 2. Skill Doc

Each skill must document:
- purpose
- input parameters
- output shape
- handler entrypoint
- called external tools/services
- validation rules
- failure behavior

### 3. Pipeline Trace Doc

Each pipeline must document:
- trigger
- steps in order
- branch points
- data passed between nodes
- fallback/escalation path

### 4. Integration Doc

Each integration must document:
- provider/service purpose
- adapter entry file
- auth/config requirements
- request/response flow
- retry/failure behavior

## Mandatory Sections

Every deep execution doc should include these headings:

1. Purpose
2. Entry Point
3. Files Involved
4. Prompt Source
5. Call Flow
6. Tool Calls
7. Input/Output Contract
8. Failure Paths
9. Example Run
10. Related Tests

## Traceability Standard

We should be able to answer these questions from docs alone:
- user message কোন file receive করল?
- কোন prompt template use হলো?
- model call হলো নাকি tool-first path হলো?
- কোন skill handler run হলো?
- কোন function আগে, কোন function পরে call হলো?
- কোথায় response format হলো?

## Practical Rule For Future Milestones

When a new tool/agent/skill/pipeline is added:
- code
- tests
- milestone doc
- and one execution-facing doc or doc update

all four are required for completion.

## Companion Docs

For collaboration handoff and system-level orientation also read:
- `docs/architecture/06-ai-handoff-playbook.md`
- `docs/architecture/07-system-map.md`
