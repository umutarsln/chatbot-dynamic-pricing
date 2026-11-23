---
name: otai-release-quality
description: Verify Otai changes before merge or release using clean builds, TypeScript, lint, Vitest, widget build, i18n/RTL checks, webhook-worker contracts, data migration safety, security review, and documentation consistency. Use for pre-merge review, release readiness, risky integration/auth/data changes, migration rollout, or when asked to run the full quality checklist.
---

# Otai Release Quality

Run risk-proportional quality gates and report evidence, not assumptions.

## Load canonical context

Read `../../../docs/engineering/testing-and-ci.md`. For affected areas also read the data schema, module catalog, design system, backend/frontend quality workflow, tenancy/auth document, or integration runbook. Inspect `package.json`, `vitest.config.ts`, `tsconfig.json`, and ESLint configuration before choosing commands.

## Preserve the worktree

- Inspect `git status --short` before testing.
- Treat existing changes as user-owned; do not reset, delete, format, stage, or rewrite unrelated files.
- Use a clean checkout/worktree for release-signoff builds when available. If not, state that the result includes local changes.
- Do not delete `.next` or other material artifacts without verifying scope and authorization; use an isolated clean worktree when stale generated types are suspected.

## Required gates

Run the narrowest relevant tests during iteration, then these repository gates for final verification:

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
npm run widget:build
```

The widget build is required only when widget/shared dependencies can affect it, but full release signoff should run both builds. Record command, exit status, failing file/test, and whether failure predates the change. Never claim a gate passed if it was skipped or blocked.

## Risk-specific checks

### Auth, tenancy, or secrets

- Exercise missing/invalid identity, wrong tenant, wrong role/permission, disabled feature, and cross-tenant negatives.
- Verify logs/responses/traces contain no credentials or reusable tokens.
- Run the owning `audit:backend` scope when route classes, server-only boundaries, backend dependencies, or service/repository/provider placement changed.

### Webhook or worker

- Run authenticity, malformed payload, disabled config, enqueue failure, worker authorization, idempotency, retry, stale lease, and failure-state contract tests.

### RTDB or migration

- Verify exact target roots, canonical/index atomicity, transaction retry safety, retention, security rules, dry-run, idempotent resume, rollback, and count/integrity reconciliation.
- Never execute a production migration as part of generic quality verification.

### Module or permission

- Verify navigation, direct route, direct API, worker, missing-config default, and superadmin behavior.

### UI/design

- Check responsive states, keyboard/focus, accessible names/errors, contrast, loading/empty/error/disabled states, reduced motion, and surface token ownership.
- Run the owning `audit:frontend` scope when component placement, client boundaries, or dependency direction changed.

## I18n checklist

- Add every new user-visible key to `en`, `tr`, `de`, `ar`, and `ru` message catalogs unless the owning surface uses its separate widget catalog.
- Check missing/extra keys and ICU variable/plural consistency.
- Do not hardcode user-facing English in localized surfaces.
- Verify long German/Russian text, Turkish characters, Arabic RTL/logical spacing, dates/numbers/timezone, and fallback locale.
- For widget copy, verify locale resolution order and tenant override behavior.

## Build/type/lint interpretation

- Type check runs with strict/no-emit and includes generated `.next/types`.
- Diagnose stale generated route types separately; confirm with a clean checkout/build rather than suppressing errors.
- Current lint uses deprecated `next lint`; report that tooling limitation while still treating lint errors as failures.
- Explain warnings and whether they are new; do not weaken rules to get green.
- Confirm the service-worker generation step did not create unintended changes.

## Migration release checklist

Before rollout require owner, exact tenant scope, backup/export or recovery method, dry-run evidence, estimated volume/time, rate limits, resumable checkpoints, dual-read/single-write sequencing, monitoring queries, rollback trigger, and legacy removal condition. After rollout verify counts, indexes, errors, latency, and representative records without exposing PII.

## Documentation gate

Update the relevant canonical document in the same change when routing/auth, RTDB, module defaults/routes, design tokens, test policy, integrations, workers, observability, retention, or migration behavior changes. Check internal links and Current/Planned/Legacy labels.

## Final report format

Provide:

1. overall status: Ready, Ready with warnings, or Not ready;
2. commands/checks run with results;
3. failures and whether change-related;
4. skipped/blocked checks and why;
5. migration/rollback status if applicable;
6. residual risks and exact next actions.

Do not stage, commit, push, deploy, configure providers, or run migrations unless the user separately authorizes that action.
