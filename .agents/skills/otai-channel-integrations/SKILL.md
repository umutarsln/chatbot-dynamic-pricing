---
name: otai-channel-integrations
description: Implement and review Otai WhatsApp and Telegram channel integrations, including provider configuration, webhook authenticity, payload normalization, QStash dispatch, worker authorization, idempotency, templates, customer-service windows, consent, opt-out, routing, and operational rollback. Use for any WhatsApp/Telegram webhook, queue, worker, outbound delivery, template, survey, task, identity, or onboarding change.
---

# Otai Channel Integrations

Preserve the channel pipeline: authenticate inbound traffic, enqueue quickly, authorize workers, claim idempotency, execute tenant-bound domain behavior, and record delivery outcome.

## Load canonical context

- Read `../../../docs/integrations/whatsapp.md` for WhatsApp work.
- Read `../../../docs/integrations/telegram.md` for Telegram work.
- Read `../../../docs/data/rtdb-schema.md` when paths or retention change.
- Read `../../../docs/product/module-catalog.md` when capabilities change.

Use the detailed Meta setup guide only for provider-console operations. Keep Planned WhatsApp in-chat login separate from Current deferred web login.

## Pipeline invariants

1. Read raw body before parsing when required for signature verification.
2. Resolve tenant from a trusted provider identifier/configuration mapping.
3. Verify provider authenticity before queue publication.
4. Normalize only supported event types into a typed internal payload.
5. Return webhook responses promptly; do not run AI/provider-heavy work inline.
6. Publish one stable job per supported event.
7. Verify QStash/worker authorization and validate payload schema.
8. Transactionally claim message/update idempotency before side effects.
9. Re-check enabled integration/module behavior where configuration can change after enqueue.
10. Mark job and domain delivery outcome completed/failed with safe telemetry.

## WhatsApp rules

- Resolve POST tenant by Meta phone-number ID; verify `x-hub-signature-256` with the correct app secret and raw body.
- GET verification must match the configured tenant and verify token.
- Respect `whatsapp_inbound_ai`: when disabled, send no AI or consent prompts.
- Resolve identity through the tenant WA-ID index; keep scan/backfill only as migration compatibility.
- Apply consent, announcement preference, and opt-out before business messaging.
- Within the Meta customer-service window, direct text may be allowed by policy; outside it, require an approved mapped template.
- Resolve template schema from synchronized approved cache; enforce language and parameter order/count/type.
- Persist per-trigger/per-recipient delivery outcome for idempotency and support.
- Treat STOP-like opt-out actions as durable preferences; do not override them with retries or fallback.
- Keep login tokens single-use and enforce expiry. Preserve current deferred web login semantics unless implementing an approved planned change.

## Telegram rules

- Validate `x-telegram-bot-api-secret-token` with timing-safe comparison.
- Normalize message, callback, chat, and user identifiers as strings.
- Distinguish private/group/supergroup/channel behavior.
- Claim update/message/callback identity before AI replies or task transitions.
- Require tenant-bound, unambiguous staff onboarding; phone auto-link only on exactly one active match.
- Enforce department routing and group-admin policy before outbound delivery/action.
- Preserve legacy worker payload normalization only while old queued jobs can arrive; test and document removal.

## Queue and retry rules

- Use the repository queue publisher and configured retry resolver.
- Do not place decrypted credentials or unnecessary message content in job payloads.
- Include tenant, job, provider event/message ID, receive time, and typed event data.
- Separate retryable transport/provider errors from validation, policy, and permanent template errors.
- Make repeated jobs converge to one domain outcome.
- Recover expired processing leases; do not steal live work.
- Record bounded `lastError`, attempt, timestamps, and external delivery ID where safe.

## Template and opt-out checklist

- Feature enabled and tenant integration enabled.
- Recipient identity and locale resolved from tenant data.
- Opt-out/announcement preference checked before enqueue/send.
- Template approved, cached, mapped to trigger, and schema-compatible.
- Customer-service-window policy selected intentionally.
- Fallback does not bypass consent, opt-out, template approval, or capability gates.
- Result persisted and observable.

## Tests

Cover invalid authenticity, missing/disabled config, unknown tenant mapping, malformed/irrelevant payload, queue failure, worker auth, invalid job schema, duplicate delivery, live/stale lease, retryable/permanent provider errors, opt-out, closed service window, template mismatch, and successful completion. Use fictional identifiers and no live credentials.

## Operational handoff

Update the runbook for configuration, smoke-check, telemetry, or rollback changes. Report how to disable the narrow behavior first (AI/trigger/routing), then transport only when total shutdown is required. Preserve reconciliation records during rollback.
