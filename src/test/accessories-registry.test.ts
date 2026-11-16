import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { getAccessoryDefinitions, listAccessoryThemes, isV2Theme, V2_THEMES } from '@/lib/accessories/definitions';
import sharedFile from '@/app/_pages/accessories.json';

const pagesDir = join(process.cwd(), 'src/app/_pages');
const NAME = /^[a-z][A-Za-z0-9]*$/;

// The default theme lives at the root of _pages; every other theme in its own folder.
const themeFiles: { theme: string; path: string }[] = [
  ...(existsSync(join(pagesDir, 'accessories.json')) ? [{ theme: 'default', path: join(pagesDir, 'accessories.json') }] : []),
  ...readdirSync(pagesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && existsSync(join(pagesDir, entry.name, 'accessories.json')))
    .map(entry => ({ theme: entry.name, path: join(pagesDir, entry.name, 'accessories.json') })),
];

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

describe('shared v2 accessories.json', () => {
  const path = join(pagesDir, 'accessories.json');

  test('the only accessories file on disk is the shared one', () => {
    expect(themeFiles.map(file => file.path)).toEqual([path]);
  });

  test('the file itself declares theme "default" and version "2.0"', () => {
    expect(sharedFile.theme).toBe('default');
    expect(sharedFile.version).toBe('2.0');
  });

  test('follows the definition rules', () => {
    expect(problems(JSON.parse(readFileSync(path, 'utf8')))).toEqual([]);
  });

  test('every definition is version 2.0', () => {
    const document: Json = JSON.parse(readFileSync(path, 'utf8'));
    for (const level of ['pageAccessories', 'zoneAccessories', 'linkAccessories']) {
      for (const definition of Object.values<Json>(document[level])) {
        expect(definition.version).toBe('2.0');
      }
    }
  });

  test('the registered themes are the v2 themes', () => {
    expect(listAccessoryThemes()).toEqual(['default', 'theglobe', 'sportsarena', 'nextfrontier']);
    expect(V2_THEMES.every(theme => isV2Theme(theme))).toBe(true);
    expect(isV2Theme('adn')).toBe(false);
  });

  test.each(['default', 'theglobe', 'sportsarena', 'nextfrontier'])('%s gets the shared document stamped with its theme', theme => {
    const doc = getAccessoryDefinitions(theme)!;
    expect(doc.theme).toBe(theme);
    expect({ ...doc, theme: 'default' }).toEqual(sharedFile);
    expect(Object.isFrozen(doc)).toBe(true);
  });

  test.each(['adn', 'business-globe', 'business-globe2', 'constructor', '__proto__', 'hasOwnProperty'])(
    '%s has no definitions',
    theme => {
      expect(getAccessoryDefinitions(theme)).toBeUndefined();
    },
  );
});
