---
name: otai-ai-workflows
description: Implement and review Otai AI workflows across guest chat, staff chat, widget chat, classification, translation, task feedback, WhatsApp, and Telegram. Use when changing model/provider selection, reasoning controls, prompt construction or caching, tools, structured output, streaming, fallback, safety gates, Langfuse tracing, or AI tests.
---

# Otai AI Workflows

Build AI behavior through the shared runtime and preserve authorization, tool safety, graceful streaming, provider fallback, prompt-cache isolation, and observability.

## Inspect before changing

Read `src/platform/ai/server/runtime/model-runtime.ts`, its tests under `tests/platform/ai/server/runtime/`, the owning route/service, and `src/platform/ai/server/telemetry/langfuse.ts`. Read `../../../docs/architecture/ai-architecture.md` and `../../../docs/architecture/overview.md` for platform boundaries. For channel AI, also read the relevant `../../../docs/integrations/` runbook. For UI streaming, read `../../../docs/design/design-system.md`.

## Model selection

- Select a declared `AiUseCase` from `src/platform/ai/contracts/model.ts`: `guestChat`, `staffChat`, `widgetChat`, `messageClassification`, `contentTranslation`, `taskFeedbackDraft`, `taskEstimation`, or `pmsTaskRouting`.
- Call `resolveAiModel(useCase, options)` instead of instantiating Google/OpenAI providers locally.
- Pass `tenantId` for tenant behavior and stable `cacheKeyParts` for prompt variants.
- Check declared capabilities before requiring streaming, tools, structured output, reasoning controls, or provider cache behavior.
- Keep provider/model configuration server-only. Fail closed when selected provider credentials are missing.
- Add a new use case to the shared runtime with defaults, configuration prefix, capability tests, and owning call sites; do not overload an unrelated use case.

## Prompt construction and cache

- Separate stable system/tenant knowledge from request-specific messages.
- Include tenant identity in every tenant-scoped cache key. Include all stable prompt/version/locale/tool-schema inputs that change semantics.
- Never include raw secrets, auth tokens, or unnecessary PII in cache keys or cached prompt content.
- For OpenAI, use runtime-provided prompt cache key/options; do not assume extended retention for unsupported models.
- For Gemini native cached content, apply it only through `withGeminiCachedContent` and only to a compatible Google model.
- Invalidate tenant prompt caches after authorized prompt/guide updates.
- Version materially changed prompt contracts so stale cache entries cannot silently alter behavior.

## Tool gating

Before exposing a tool, require all applicable gates:

1. authenticated actor/channel identity and tenant match;
2. module/feature entitlement;
3. role/page permission or guest consent/lifecycle state;
4. tenant configuration enabling the capability;
5. validated tool arguments and resource ownership;
6. server-side execution through the owning domain service.

Do not rely on prompt instructions to enforce authorization. Keep irreversible or external side effects behind explicit validation and idempotency. Bound multi-step tool loops with the established step limiter. Return minimal tool results; do not leak internal records or secrets back into model context.

## Streaming

- Use `streamText` for interactive chat and `generateText` only when a complete bounded response is appropriate.
- Set `Cache-Control: no-cache` for streams and preserve the established response protocol.
- Handle abort/disconnect and flush/close telemetry in `finally` paths.
- Do not persist partial assistant output as completed content.
- Surface a safe recoverable error to the user; keep provider details in server telemetry.
- If tools are unavailable/blocked, choose an explicit non-tool response path rather than pretending execution succeeded.

## Fallback

- Enable fallback explicitly with `allowFallback` and use the resolver-attached fallback.
- Retry only errors classified by `isAiProviderRetryableError` or an equally narrow owning policy.
- Do not fallback on validation, authorization, consent, tool-policy, malformed request, or deterministic application errors.
- Preserve the same tenant, prompt, tools, safety, output schema, and correlation context across models.
- Prevent fallback loops and record primary/fallback provider and outcome.
- For user-critical non-generative copy, prefer a deterministic safe application fallback when available.

## Langfuse and telemetry

- Initialize tracing only through the shared instrumentation helper and tolerate observability being disabled.
- Trace use case, tenant-safe identifiers, provider/model, fallback, latency, token/cache metadata, tool names/outcomes, and error class.
- Never trace credentials, cookies, JWTs, raw sensitive profiles, or unnecessary full prompts/messages.
- Keep parent/child spans correlated across route, model call, tool, and fallback.
- End/flush spans on success, failure, and stream cancellation without delaying the user path unnecessarily.

## Safety and output

- Validate request schemas before model invocation and tool schemas at execution.
- Sanitize rendered Markdown/HTML and validate outbound links.
- Keep locale and RTL behavior intact.
- Treat model output as untrusted; validate structured output before persistence.
- Apply domain length/rate limits and channel consent/opt-out rules before delivery.

## Verification

Test model resolution, missing credentials, provider options, tenant cache-key separation, tool-denied/tool-enabled behavior, streaming success/error/abort, trace-disabled behavior, retryable fallback, non-retryable no-fallback, structured-output validation, and cache invalidation. Mock providers; never call live models in unit tests.

