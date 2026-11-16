import type { ConcreteComposition } from '../lib/layout';

export type BrandKey = 'theglobe' | 'sportsarena' | 'nextfrontier';

export type Brand = {
  key: BrandKey;
  name: string;
  scheme: 'light' | 'dark';
  fontsHref: string;
  header: 'globe' | 'arena' | 'frontier';
  footer: 'globe' | 'arena' | 'frontier';
  leafRail: boolean;
  leafWidths: { main: number; body: number; rail: number };
  compositionDefaults: Partial<Record<string, ConcreteComposition>>;
};

const BRANDS: Record<BrandKey, Brand> = {
  theglobe: {
    key: 'theglobe',
    name: 'The Globe',
    scheme: 'light',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Gabarito:wght@400;600;700&family=Epilogue:wght@400;600;700&display=swap',
    header: 'globe',
    footer: 'globe',
    leafRail: false,
    leafWidths: { main: 760, body: 560, rail: 0 },
    compositionDefaults: { main: 'leadList', context: 'threeUp', insight1: 'split', insight2: 'grid2x2', insight3: 'overlayPair' },
  },
  sportsarena: {
    key: 'sportsarena',
    name: 'Sports Arena',
    scheme: 'light',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600&family=Open+Sans:wght@400;600;700&display=swap',
    header: 'arena',
    footer: 'arena',
    leafRail: true,
    leafWidths: { main: 920, body: 600, rail: 300 },
    compositionDefaults: { main: 'leadList', context: 'threeUp', insight1: 'threeUp', insight2: 'grid2x2', insight3: 'threeUp' },
  },
  nextfrontier: {
    key: 'nextfrontier',
    name: 'Next Frontier',
    scheme: 'dark',
    fontsHref:
      'https://fonts.googleapis.com/css2?family=Abril+Fatface&family=PT+Sans:wght@400;700&family=Noto+Sans:wght@400;600&family=IBM+Plex+Mono:wght@400&display=swap',
    header: 'frontier',
    footer: 'frontier',
    leafRail: true,
    leafWidths: { main: 1040, body: 664, rail: 320 },
    compositionDefaults: { main: 'leadList', context: 'fourUp', insight1: 'threeUp', insight2: 'grid2x2', insight3: 'fourUp' },
  },
};

const THEME_TO_BRAND: Record<string, BrandKey> = {
  sportsarena: 'sportsarena',
  nextfrontier: 'nextfrontier',
};

/** Resolves a `data-theme` value to a brand. Unknown, empty and `default` values fall back to The Globe. */
export function getBrand(theme: string): Brand {
  return BRANDS[THEME_TO_BRAND[theme] ?? 'theglobe'];
}

/** Every brand's tokens.css must define these inside its `.root[data-theme="<key>"]` rule. */
export const REQUIRED_TOKENS: readonly string[] = [
  '--v2-bg',
  '--v2-surface',
  '--v2-surface-raised',
  '--v2-text',
  '--v2-text-muted',
  '--v2-rule',
  '--v2-brand',
  '--v2-brand-strong',
  '--v2-on-brand',
  '--v2-accent',
  '--v2-on-accent',
  '--v2-live',
  '--v2-link',
  '--v2-font-display',
  '--v2-font-heading',
  '--v2-font-body',
  '--v2-font-meta',
  '--v2-radius-card',
  '--v2-radius-media',
  '--v2-radius-pill',
  '--v2-space-1',
  '--v2-space-2',
  '--v2-space-3',
  '--v2-space-4',
  '--v2-space-5',
  '--v2-space-6',
  '--v2-fs-h1',
  '--v2-fs-h2',
  '--v2-fs-h3',
  '--v2-fs-h4',
  '--v2-fs-body',
  '--v2-fs-standfirst',
  '--v2-fs-meta',
];
