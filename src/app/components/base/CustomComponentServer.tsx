/**
 * Async Server Component that resolves and renders a custom uicomponent
 * from the upstream uicomponents bundle entirely on the server.
 *
 * The bundle is loaded once per Node.js process via `loadServerBundle`
 * (cached in memory). The resolved React component is rendered during SSR
 * so the full markup is included in the initial HTML — no client JS required.
 *
 * Falls back to null when the bundle is unreachable or the component name
 * is not found, keeping the page functional.
 *
 * Usage (from a Server Component or a shared utility like renderContent):
 *   <CustomComponentServer nodeType="editor-component" componentname="PexelsVideoRenderer" content={el} />
 */

import type { ContentElement } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { fetchUiComponentsManifest } from '@/services/uiComponents';
import { resolveServerComponent } from '@/services/uiComponentsServerLoader';

type UiComponentCategory = 'cards' | 'widgets' | 'editor';

function categoryFromNodeType(nodeType: string): UiComponentCategory {
  if (nodeType.startsWith('card-')) return 'cards';
  if (nodeType.startsWith('widget-')) return 'widgets';
  // The content.tsx renderer matches [a-z]+-component (suffix).
  // All such nodes are editor custom components.
  if (nodeType.endsWith('-component')) return 'editor';
  return 'editor';
}

type Props = {
  nodeType: string;
  componentname: string;
  content: ContentElement;
};

export default async function CustomComponentServer({ nodeType, componentname, content }: Props) {
  if (!componentname) return null;

  const category = categoryFromNodeType(nodeType);

  // Guard: check manifest before loading the full bundle.
  const manifest = await fetchUiComponentsManifest();
  if (!manifest.categories[category].includes(componentname)) {
    console.warn(
      `[CustomComponentServer] "${componentname}" not found in manifest category "${category}". ` +
        `Available: [${manifest.categories[category].join(', ')}]`,
    );
    return null;
  }

  const Component = await resolveServerComponent(category, componentname);
  if (!Component) return null;

  // Pass attributes as expected by uicomponent renderer props.
  return <Component attributes={content.attributes ?? {}} content={content} nodeType={nodeType} />;
}
