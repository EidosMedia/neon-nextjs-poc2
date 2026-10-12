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

describe('resolveAccessoryValues string and text properties', () => {
  const typedDefinitions: AccessoryDefinitions = {
    version: '1.0',
    theme: 'default',
    zoneAccessories: {
      shape: {
        name: 'shape',
        version: '1.0',
        types: ['sectionwebpage'],
        zones: ['main'],
        properties: [
          { name: 'layout', default: 'a', options: [{ name: 'a' }, { name: 'b' }] },
          { name: 'zonetitle', type: 'string', default: '', size: 10 },
          { name: 'zonesummary', type: 'text', default: '', size: 10 },
        ],
      },
    },
  };
  const zoneContext: AccessoryContext = {
    theme: 'default',
    type: 'sectionwebpage',
    level: 'zone',
    zone: 'main',
  };
  const stored = (values: Record<string, unknown>): AccessorySet => ({
    theme: 'default',
    type: 'sectionwebpage',
    zone: 'main',
    items: { shape: { version: '1.0', values } },
  });

  test('resolves empty defaults and keeps enum values working next to typed ones', () => {
    expect(resolveAccessoryValues(typedDefinitions, undefined, zoneContext)).toEqual({
      shape: { layout: 'a', zonetitle: '', zonesummary: '' },
    });
  });

  test('accepts stored plain text and rich text within their limits', () => {
    expect(
      resolveAccessoryValues(typedDefinitions, stored({ zonetitle: 'Title', zonesummary: '<p>Sum</p>', layout: 'b' }), zoneContext),
    ).toEqual({ shape: { layout: 'b', zonetitle: 'Title', zonesummary: '<p>Sum</p>' } });
  });

  test('rejects plain strings with markup or beyond size, and text beyond twice its size', () => {
    expect(
      resolveAccessoryValues(typedDefinitions, stored({ zonetitle: '<b>x</b>', zonesummary: 'x'.repeat(21) }), zoneContext),
    ).toEqual({ shape: { layout: 'a', zonetitle: '', zonesummary: '' } });
    expect(resolveAccessoryValues(typedDefinitions, stored({ zonetitle: 'x'.repeat(11) }), zoneContext)?.shape.zonetitle).toBe('');
    expect(resolveAccessoryValues(typedDefinitions, stored({ zonesummary: 'x'.repeat(20) }), zoneContext)?.shape.zonesummary).toBe(
      'x'.repeat(20),
    );
  });

  test('rejects non-string values and values for undeclared properties', () => {
    expect(resolveAccessoryValues(typedDefinitions, stored({ zonetitle: 5, zonesummary: true, other: 'x' }), zoneContext)).toEqual({
      shape: { layout: 'a', zonetitle: '', zonesummary: '' },
    });
  });

  test('ignores a typed property without a valid size', () => {
    const noSize: AccessoryDefinitions = {
      version: '1.0',
      theme: 'default',
      zoneAccessories: {
        shape: {
          name: 'shape',
          version: '1.0',
          types: ['sectionwebpage'],
          zones: ['main'],
          properties: [{ name: 'zonetitle', type: 'string', default: '' }],
        },
      },
    };
    expect(resolveAccessoryValues(noSize, stored({ zonetitle: 'x' }), zoneContext)).toEqual({ shape: {} });
  });
});