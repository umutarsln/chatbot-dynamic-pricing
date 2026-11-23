---
name: otai-backend-architecture
description: Govern Otai backend route classes, service/repository/provider ownership, dependency direction, server-only boundaries, webhook/worker entrypoints, operational scripts, and repeatable pre-refactor audits. Use when adding, moving, refactoring, or reviewing Next.js API routes, src/lib server modules, Firebase access, auth guards, workers, webhooks, provider adapters, backend imports, migrations, or backend topology.
---

# Otai Backend Architecture

Keep backend work reconstructable from canonical repository context and preserve
security, data, provider, and public-contract boundaries.

## Load canonical context

Read these sources completely:

1. `../../../docs/architecture/backend-architecture.md`
2. `../../../docs/engineering/backend-quality.md`

Read `../../../docs/engineering/backend-audit-prompts.md` when running a
pre-refactor phase. Add the owning canonical sources and skills:

- tenant/auth/API/secret work: `otai-tenancy-security` and tenancy architecture;
- RTDB/repository/idempotency/migration work: tenancy plus `otai-rtdb-patterns`
  and the RTDB schema;
- module/permission/entitlement work: tenancy plus
  `otai-feature-module-workflow` and the module catalog;
- WhatsApp/Telegram/webhook/worker work: tenancy plus
  `otai-channel-integrations`; add RTDB, AI, and feature skills when involved;
- model/prompt/tool/stream/cache/trace work: `otai-ai-workflows`, plus tenancy
  when tenant data or tools are involved;
- every runtime/config/schema/route/migration implementation: finish with
  risk-proportional `otai-release-quality` checks.

Use `otai-workflow-orchestrator` first for cross-domain work.

## Select the mode

### Audit or pre-refactor report

- Inspect git status and preserve user changes.
- Do not edit source, docs, skills, config, tests, providers, or data during the
  reporting pass.
- Run `npm run audit:backend -- --scope <scope> --format markdown`.
- Deep-read at most 25 production files selected by route entrypoint,
  fan-in/fan-out, layer, and relevant metric signals.
- Keep the full deterministic manifest and follow other domains only one
  contract boundary deep.
- Treat LOC, signal counts, missing tests, SDK imports, and cycles as inspection
  signals rather than findings.
- Trace the actual authorization/data/provider call chain before reporting a
  security, isolation, idempotency, or performance problem.
- Require exact `path:line` or metric evidence and state the current public
  contract before recommending change.
- Use the finding IDs, priority, confidence, evidence, behavior, impact,
  decision, validation, and status defined in the backend quality workflow.
- Canonicalize only explicitly approved IDs. Never implement a product refactor
  in an audit or canonicalization task.

### Add, change, or refactor backend code

1. Classify the entrypoint as tenant, public auth, superadmin, widget, webhook,
   worker, domain service, repository, provider adapter, or operational script.
2. Establish trusted tenant resolution, credential, role, permission, module,
   feature, resource, secret, and lifecycle constraints before implementation.
3. Define the unchanged or intentionally changed HTTP/data/provider/worker
   contract.
4. Keep HTTP parsing, guards, service invocation, and response mapping in the
   route handler.
5. Keep reusable business transitions in the owning domain service.
6. Keep RTDB paths, transactions, normalization, and canonical/index writes in
   the owning repository/store.
7. Keep provider wire formats, credentials, timeouts, and provider error
   classification in a named adapter.
8. Give webhooks and workers separate authentication entrypoints even when
   they share a service.
9. Prevent server-only modules, Firebase Admin, decrypted secrets, and broad
   tenant records from reaching client-facing barrels or responses.
10. Add characterization and negative tests before a broad structural change;
    run the owning audit scope and risk-proportional release checks afterward.

## Required authorization order

Before data access, mutation, decrypt, enqueue, or provider calls:

1. resolve route class;
2. resolve trusted tenant context;
3. verify the route-class credential;
4. match credential tenant/scope to the target;
5. enforce role;
6. enforce page permission when applicable;
7. enforce module/feature entitlement;
8. enforce resource ownership and lifecycle constraints;
9. execute the operation.

Never use `x-tenant-id`, UI visibility, CORS, a module flag, or possession of a
resource ID as identity.

## Placement and dependency checks

- A large file is not by itself an extraction reason.
- A new boundary needs one responsibility, a stable contract, and independent
  validation.
- Route handlers must not be reused as domain services.
- Repositories must not own HTTP status or provider policy.
- Provider adapters must not decide tenant authorization.
- Shared utilities must not conceal feature ownership or reverse dependencies.
- Worker retries must converge through stable idempotency/lease semantics.
- Operational scripts default to bounded, non-destructive behavior and require
  explicit authorization before real migrations or cleanup.
- Client Firebase and Firebase Admin access require unambiguous import paths.

## Handoff

For audits, report scope, commands, current contracts, evidence-backed findings,
unresolved boundaries, proposed canonical updates, and the next phase. For
implementation, report changed route/layer/security/data boundaries, tests and
checks run, skipped/blocked validation, documentation updates, rollback needs,
and residual risk.
