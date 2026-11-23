---
name: testing
description: Adds colocated Vitest tests for reputation behavior and installs Vitest on the first domain change. Use when writing tests, APIs, services, adapters, or UI states; when fixing bugs; or when the user mentions test, Vitest, 401, 403, 429, or teslim.
---

# Testing

Behavior change is not done without a test. Do **not** add an empty `test/` folder or install Vitest until the first real domain/API/UI behavior lands.

## First install (only when the first test is needed)

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

Add scripts: `"test": "vitest run"`, `"test:watch": "vitest"`. Config: `vitest.config.ts` — default environment `node`, alias `@` → `src`. Component tests opt into jsdom with `// @vitest-environment jsdom`.

## Layers

| Layer | When | Example |
| --- | --- | --- |
| Unit | Pure rules | score normalization, channel mapping |
| Flow / service | State change | received → replied; idempotent sync |
| Route contract | Every API | 401/403, validation, wrong hotel |
| Adapter | Every external channel | fake payload, bad signature, duplicate delivery |
| Component (jsdom) | Form / states | empty / loading / error / filled |
| Browser | Visible flow | inbox → publish reply |
| `tsc` + lint | Every delivery | `npx tsc --noEmit`, `npm run lint` |

## Conventions

- Colocate: `route.ts` → `route.test.ts` (same directory).
- Mock network, channel APIs, clocks, randomness. No production credentials or live hotel IDs.
- Bug fix: first a test that fails for the original defect, then the fix.
- No snapshots. Assert contract fields (status, body keys, headers).
- Guest/public surfaces: rate limit + at least one **429** test.
- Auth or hotel boundary: missing identity (401), wrong hotel (403).

## Commands

```bash
npx tsc --noEmit
npx vitest run path/to/file.test.ts
npm test
```

If Vitest is not installed and this change has no behavior, skip tests. If it has behavior, install in this turn, then run the new file.
