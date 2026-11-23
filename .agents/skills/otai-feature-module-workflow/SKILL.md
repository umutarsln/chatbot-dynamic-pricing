---
name: otai-feature-module-workflow
description: Add, change, or review Otai tenant modules and feature flags while keeping navigation, route gating, page permissions, API authorization, workers, defaults, migration, tests, and documentation aligned. Use for new product capabilities, tenant rollouts, entitlement changes, route moves, permission changes, or module-default changes.
---

# Otai Feature Module Workflow

Treat module flags as entitlements, page permissions as actor-specific UI access, and API authorization as the final enforcement boundary.

## Load canonical context

Read `../../../docs/product/module-catalog.md` and `../../../docs/architecture/tenancy-and-auth.md`. Inspect `src/lib/tenant-modules.ts`, `src/lib/tenant-modules-server.ts`, `src/lib/page-permissions.ts`, middleware/navigation, and the owning API authorization helper.

## Authorization invariant

For a protected capability, effective access is:

```text
valid tenant context
AND authenticated identity
AND allowed tenant role
AND page permission when applicable
AND module enabled
AND feature enabled
AND resource/domain authorization
```

UI visibility and route gating improve UX but never replace API/worker enforcement.

## Add or change a feature

1. Choose the owning module; create a new module only for a durable independently deployable product area.
2. Define stable snake-case ID, label, responsibility, default, and route mapping in `tenant-modules.ts`.
3. Use exact route matching for a single page and prefix only for an intentional subtree.
4. Decide whether the feature gates a page, a control, an API/domain behavior, a worker, or multiple boundaries.
5. Add/update navigation and page gating.
6. Add/update page permission IDs and defaults for staff-linked surfaces.
7. Enforce session, tenant, role, page permission, module feature, and resource ownership in every affected API.
8. Re-check feature/config in async workers when delayed execution could outlive rollout state.
9. Define missing-config normalization, stored default application, rollout, rollback, and legacy fallback.
10. Update the module catalog and related data/integration documentation.

## Default rules

- Missing stored values use code defaults through normalization.
- A module feature inherits its module default unless `defaultEnabled` overrides it.
- Required modules are forced enabled.
- Guest Login modes remain mutually exclusive and normalize to one enabled mode.
- Do not change a default casually: it changes behavior for tenants with missing stored config.
- Applying defaults persists a complete normalized snapshot; review survey capabilities coupled to module config.

## Page permission rules

- Use stable IDs from `page-permissions.ts`; do not infer permissions from URL strings ad hoc.
- Superadmin bypass behavior must be explicit and tested.
- Tenant Admin role does not automatically mean an associated staff profile can ignore configured page restrictions where the owning helper applies them.
- Denied navigation, direct page URL, and direct API request must converge to no access.
- Feature-only controls inside an allowed page require feature checks without accidentally denying the whole page.

## API and worker rules

- Authenticate before data access and bind the tenant to the credential.
- Check role/page permission/module on the server.
- Return 401 for missing identity and 403 for missing entitlement/permission.
- Avoid leaking disabled feature data through alternate endpoints, exports, or background jobs.
- Never accept module configuration from a non-superadmin caller unless the architecture explicitly assigns that owner.
- Ensure queued work does not bypass a newly disabled high-risk feature.

## Migration and rollout

- Prefer additive IDs and backward-compatible normalization.
- Read legacy configuration only as a named fallback; write the new structure only.
- State the fallback removal condition.
- Roll out disabled by default unless existing tenants must retain behavior and migration proves it.
- Provide a narrow rollback by disabling the feature without corrupting stored domain data.

## Verification matrix

Test module on/off, feature on/off, missing stored config/default, wrong tenant, missing session, wrong role, denied page permission, allowed page permission, direct route, direct API, worker execution, superadmin behavior, and legacy normalization. Update route-mapping tests whenever paths change.

Report every enforcement point changed so reviewers can verify there is no UI/API mismatch.

