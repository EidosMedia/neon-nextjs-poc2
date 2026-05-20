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

### 2. Create the page component

Create `src/app/_pages/<Name>.tsx`.  
Receives `PageData<<Name>Model>` and must include the site-wide layout (Navbar + Footer):

```tsx
import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { <Name>Model } from '@/types/models';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

type Props = { data: PageData<<Name>Model> };

export default function <Name>({ data }: Props) {
  const { model, site } = data;

  return (
    <>
      <Navbar data={site} />
      {/* render model.data fields here */}
      <Footer data={site} />
    </>
  );
}
```

### 3. Register the baseType in the catch-all route

In `src/app/[[...slug]]/page.tsx`, add a case to the `resolvePage()` switch:

```ts
import <Name> from '@/app/_pages/<Name>';

// inside resolvePage():
case '<newbasetype>':
  return <<Name> data={pageDataJSON} />;
```

### 4. (Optional) Register a single-slug special route

If the content type has a fixed URL (e.g. `/podcast`), add a case before the CMS lookup:

```ts
if (slug?.length === 1 && slug[0] === '<slug>') {
  return <<Name> data={site} />;
}
```

Note: fixed-URL pages receive a bare `Site` object, not `PageData`.

## Checklist

- [ ] Model type defined and exported from `src/types/models/index.ts`
- [ ] Page component created in `src/app/_pages/`
- [ ] `baseType` case registered in `[[...slug]]/page.tsx`
- [ ] Component renders `<Navbar>` and `<Footer>` from the site data
