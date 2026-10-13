import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { getAccessoryDefinitions, listAccessoryThemes } from '@/lib/accessories/definitions';

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

describe('theme accessories.json files', () => {
  test('the default theme has a file', () => {
    expect(themeFiles.map(file => file.theme)).toContain('default');
  });

  test.each(themeFiles)('$theme is registered, names its own theme and follows the definition rules', ({ theme, path }) => {
    const document: Json = JSON.parse(readFileSync(path, 'utf8'));

    expect(getAccessoryDefinitions(theme)).toBeDefined();
    expect(document.theme).toBe(theme);
    expect(problems(document)).toEqual([]);
  });

  test('every registered theme has a file next to its pages', () => {
    expect([...listAccessoryThemes()].sort()).toEqual(themeFiles.map(file => file.theme).sort());
  });

  test('registered documents are the files on disk', () => {
    for (const { theme, path } of themeFiles) {
      expect(getAccessoryDefinitions(theme)).toEqual(JSON.parse(readFileSync(path, 'utf8')));
    }
  });

  test('a theme without a file has no definitions, including inherited object keys', () => {
    for (const theme of ['adn', 'constructor', '__proto__', 'hasOwnProperty']) {
      expect(getAccessoryDefinitions(theme)).toBeUndefined();
    }
  });
});
