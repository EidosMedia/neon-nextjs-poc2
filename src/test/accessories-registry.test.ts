import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { getAccessoryDefinitions, listAccessoryThemes, isV2Theme, V2_THEMES } from '@/lib/accessories/definitions';
import { BRAND_ACCESSORIES } from '@/app/_v2/brands/accessories';
import sharedFile from '@/app/_v2/accessories.json';

const v2Dir = join(process.cwd(), 'src/app/_v2');
const brandsDir = join(v2Dir, 'brands');
const NAME = /^[a-z][A-Za-z0-9]*$/;

// Brand overrides on disk: brands/<key>/accessories.json.
const overrideFiles: { brand: string; path: string }[] = readdirSync(brandsDir, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && existsSync(join(brandsDir, entry.name, 'accessories.json')))
  .map(entry => ({ brand: entry.name, path: join(brandsDir, entry.name, 'accessories.json') }));

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- the JSON documents are walked loosely on purpose
type Json = Record<string, any>;

function problems(document: Json): string[] {
  const found: string[] = [];
  if (typeof document.version !== 'string') {
    found.push('version must be a string');
  }
  for (const level of ['pageAccessories', 'zoneAccessories', 'linkAccessories'] as const) {
    for (const [key, definition] of Object.entries<Json>(document[level] ?? {})) {
      const where = `${level}.${key}`;
      if (definition.name !== key || !NAME.test(key)) {
        found.push(`${where}: name must equal its key and match ${NAME}`);
      }
      if (typeof definition.version !== 'string') {
        found.push(`${where}: version must be a string`);
      }
      const selectors: [string, boolean][] = [
        ['types', true],
        ['zones', level !== 'pageAccessories'],
        ['linkedTypes', level === 'linkAccessories'],
      ];
      for (const [selector, required] of selectors) {
        const value = definition[selector];
        if (required && (!Array.isArray(value) || value.length === 0 || value.some((item: unknown) => typeof item !== 'string'))) {
          found.push(`${where}: ${selector} must be a non-empty list of strings`);
        }
      }

      const names = [...(definition.toggles ?? []), ...(definition.properties ?? [])].map((item: Json) => item.name);
      if (new Set(names).size !== names.length || names.some((name: unknown) => typeof name !== 'string' || !NAME.test(name))) {
        found.push(`${where}: toggle and property names must be unique and match ${NAME}`);
      }
      for (const toggle of definition.toggles ?? []) {
        if (typeof toggle.default !== 'boolean') {
          found.push(`${where}.${toggle.name}: toggle default must be a boolean`);
        }
      }
      for (const property of definition.properties ?? []) {
        const propertyWhere = `${where}.${property.name}`;
        if (property.type === undefined) {
          const options = (property.options ?? []).map((option: Json) => option.name);
          if (options.length === 0 || !options.includes(property.default)) {
            found.push(`${propertyWhere}: enum default must name an option`);
          }
        } else {
          const max = property.type === 'string' ? 256 : property.type === 'text' ? 2000 : 0;
          if (property.options !== undefined || max === 0) {
            found.push(`${propertyWhere}: type must be "string" or "text" and must not have options`);
          } else if (!Number.isInteger(property.size) || property.size < 1 || property.size > max) {
            found.push(`${propertyWhere}: size must be an integer from 1 to ${max}`);
          } else if (typeof property.default !== 'string' || property.default.length > property.size) {
            found.push(`${propertyWhere}: default must be a string within its size`);
          }
        }
      }
    }
  }
  return found;
}

function expectValidDocument(path: string) {
  const document: Json = JSON.parse(readFileSync(path, 'utf8'));
  expect(document.version).toBe('1.0');
  expect(problems(document)).toEqual([]);
  for (const level of ['pageAccessories', 'zoneAccessories', 'linkAccessories']) {
    for (const definition of Object.values<Json>(document[level] ?? {})) {
      expect(definition.version).toBe('1.0');
    }
  }
}

describe('shared v2 accessories.json', () => {
  const path = join(v2Dir, 'accessories.json');

  test('no accessories.json is left in the legacy page folders', () => {
    const pagesDir = join(process.cwd(), 'src/app/_pages');
    const stray = [
      join(pagesDir, 'accessories.json'),
      ...readdirSync(pagesDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => join(pagesDir, entry.name, 'accessories.json')),
    ].filter(file => existsSync(file));
    expect(stray).toEqual([]);
  });

  test('the file itself declares theme "default" and version "1.0"', () => {
    expect(sharedFile.theme).toBe('default');
    expect(sharedFile.version).toBe('1.0');
  });

  test('follows the definition rules and every definition is version 1.0', () => {
    expectValidDocument(path);
  });

  test('the registered themes are the v2 themes', () => {
    expect(listAccessoryThemes()).toEqual(['default', 'theglobe', 'sportsarena', 'nextfrontier']);
    expect(V2_THEMES.every(theme => isV2Theme(theme))).toBe(true);
    expect(isV2Theme('adn')).toBe(false);
  });

  test.each(['default', 'theglobe', 'sportsarena', 'nextfrontier'].filter(theme => !(theme in BRAND_ACCESSORIES)))(
    '%s (no override) gets the shared document stamped with its theme',
    theme => {
      const doc = getAccessoryDefinitions(theme)!;
      expect(doc.theme).toBe(theme);
      expect({ ...doc, theme: 'default' }).toEqual(sharedFile);
      expect(Object.isFrozen(doc)).toBe(true);
    },
  );

  test.each(['adn', 'business-globe', 'business-globe2', 'constructor', '__proto__', 'hasOwnProperty'])(
    '%s has no definitions',
    theme => {
      expect(getAccessoryDefinitions(theme)).toBeUndefined();
    },
  );
});

describe('brand accessory overrides', () => {
  test('every override file on disk is registered, and every registered brand has a file', () => {
    expect(overrideFiles.map(file => file.brand).sort()).toEqual(Object.keys(BRAND_ACCESSORIES).sort());
  });

  test.each(overrideFiles.length ? overrideFiles : [{ brand: '(none)', path: '' }])('$brand override is a valid document', ({ path }) => {
    if (path) {
      expectValidDocument(path);
    }
  });

  test('a registered override replaces the shared document for that theme only', () => {
    const override = { ...sharedFile, theme: 'default', pageAccessories: {} };
    jest.isolateModules(() => {
      jest.doMock('@/app/_v2/brands/accessories', () => ({ BRAND_ACCESSORIES: { sportsarena: override } }));
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- isolated module registry
      const isolated = require('@/lib/accessories/definitions') as typeof import('@/lib/accessories/definitions');
      const arena = isolated.getAccessoryDefinitions('sportsarena')!;
      expect(arena.theme).toBe('sportsarena');
      expect(arena.pageAccessories).toEqual({});
      expect(Object.isFrozen(arena)).toBe(true);
      expect({ ...isolated.getAccessoryDefinitions('theglobe')!, theme: 'default' }).toEqual(sharedFile);
      expect(isolated.getAccessoryDefinitions('adn')).toBeUndefined();
    });
    jest.dontMock('@/app/_v2/brands/accessories');
  });
});
