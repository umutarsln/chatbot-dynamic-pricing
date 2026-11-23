---
name: otai-design-system
description: Apply Otai's three-surface design system to admin/staff/superadmin product UI, tenant-branded guest app/chat, and the Shadow DOM website widget. Use when designing, implementing, refactoring, or reviewing components, tokens, colors, typography, radius, elevation, states, responsive behavior, RTL, accessibility, or motion.
---

# Otai Design System

Keep product operations, tenant guest branding, and the Aura widget visually related but token-isolated.

## Load canonical context

Read `../../../docs/design/design-system.md` completely. Then inspect the owning surface:

For component placement, reuse, dependency, or client-boundary work, also use
`otai-frontend-architecture` and read `../../../docs/design/component-system.md`.

- Product/admin: `src/app/globals.css`, `components.json`, and `src/components/ui/`.
- Guest app/chat: tenant theme context plus the owning guest components.
- Widget: `widget/src/widget-design.ts` and the owning Shadow DOM component.

Do not use current one-off styling as precedent when it conflicts with the canonical design document.

## Select the surface first

### Product/admin/staff/superadmin

- Use shadcn New York primitives, semantic CSS variables, Tailwind utilities, `cn()`, and Lucide icons.
- Prefer restrained operational hierarchy, compact but readable density, and one clear primary action.
- Use built-in component variants and complete accessible composition.
- Do not add decorative gradients, glass, arbitrary shadows/z-index, excessive rounding, or raw color palettes.

### Tenant guest app/chat

- Use `--custom-primary`, dark/light/text/border variants only for branded actions, selected states, and conversational emphasis.
- Keep canvas, error, success, warning, focus, and readable body semantics independent from tenant branding.
- Check every supported theme preset for contrast.
- Preserve identity, consent, streaming, retry, and blocked states without color-only meaning.

### Website widget

- Use `AURA_WIDGET_TOKENS` and injected Shadow DOM CSS.
- Preserve deliberate premium glass/mesh/editorial treatments within performance and contrast limits.
- Prevent host CSS leakage in either direction.
- At 520px and below, preserve the full-viewport mobile contract and safe-area behavior.

## Component rules

- Reuse installed `src/components/ui` primitives before adding a bespoke control.
- Compose accessible Dialog/Sheet titles, Card regions, labels/errors, Avatar fallback, and tooltips for unlabeled icon actions.
- Use Skeleton for shaped loading, Sonner for transient results, AlertDialog for destructive confirmation, and semantic Badge states.
- Use `gap-*` for layout spacing and `size-*` for square icons.
- Avoid nested card shells; use hierarchy, spacing, and separators.
- Consolidate repeated chat message, bubble, scroller, composer, and state patterns.
- Never use emoji as interface icons.

## Interaction and accessibility

- Cover default, hover, focus, active, disabled, loading, empty, success, warning, error, permission-denied, and destructive states.
- Maintain visible focus, keyboard access, accessible names, labels/descriptions/errors, and sensible focus restoration.
- Meet 4.5:1 normal-text and 3:1 large-text contrast.
- Use text/icon/structure in addition to state color.
- Keep product motion around 150–250ms, animate transform/opacity where possible, and honor reduced motion.
- Use logical spacing and verify Arabic RTL plus `en`, `tr`, `de`, and `ru` expansion.
- Preserve primary actions on small screens; do not merely squeeze desktop layouts.

## Review procedure

1. Identify surface and token owner.
2. Inventory existing primitive/composition before coding.
3. Map every color, radius, typography, elevation, and state to semantic tokens.
4. Implement mobile and RTL behavior explicitly.
5. Verify keyboard, screen-reader name, focus, contrast, reduced motion, loading/error/empty states.
6. Run relevant component tests and visual/manual checks.
7. Update the canonical design document for new cross-surface rules or tokens.

Update the component system instead when the durable change concerns component
taxonomy, reuse, placement, or composition ownership rather than visual tokens.

When reviewing, distinguish violations from documented migration debt and provide the smallest reusable correction.
