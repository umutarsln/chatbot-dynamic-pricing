---
name: otai-frontend-architecture
description: Govern Otai frontend surface ownership, component placement, dependency direction, React Server/Client Component boundaries, providers, and repeatable pre-refactor audits. Use when adding, moving, refactoring, or reviewing Next.js pages/layouts, React components, hooks, contexts/providers, shared UI, route-local UI, widget UI boundaries, client directives, frontend imports, or component topology.
---

# Otai Frontend Architecture

Keep frontend work reconstructable from canonical repository context instead of
conversation history.

## Load canonical context

Read these sources completely:

1. ../../../docs/architecture/frontend-architecture.md
2. ../../../docs/design/component-system.md
3. ../../../docs/engineering/frontend-quality.md

For visible UI, also activate otai-design-system and read the canonical design
system. Add tenancy, feature-module, AI, channel, or data skills when the
frontend crosses those contracts. Finish runtime changes with risk-proportional
otai-release-quality checks.

## Select the mode

### Audit or pre-refactor report

- Inspect git status and preserve user changes.
- Do not edit source, docs, skills, or config during the reporting pass.
- Run npm run audit:frontend -- --scope <scope> --format markdown.
- Deep-read at most 25 production files selected by entrypoint, fan-in/fan-out,
  and relevant metric signals.
- Follow backend/API/Firebase code only one boundary deep; route deeper work to
  a separate audit.
- Treat LOC, hooks, effects, client directives, style signals, test colocation,
  and dependency cycles as inspection signals, not findings.
- Require exact path:line or metric evidence. Separate fact, inference, and
  recommendation.
- Classify duplicate candidates as exact, structural, or semantic. Require at
  least two concrete implementations for semantic duplication.
- Report findings using the IDs, priority, confidence, evidence, current
  behavior, impact, decision, validation, and status defined in the frontend
  quality workflow.
- Canonicalize only explicitly approved IDs. Never implement a product refactor
  in the audit or canonicalization task.

### Add, change, or refactor frontend code

1. Identify the owning surface and capability.
2. Establish tenant, authorization, module, data, channel, and AI constraints
   before choosing UI structure.
3. Search installed primitives and existing feature compositions.
4. Keep one-route code route-local; place capability reuse in a named feature
   area; promote only domain-neutral controls to src/components/ui.
5. Keep widget presentation in widget and preserve Shadow DOM/token isolation.
6. Default Next.js entries to Server Components and push "use client" to the
   smallest coherent interactive subtree.
7. Enforce route to feature to shared composition to primitive dependency
   direction. Do not let primitives import domain or route code.
8. Keep providers narrow and lift state only to the nearest shared owner.
9. Preserve public behavior and add characterization tests before structural
   changes with broad blast radius.
10. Run the owning audit scope, targeted tests, type/lint/build checks
    proportional to risk, and update canonical docs when a durable rule changes.

## Placement checks

- A large file is not by itself an extraction reason.
- A new boundary needs one responsibility, a stable contract, and independent
  validation.
- Sharing requires common semantics, states, accessibility, and behavior, not
  merely similar markup.
- Explicit variants and compound composition are preferred over behavior-heavy
  boolean prop APIs.
- UI permission/module guards never replace server authorization.
- Do not pass secrets, decrypted credentials, broad tenant records, or
  server-only capabilities through client props.

## Handoff

For audits, report scope, commands, evidence-backed findings, unresolved
boundaries, proposed canonical updates, and the next audit slice. For
implementation, report changed ownership/boundaries, checks run, skipped or
blocked validation, documentation updates, and residual risk.

