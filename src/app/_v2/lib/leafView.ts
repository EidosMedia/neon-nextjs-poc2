import type { AdDensity, ArticleLeafVariant, LeafSettings, LiveblogLeafVariant } from './settings';

export type AdPlacement = 'afterHero' | 'midBody' | 'end' | 'rail';

export function planAdSlots(density: AdDensity, hasRail: boolean): AdPlacement[] {
  const tail: AdPlacement = hasRail ? 'rail' : 'end';
  if (density === 'low') return [tail];
  if (density === 'medium') return ['afterHero', tail];
  return ['afterHero', 'midBody', tail];
}

export function resolveLiveblogLeafView(s: Extract<LeafSettings, { kind: 'liveblog' }>): {
  variant: LiveblogLeafVariant; showLiveTag: boolean; showPinned: boolean; showHero: boolean;
} {
  return {
    variant: s.variant,
    showLiveTag: s.liveTag && s.variant !== 'endedArchive',
    showPinned: s.pinnedSummary,
    showHero: s.variant !== 'resultsPanel',
  };
}

export function resolveArticleLeafView(
  s: Extract<LeafSettings, { kind: 'article' }>,
  hasImage: boolean,
): {
  variant: ArticleLeafVariant;
  hero: 'above' | 'behind' | 'none' | 'portrait';
  titleSize: 'standard' | 'large';
  paywall: boolean;
  correlates: number;
} {
  let hero: 'above' | 'behind' | 'none' | 'portrait';
  switch (s.variant) {
    case 'fullBleedHero': hero = 'behind'; break;
    case 'textLed': hero = 'none'; break;
    case 'opinion': hero = 'portrait'; break;
    default: hero = 'above';
  }
  if (!hasImage) hero = 'none';
  return {
    variant: s.variant,
    hero,
    titleSize: s.variant === 'fullBleedHero' || s.variant === 'textLed' ? 'large' : 'standard',
    paywall: s.variant === 'paywalled',
    correlates: s.correlates,
  };
}

type Node = { nodeType?: unknown; value?: unknown; attributes?: unknown; elements?: unknown };

const isNode = (n: unknown): n is Node => typeof n === 'object' && n !== null && !Array.isArray(n);
const kids = (n: Node): Node[] => (Array.isArray(n.elements) ? n.elements.filter(isNode) : []);
const type = (n: Node): string => (typeof n.nodeType === 'string' ? n.nodeType : '');
const isImage = (n: Node) => type(n).startsWith('image') && !type(n).endsWith('-caption') && type(n) !== 'image-credit';
const srcOf = (n: Node): string | undefined => {
  const a = n.attributes;
  const src = isNode(a) ? (a as Record<string, unknown>).src : undefined;
  return typeof src === 'string' && src ? src : undefined;
};
function textOf(n: Node): string {
  if (typeof n.value === 'string' && n.value) return n.value;
  return kids(n).map(textOf).join('').trim();
}
const nonEmpty = (s: string | undefined) => (s ? s : undefined);

export function extractGalleryImages(content: unknown): { src: string; caption?: string; credit?: string }[] {
  const out: { src: string; caption?: string; credit?: string }[] = [];
  const visit = (n: unknown, depth: number) => {
    if (!isNode(n) || depth > 50) return;
    if (type(n) === 'inline-media-group') {
      const children = kids(n);
      const image = children.find(c => isImage(c) && srcOf(c));
      const src = image && srcOf(image);
      if (src) {
        const cap = children.find(c => type(c) === 'image-caption' || type(c) === 'graphic-caption');
        // Credit source is not used by the legacy slider renderer.
        const cred = children.find(c => type(c) === 'credit' || type(c) === 'image-credit');
        out.push({
          src,
          caption: nonEmpty(cap && textOf(cap)),
          credit: nonEmpty(cred && textOf(cred)),
        });
      }
      return;
    }
    if (isImage(n)) {
      const src = srcOf(n);
      if (src) out.push({ src, caption: undefined, credit: undefined });
      return;
    }
    kids(n).forEach(c => visit(c, depth + 1));
  };
  const galleries: Node[] = [];
  const find = (n: unknown, depth: number) => {
    if (!isNode(n) || depth > 50) return;
    if (type(n) === 'mediagallery') { galleries.push(n); return; }
    kids(n).forEach(c => find(c, depth + 1));
  };
  find(content, 0);
  if (galleries.length > 0) galleries.forEach(g => kids(g).forEach(c => visit(c, 1)));
  else visit(content, 0);
  return out;
}

export function planRail(hasRailBrand: boolean, sidebarBlocks: number, railAds: number): 'show' | 'collapse' {
  return hasRailBrand && sidebarBlocks + railAds > 0 ? 'show' : 'collapse';
}
