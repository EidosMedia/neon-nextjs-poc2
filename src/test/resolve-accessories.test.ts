import {
  resolveAccessoryValues,
  type AccessoryContext,
  type AccessoryDefinitions,
} from '@/lib/accessories/resolveAccessories';
import type { AccessorySet } from '@eidosmedia/neon-frontoffice-ts-sdk';

const definitions: AccessoryDefinitions = {
  version: '1.0',
  theme: 'default',
  pageAccessories: {
    shape: {
      name: 'shape',
      version: '1.0',
      types: ['article'],
      toggles: [{ name: 'bold', default: false }],
      properties: [{
        name: 'layout',
        default: 'imageabove',
        options: [{ name: 'imageabove' }, { name: 'imagebk' }],
      }],
    },
  },
  zoneAccessories: {
    shape: {
      name: 'shape',
      version: '1.0',
      types: ['article'],
      zones: ['main'],
      toggles: [{ name: 'bold', default: false }],
    },
  },
  linkAccessories: {
    shape: {
      name: 'shape',
      version: '1.0',
      types: ['article'],
      zones: ['main'],
      linkedTypes: ['story'],
      toggles: [{ name: 'bold', default: false }],
    },
  },
};

const pageContext: AccessoryContext = {
  theme: 'default',
  type: 'article/longform',
  baseType: 'article',
  level: 'page',
};

describe('resolveAccessoryValues', () => {
  test('uses matching defaults and valid stored overrides', () => {
    const stored: AccessorySet = {
      theme: 'default',
      type: 'article/longform',
      items: {
        shape: { version: '1.0', values: { bold: true, layout: 'imagebk', unknown: true } },
      },
    };

    expect(resolveAccessoryValues(definitions, stored, pageContext)).toEqual({
      shape: { bold: true, layout: 'imagebk' },
    });
  });

  test.each([
    ['theme', { ...pageContext, theme: 'other' }, { ...pageContext, theme: 'other' }],
    ['type', pageContext, { ...pageContext, type: 'gallery' }],
    ['zone', { ...pageContext, level: 'zone', zone: 'main' }, { ...pageContext, level: 'zone', zone: 'other' }],
    ['linked type', { ...pageContext, level: 'link', zone: 'main', linkedType: 'story/feature', linkedBaseType: 'story' },
      { ...pageContext, level: 'link', zone: 'main', linkedType: 'gallery' }],
  ] as const)('ignores all stored overrides when %s context is stale', (_name, context, storedContext) => {
    const stored: AccessorySet = {
      theme: storedContext.theme,
      type: storedContext.type,
      zone: 'zone' in storedContext ? storedContext.zone : undefined,
      linkedType: 'linkedType' in storedContext ? storedContext.linkedType : undefined,
      items: { shape: { version: '1.0', values: { bold: true } } },
    };

    const resolved = resolveAccessoryValues(definitions, stored, context);
    if (context.theme !== 'default') {
      expect(resolved).toBeUndefined();
    } else {
      expect(resolved?.shape.bold).toBe(false);
    }
  });

  test('uses defaults for incompatible versions and invalid property values', () => {
    const stored: AccessorySet = {
      theme: 'default',
      type: 'article/longform',
      items: {
        shape: { version: '2.0', values: { bold: true, layout: 'not-an-option' } },
      },
    };

    expect(resolveAccessoryValues(definitions, stored, pageContext)).toEqual({
      shape: { bold: false, layout: 'imageabove' },
    });
  });

  test('does not apply default definitions to an unknown active theme', () => {
    expect(resolveAccessoryValues(definitions, undefined, { ...pageContext, theme: 'other' })).toBeUndefined();
  });
});