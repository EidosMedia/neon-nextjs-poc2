---
name: neon-page-type
description: "Add a new Neon CMS content type to the front-office. Use when creating a new page type, registering a new baseType, or adding a new content renderer. Triggers: 'add page type', 'new content type', 'register baseType', 'new CMS type'."
argument-hint: "Name of the new content type (e.g. 'podcast', 'gallery')"
---

# Add a New Neon CMS Content Type

Use this skill to add full rendering support for a new Neon CMS `baseType`.

## Steps

### 1. Define the model

Create `src/types/models/<Name>Model.ts`:

```ts
import { BaseModel } from '@eidosmedia/neon-frontoffice-ts-sdk';

export type <Name>Model = {
  title: string;
  // add fields matching the CMS schema
} & BaseModel;
```

Export it from `src/types/models/index.ts`:

```ts
export * from './<Name>Model';
```

### 2. Create the default page component

Create `src/app/_pages/<Name>.tsx`.
This is the **default theme** template — it lives directly in `_pages/`, not in a subdirectory.
It must import Navbar and Footer from `../components/`:

```tsx
import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { <Name>Model } from '@/types/models';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

type Props = { data: PageData<<Name>Model> };

export default function <Name>({ data }: Props) {
  return (
    <>
      <Navbar data={data} />
      {/* render data.model.data fields here */}
      <Footer data={data} />
    </>
  );
}
```

### 3. Export from the `_pages` barrel and all theme barrels

Add the export to `src/app/_pages/index.ts` (default barrel):

```ts
export { default as <Name> } from './<Name>';
```

Then add a matching export to every theme barrel (`_pages/adn/index.ts`, `_pages/nyt/index.ts`, `_pages/wire/index.ts`). If a theme does not need a custom layout, re-export the default version:

```ts
// src/app/_pages/<theme>/index.ts
export { default as <Name> } from '../<Name>';   // re-exports default
```

All theme barrels must export the same set of keys as the default barrel — the TypeScript type of `THEME_MAP` enforces this. If a theme needs a custom layout, create `src/app/_pages/<theme>/<Name>.tsx` and export that instead.

### 4. Register the componentKey in the catch-all route

In `src/app/[[...slug]]/page.tsx`, add the mapping to `resolveBaseTypeKey()`:

```ts
function resolveBaseTypeKey(baseType: string): string {
  const map: Record<string, string> = {
    // ... existing entries ...
    '<newbasetype>': '<Name>',   // ← add this line
  };
  return map[baseType] ?? 'Article';
}
```

The component is now automatically resolved for all registered themes. If a theme doesn't export `<Name>`, the router falls back to the default theme's version.

### 5. (Optional) Add per-theme overrides

For each additional theme (e.g. `adn`) that needs a different layout for this content type, create `src/app/_pages/<theme>/<Name>.tsx` with the theme-specific rendering and export it from `src/app/_pages/<theme>/index.ts`.

### 6. (Optional) Register a single-slug special route

If the content type has a fixed URL (e.g. `/podcast`), add a case inside the `switch (slug[0])` block in `[[...slug]]/page.tsx`. Use `resolvePageComponent` so the route respects the active theme, with `DefaultPages.<Name>` as the fallback:

```ts
case '<slug>': {
  if (site) {
    const theme = site.root.attributes?.theme ?? 'default';
    const <Name>Page =
      (resolvePageComponent('<Name>', theme) as React.ComponentType<{ data: typeof site }>) ??
      DefaultPages.<Name>;
    return (
      <div className="root" data-theme={theme}>
        <LoggedUserBar data={{ siteData: { ...site, viewStatus } }} />
        <<Name>Page data={site} />
      </div>
    );
  }
}
```

Note: fixed-URL pages receive a bare `Site` object (not `PageData`), so the component must accept `{ data: Site }`.

## Checklist

- [ ] Model type defined and exported from `src/types/models/index.ts`
- [ ] Default template created at `src/app/_pages/<Name>.tsx`
  - imports `Navbar` from `'../components/Navbar'`
  - imports `Footer` from `'../components/Footer'`
- [ ] Export added to `src/app/_pages/index.ts` (default barrel)
- [ ] Matching export added to every theme barrel (`_pages/adn/index.ts`, `_pages/nyt/index.ts`, `_pages/wire/index.ts`) — re-export from default if no custom layout
- [ ] `baseType` → `componentKey` mapping added to `resolveBaseTypeKey()` in `[[...slug]]/page.tsx`
- [ ] `npx tsc --noEmit` passes (all barrels must have the same exported key set)
- [ ] (Optional) Per-theme overrides added to each relevant `_pages/<theme>/` directory and its `index.ts`
- [ ] (Optional) Fixed-URL slug case uses `resolvePageComponent` with `DefaultPages.<Name>` fallback
