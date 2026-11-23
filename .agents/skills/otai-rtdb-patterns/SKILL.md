---
name: otai-rtdb-patterns
description: Design and review Otai Firebase Realtime Database paths, typed records, transactions, multi-location updates, idempotency, indexes, retention, cleanup, and migrations. Use whenever adding or changing RTDB roots, readers/writers, projections, dedupe/job state, data lifecycle, security rules, or migration scripts.
---

# Otai RTDB Patterns

Preserve tenant isolation, atomicity, idempotency, and migration safety.

## Load canonical context

Read `../../../docs/data/rtdb-schema.md`. Also read `../../../docs/architecture/tenancy-and-auth.md` for client/server access changes and the relevant integration runbook for integration-owned data.

Inspect the owning TypeScript types, path helpers, reads/writes, security rules, exports, and tests before editing.

## Path rules

- Put tenant-owned domain data under `tenants/{tenantId}/...`.
- Use documented global roots only for cross-tenant identity/configuration indexes.
- Prefer established path builders such as `getTenantPath`; validate every dynamic segment against RTDB-forbidden characters.
- Use deterministic keys for canonical identities, correlation, dedupe, locks, and projections. Use push IDs for append-only ordered collections.
- Do not create a second root for the same concept without an explicit ownership and migration decision.
- Ignore documented sentinel/template keys during domain iteration.
- Update `docs/data/rtdb-schema.md` with owner, readers, writers, retention, and migration state.

## Write decision

Choose the smallest safe primitive:

- `set`: replace one complete canonical record intentionally.
- `update`: patch independent fields without deleting siblings.
- root multi-location `update`: atomically change a canonical record and all indexes/projections.
- `transaction`: claim identity, compare-and-swap state, increment counters, acquire leases, or enforce once-only transitions.

Never implement read-then-write for a contested invariant when a transaction can enforce it. Keep transaction callbacks deterministic, synchronous, retry-safe, and free of external side effects.

Prime server transaction state with the established helper when required by the Admin SDK behavior in this repository.

## Idempotency pattern

For webhook, queue, or retryable mutations:

1. Derive a stable key from provider event/message ID or domain correlation ID.
2. Transactionally claim `processing` with attempt and lease metadata.
3. Return success/no-op for completed work.
4. Return retry/in-progress behavior for a live lease.
5. Recover an expired lease safely.
6. Execute the external/domain side effect once.
7. Persist canonical data, projections, and `completed` outcome atomically where possible.
8. Persist a bounded error summary on failure; never credentials or raw PII.

Define the consequence of a crash between external side effect and completion write. Prefer provider idempotency keys or reconciliation when exact atomicity is impossible.

## Index and projection rules

- State which record is canonical and which roots are rebuildable indexes/projections.
- Update canonical data and indexes in one multi-location write.
- Index normalized lookup values; do not scan tenant-wide collections on the steady-state path.
- Keep legacy scan/backfill only as a labeled migration fallback with a removal condition.
- Define uniqueness behavior and collision handling.
- Add `.indexOn` only when the actual deployed rules/query require it; document query shape.

## Retention and cleanup

- Distinguish logical expiry (`expiresAt`) from physical deletion.
- Temporary data requires TTL, cleanup owner, schedule/trigger, retries, observability, and tests.
- Permanent PII requires a business/legal retention owner; do not invent a period.
- Token expiry must be checked at read/consume time even if cleanup is delayed.
- Delete credentials and obsolete indexes when their owning integration/instance is removed.

## Migration workflow

1. Inventory old/new paths, readers, writers, rules, exports, and workers.
2. Define canonical target, compatibility window, rollback, and removal condition.
3. Prefer dual-read/new-first fallback with single-write-to-new.
4. Build an idempotent migration with dry-run/preview and bounded tenant scope.
5. Use multi-location writes or resumable checkpoints.
6. Verify counts, referential/index consistency, and representative records without exposing PII.
7. Deploy readers before migration and remove fallback only after monitoring proves completion.
8. Update schema docs and tests in the same change.

Never perform a destructive bulk migration without explicit authorization, an exact target set, and a recovery plan.

## Access and rules

- Admin SDK access still requires route authorization.
- New sensitive roots default to server-only and explicit client deny.
- If browser access is required, scope rules to tenant membership and resource ownership; add emulator/rules coverage when available.
- Avoid relying on incomplete checked-in rules as proof of deployed access.

## Verification checklist

- Path is tenant-scoped and segments are safe.
- Record shape is typed and normalized at the boundary.
- Contended invariants use transactions.
- Canonical + index writes are atomic or reconcilable.
- Retry path is idempotent.
- TTL and cleanup are both defined.
- Migration is resumable and reversible.
- Cross-tenant, duplicate, stale-lease, partial-failure, and legacy-fallback tests exist.

