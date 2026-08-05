---
name: neon-sdk-boundary
description: "Maintain the Neon TypeScript SDK dependency boundary and public contracts. Use when moving shared types into the SDK, changing SDK exports, fixing an SDK import of application source, or updating ViewStatus and SiteViewStatus. Triggers: 'SDK boundary', 'SDK dependency', 'SDK import', 'shared SDK type', 'ViewStatus', 'SiteViewStatus', 'SDK public contract'."
argument-hint: "Describe the shared SDK contract or dependency-boundary change."
---

# Neon SDK Dependency Boundary

`src/neon-frontoffice-ts-sdk/` is a framework-independent package. It may depend only on its
own source and external packages; it must not import from the Next.js application, including
`src/app`, `src/hooks`, `src/services`, `src/types`, or parent-relative paths that escape the SDK.

## Shared Contracts

Define Neon CMS types, enums, mappings, and helpers in the SDK when both the SDK and front office
need them. Export them from `src/neon-frontoffice-ts-sdk/src/index.ts`; application code imports
them through `@eidosmedia/neon-frontoffice-ts-sdk`.

The SDK owns view status:

| Type | Values | Use |
|---|---|---|
| `ViewStatus` | `LIVE`, `PREVIEW` | Editorial and application state |
| `SiteViewStatus` | `live`, `preview` | Neon site API paths |

Use `toSiteViewStatus()` to convert canonical values. At external boundaries, normalize raw
headers, query parameters, and backend payloads with `normalizeViewStatus()` or `parseViewStatus()`
before using typed values.

## Change Checklist

1. Add or update the contract under `src/neon-frontoffice-ts-sdk/src/`.
2. Export public symbols through `src/neon-frontoffice-ts-sdk/src/index.ts`.
3. Replace application imports with `@eidosmedia/neon-frontoffice-ts-sdk` imports.
4. Remove duplicate application definitions after all consumers migrate.
5. Add SDK-level unit tests for the public behavior.
6. Run `npm run build --prefix src/neon-frontoffice-ts-sdk` and
   `npm test --prefix src/neon-frontoffice-ts-sdk -- --runInBand`.
7. Update `AGENTS.md`, `src/neon-frontoffice-ts-sdk/README.md`, and both mirrored copies of this
   skill in the same change.

Keep `.agents/skills/neon-sdk-boundary/SKILL.md` and
`.claude/skills/neon-sdk-boundary/SKILL.md` synchronized.