---
name: pre-submit-review
description: Pre-submit review with P1/P2/P3 findings before commit or PR. Use when the user says RV, pre-review, or asks to review before commit; when finishing a behavior change that touches auth, hotels, or public APIs.
---

# Pre-submit review

Triggered by **RV** or before the user wants a commit/PR. Read the diff; do not run `git add` / `commit` / `push`.

## Steps

1. `git status`, `git diff`, and `git log -5 --oneline` (read-only).
2. Scan the diff for bugs, security, and missing tests.
3. `npx tsc --noEmit`. If Vitest exists, `npx vitest run` on touched `*.test.*` files.
4. Report findings as `[P1]` / `[P2]` / `[P3]` with `path:line` and a fix. No P1/P2 → say ready.

**Block** `CM` / `PR` / `GACM` while P1 or P2 remains, unless the user accepts the risk in this turn.

## What to catch

- Hotel/tenant: `hotelId` from a trusted session, not from an untrusted body field used as the only check.
- Auth fail-closed: missing session → 401, wrong hotel → 403.
- Secrets in logs, responses, or client bundles.
- Public/guest routes without rate limit.
- Behavior change without a colocated test (`testing` skill).
- Visible screen or backend flow change without an updated `docs/context/ui` or `docs/context/backend` file (and `INDEX.md` if the row changed).

```
[P1] src/app/api/replies/route.ts:42 — publishes using body.hotelId; use the session hotel.
[P2] src/app/api/reviews/route.test.ts — missing 403 for a review from another hotel.
[P2] docs/context/backend/yorum-listele.md — GET /api/reviews added but the flow doc and INDEX row are missing.
```
