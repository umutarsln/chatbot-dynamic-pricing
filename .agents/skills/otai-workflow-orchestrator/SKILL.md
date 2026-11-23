---
name: otai-workflow-orchestrator
description: Classify and orchestrate cross-cutting Otai engineering work by selecting the required tenancy, RTDB, feature, channel, AI, backend/frontend architecture, design, and release-quality skills in the correct constraint order. Use for tasks spanning two or more Otai domains, ambiguous implementation scope, end-to-end features, architecture-to-code work, broad audits, migrations, or explicit requests to coordinate project skills.
---

# Otai Workflow Orchestrator

Route a task to the minimum complete skill set, preserving mandatory security, data, and verification companions.

## Load project context

Read `../../../docs/README.md` for the canonical documentation map. Inspect `git status --short` before implementation and preserve unrelated changes.

Do not load every domain document up front. Classify first, then read only the selected skills and their required canonical sources.

## Classify the request

Mark every affected facet:

| Facet | Signals | Select |
| --- | --- | --- |
| Security/tenancy | Tenant ID, auth, session, JWT, cookie, role, permission, API access, secret | `otai-tenancy-security` |
| Data | RTDB path, type, transaction, index, dedupe, TTL, cleanup, migration | `otai-rtdb-patterns` + tenancy |
| Entitlement | Module, feature flag, route gate, page permission, rollout/default | `otai-feature-module-workflow` + tenancy |
| Channel | WhatsApp, Telegram, webhook, QStash, worker, template, opt-out, routing | `otai-channel-integrations` + tenancy |
| AI | Model, provider, prompt, cache, tool, stream, fallback, Langfuse | `otai-ai-workflows` |
| Backend architecture | API route, server service, repository/store, provider adapter, worker, webhook, script, backend dependency/refactor | `otai-backend-architecture` |
| Frontend architecture | Page, layout, component, hook, provider, client boundary, dependency, UI refactor | `otai-frontend-architecture` |
| Presentation | Admin/staff/superadmin, guest chat, widget, component, token, UX | `otai-design-system` |
| Quality/release | Pre-merge, release, build, test, lint, type-check, i18n, rollout | `otai-release-quality` |

Infer companions from the actual implementation, not only words in the request. For example, a new WhatsApp AI preference is security + RTDB + entitlement if gated + channel + AI + release quality.

## Apply mandatory expansion

- Add tenancy to every tenant data/API, RTDB, channel, module/permission, secret, widget-auth, webhook, or worker change.
- Add RTDB patterns when persistence, indexes, dedupe/job state, retention, or migration changes.
- Add feature workflow when UI, API, worker, or channel behavior is tenant-gated.
- Add channel integrations when AI input/output is delivered over WhatsApp or Telegram.
- Add AI workflows when a channel/UI change modifies model, prompt, tools, streaming, cache, fallback, or tracing.
- Add backend architecture when API routes, server services, repositories, provider adapters, workers, webhooks, operational scripts, server-only boundaries, or backend dependency direction change.
- Add frontend architecture when pages, layouts, components, hooks, providers, client boundaries, or frontend dependency direction change.
- Add design system when a user-visible surface changes.
- Add release quality to every implementation that changes runtime behavior, configuration, schema, routes, UI, or migration behavior. Use its risk-proportional subset during iteration and full gates only for release/pre-merge requests.

Do not select a skill solely because it is available. Pure explanation or documentation formatting may need no domain skill unless it changes a canonical rule.

## Build the activation plan

Before task actions, announce a compact plan:

```text
Skills: tenancy-security → rtdb-patterns → channel-integrations → ai-workflows → release-quality
Why: tenant-bound persisted WhatsApp AI worker change
```

Then read each selected skill completely from its sibling directory:

- `../otai-tenancy-security/SKILL.md`
- `../otai-rtdb-patterns/SKILL.md`
- `../otai-feature-module-workflow/SKILL.md`
- `../otai-channel-integrations/SKILL.md`
- `../otai-ai-workflows/SKILL.md`
- `../otai-backend-architecture/SKILL.md`
- `../otai-frontend-architecture/SKILL.md`
- `../otai-design-system/SKILL.md`
- `../otai-release-quality/SKILL.md`

Honor user-named skills even if classification would not select them. State when a named skill is irrelevant or conflicts, but do not silently omit it.

## Execute in constraint order

1. Establish tenant/auth/secret boundaries.
2. Establish data ownership, atomicity, idempotency, retention, and migration constraints.
3. Establish module/permission/route/API entitlement alignment.
4. Establish channel and AI domain behavior.
5. Establish backend route/layer ownership, dependency, server-only, provider, worker, and script boundaries.
6. Establish frontend surface ownership, placement, dependency, state, and client boundaries.
7. Establish surface tokens, interaction, accessibility, responsive, and i18n behavior.
8. Implement the smallest coherent change.
9. Run release-quality checks proportional to risk and update canonical documentation.

Independent inspection and tests may run in parallel. Do not let parallel work bypass earlier security/data decisions.

## Handle drift and conflicts

- Current code and deployed provider/security behavior define runtime facts.
- Canonical documents define intended architecture and operational ownership.
- A Planned document is not implementation authority.
- When code and docs disagree, verify the behavior, report the drift, and update the appropriate source in the same change when authorized.
- When skills overlap, apply the most restrictive security, data, consent, opt-out, migration, and release rule.

## Authorization limits

Orchestration does not broaden task scope or user authority. Do not deploy, stage/commit/push, rotate secrets, configure an external provider, send messages, or execute a migration unless separately authorized. Use read-only inspection, local edits, and safe verification within the requested scope.

## Final handoff

Report selected skills, changed boundaries, checks run, skipped/blocked checks, documentation updates, rollout/rollback needs, and residual risks. Avoid narrating skill mechanics when a short implementation result is clearer.
