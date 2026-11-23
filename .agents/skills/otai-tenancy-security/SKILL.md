---
name: otai-tenancy-security
description: Enforce Otai multi-tenant security for data access, route handlers, sessions, JWTs, cookies, webhooks, workers, widget requests, and stored credentials. Use when creating or reviewing any code that reads/writes tenant data, accepts a tenant identifier, authorizes admin/staff/guest/superadmin access, handles external callbacks, or touches secrets.
---

# Otai Tenancy Security

Apply a fail-closed tenant and authorization review before changing code.

## Load canonical context

Read only the documents relevant to the change:

- Always read `../../../docs/architecture/tenancy-and-auth.md` for an auth or data-access change.
- Read `../../../docs/data/rtdb-schema.md` when RTDB is involved.
- Read the relevant guide under `../../../docs/integrations/` for webhook, worker, PMS, Telegram, WhatsApp, or widget work.

Inspect the owning route/helper and tests. Treat implemented code and deployed security rules as runtime authority; report documentation drift.

## Required authorization order

For a tenant API, enforce this sequence before domain access:

1. Resolve the route/host class: tenant, superadmin, public auth, widget, webhook, or worker.
2. Resolve `tenantId` from the trusted route/middleware context. Treat query/body/header tenant IDs as untrusted until matched.
3. Verify the correct credential: Firebase ID/session token, `__session`, scoped JWT, provider signature/secret, or worker authorization.
4. Match credential tenant/scope to the requested tenant and resource.
5. Load the global tenant role at `users/{uid}/roles/{tenantId}` where applicable.
6. Enforce page permission for staff-linked admin surfaces.
7. Enforce module/feature entitlement for the capability.
8. Enforce object ownership or resource-level constraints.
9. Only then read, mutate, decrypt, enqueue, or call an external provider.

Do not use a feature flag, page permission, client visibility, CORS, or possession of a tenant ID as authentication.

## Data-access checklist

- Require a non-empty validated `tenantId`; prefer the established tenant path helper.
- Keep tenant domain data below `tenants/{tenantId}` unless the documented global index requires otherwise.
- Prevent callers from selecting another tenant through body/query/header disagreement.
- Bind guest/widget records to the verified UID or guest-session claim.
- For collection queries, scope at the RTDB path before filtering; never fetch all tenants then filter in memory.
- Use Admin SDK only after server authorization. Admin SDK bypasses RTDB rules.
- Review both server authorization and `database.rules.json` when adding browser SDK access.
- Return 401 for missing/invalid identity and 403 for authenticated-but-forbidden access; avoid leaking resource existence.
- Test negative cross-tenant cases and superadmin bypass behavior explicitly.

## Route-class checklist

### Admin/staff

- Verify `__session` with revocation checks.
- Resolve role for the same tenant.
- Resolve linked staff record and page permission where the surface uses them.
- Check module feature in the API even when middleware/UI already hides the route.

### Guest

- Verify the expected Firebase/session identity and tenant membership.
- Restrict operations to the authenticated guest's records.
- Re-check consent, stay, or lifecycle gates required by the domain.

### Widget

- Validate embed token signature, `scope=widget`, tenant match, expiry, and allowed origin.
- Require the guest-session JWT for visitor-owned data and match tenant/guest claims.
- Treat origin validation as defense in depth, not identity.

### Webhook

- Preserve raw body when signature verification requires it.
- Resolve the tenant from a trusted provider mapping and verify signature/secret before enqueueing.
- Acknowledge irrelevant valid events without exposing internals; reject invalid authenticity.

### Worker

- Verify the supported QStash signature or worker-secret contract.
- Validate payload schema and tenant before state changes.
- Re-authorize sensitive domain behavior where configuration may have changed after enqueue.

### Superadmin

- Keep superadmin host/session rules separate from tenant admin assumptions.
- Verify superadmin identity before accepting an arbitrary tenant target.
- Record actor and target tenant for material configuration changes.

## Secret checklist

- Keep platform secrets in server environment configuration and tenant credentials in encrypted RTDB envelopes.
- Never return, log, serialize, trace, test-snapshot, or place decrypted secrets in client components.
- Never expose server secret names through a client contract unless the existing platform contract requires it.
- Redact authorization headers, cookies, JWTs, provider tokens, webhook secrets, app secrets, and encryption material.
- Fail closed on missing/decryption-invalid credentials.
- Define rotation, cache invalidation, and deletion behavior.

## Verification

Add tests for missing credential, invalid credential, wrong tenant, wrong role, denied page permission, disabled module feature, wrong resource owner, and successful authorized access. For high-risk changes, trace every read/write from input tenant ID to the final RTDB path.

## Output expectations

When reviewing, list findings by severity with the violated boundary and exact code path. When implementing, summarize which tenant/auth/secret checks were added and which negative tests prove isolation.

