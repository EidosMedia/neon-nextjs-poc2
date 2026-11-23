import { readFileSync } from 'fs';
import { join } from 'path';
import { REQUIRED_TOKENS, getBrand } from '@/app/_v2/brands/registry';
import arenaTokens from '@/app/_v2/brands/sportsarena/tokens.json';

const BRANDS_DIR = join(process.cwd(), 'src/app/_v2/brands');

// Each brand file defines one or more data-theme keys in its `.root[data-theme="..."]` rule.
const BRAND_FILES: Array<{ dir: string; themeKeys: string[] }> = [
  { dir: 'theglobe', themeKeys: ['default', 'theglobe'] },
  { dir: 'sportsarena', themeKeys: ['sportsarena'] },
  { dir: 'nextfrontier', themeKeys: ['nextfrontier'] },
];

type CssRule = { selectors: string; body: string };

const parseRules = (css: string): CssRule[] => {
  const rules: CssRule[] = [];
  const pattern = /([^{}]+)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(css)) !== null) {
    rules.push({ selectors: match[1].trim(), body: match[2] });
  }
  return rules;
};

const declaredProperties = (body: string): Set<string> =>
  new Set(
    [...body.matchAll(/(--[A-Za-z0-9-]+)\s*:/g)].map((m) => m[1]),
  );

describe('v2 brand tokens', () => {
  describe.each(BRAND_FILES)('$dir/tokens.css', ({ dir, themeKeys }) => {
    const css = readFileSync(join(BRANDS_DIR, dir, 'tokens.css'), 'utf8');
    const rules = parseRules(css);

    it.each(themeKeys)('defines every REQUIRED_TOKENS name inside .root[data-theme="%s"]', (key) => {
      const selector = `.root[data-theme="${key}"]`;
      const matching = rules.filter((rule) => rule.selectors.includes(selector));
      expect(matching.length).toBeGreaterThan(0);

      const defined = new Set<string>();
      matching.forEach((rule) => declaredProperties(rule.body).forEach((p) => defined.add(p)));

      const missing = REQUIRED_TOKENS.filter((token) => !defined.has(token));
      expect(missing).toEqual([]);
    });
  });

  it('REQUIRED_TOKENS lists the semantic colour, font, radius, space and font-size names', () => {
    expect(REQUIRED_TOKENS).toEqual(
      expect.arrayContaining([
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
      ]),
    );
    expect(REQUIRED_TOKENS).toHaveLength(33);
  });

  it('getBrand maps default, theglobe and unknown or empty themes to The Globe', () => {
    expect(getBrand('').key).toBe('theglobe');
    expect(getBrand('default').key).toBe('theglobe');
    expect(getBrand('theglobe').key).toBe('theglobe');
    expect(getBrand('x').key).toBe('theglobe');
  });

  it('getBrand resolves Sports Arena and Next Frontier', () => {
    expect(getBrand('sportsarena').key).toBe('sportsarena');
    expect(getBrand('nextfrontier').key).toBe('nextfrontier');
  });

  it('getBrand reports Next Frontier as a dark scheme and the others as light', () => {
    expect(getBrand('nextfrontier').scheme).toBe('dark');
    expect(getBrand('theglobe').scheme).toBe('light');
    expect(getBrand('sportsarena').scheme).toBe('light');
  });
});

describe('Sports Arena color contract', () => {
  const colors = Object.fromEntries(arenaTokens.color.tokens.map(token => [token.name, token.value]));
  const css = readFileSync(join(BRANDS_DIR, 'sportsarena', 'tokens.css'), 'utf8');
  const luminance = (hex: string) => {
    const channels = hex.slice(1).match(/../g)!.map(pair => parseInt(pair, 16) / 255)
      .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const contrast = (a: string, b: string) => {
    const values = [luminance(a), luminance(b)].sort((x, y) => x - y);
    return (values[1] + 0.05) / (values[0] + 0.05);
  };

  it('keeps the design tokens and CSS variables in sync', () => {
    expect(colors).toMatchObject({
      'primary-500': '#CF3B24', 'primary-600': '#A82A16', 'primary-700': '#3B1519',
      'primary-100': '#FFEAE2', 'accent-300': '#FFB496', 'neutral-200': '#FFF6F2',
      'neutral-300': '#EADBD4', 'live-500': '#0E7C4A', 'error-500': '#B00020',
    });
    for (const [name, value] of Object.entries(colors)) {
      expect(css).toContain(`--arena-${name}: ${value};`);
    }
    expect(css).not.toMatch(/#(?:004e98|7fa6cc|dce9f5)\b/i);
  });

  it('meets AA contrast for the requested combinations', () => {
    expect(contrast(colors['neutral-100'], colors['primary-500'])).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colors['neutral-100'], colors['primary-700'])).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colors['neutral-900'], colors['accent-300'])).toBeGreaterThanOrEqual(4.5);
    expect(contrast(colors['primary-600'], colors['primary-100'])).toBeGreaterThanOrEqual(5);
    expect(contrast(colors['live-500'], colors['neutral-100'])).toBeGreaterThanOrEqual(4.5);
  });
});

describe('globals.css layering for v2', () => {
  const globalsCss = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');
  const withoutComments = globalsCss.replace(/\/\*[\s\S]*?\*\//g, '');

  it('declares v2 between components and utilities as the first statement', () => {
    const firstStatement = `${withoutComments.trim().split(';')[0].trim()};`;
    expect(firstStatement).toBe('@layer theme, base, components, v2, utilities;');
  });

  it.each(['article-xl', 'article-md'])(
    'excludes v2 roots from the unlayered [data-type="%s"] rule',
    (type) => {
      const bareRule = new RegExp(`^\\s*\\[data-type="${type}"\\]\\s*\\{`, 'm');
      expect(globalsCss).not.toMatch(bareRule);
      expect(globalsCss).toContain(`[data-type="${type}"]:where(:not(.root[data-engine="v2"] *), .v2-legacy *) {`);
    },
  );

  it('excludes v2 roots from the unlayered p > a rule', () => {
    expect(globalsCss).toContain('a:where(:not(.root[data-engine="v2"] *), .v2-legacy *) {\n    @apply text-base underline');
  });

  it.each(['body-large', 'body-medium', 'body-small', 'subhead1', 'subhead2', 'author-medium', 'author-small'])(
    'guards the unlayered .%s typography rule',
    (cls) => {
      expect(globalsCss).toContain(`.${cls}:where(:not(.root[data-engine="v2"] *), .v2-legacy *)`);
    },
  );

  it('does not import the legacy sportsarena/nextfrontier theme files', () => {
    expect(globalsCss).not.toContain('themes/sportsarena.css');
    expect(globalsCss).not.toContain('themes/nextfrontier.css');
  });
});
