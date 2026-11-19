import { isLegacyTheme, isV2Theme, LEGACY_THEMES, resolveRenderTheme, THEME_KEYS, V2_THEMES } from '@/app/themeKeys';

describe('resolveRenderTheme', () => {
  it.each(THEME_KEYS)('keeps known theme %s', (key) => {
    expect(resolveRenderTheme(key)).toBe(key);
  });

  it('falls back to default for an unknown explicit theme', () => {
    expect(resolveRenderTheme('business-globe2')).toBe('default');
    expect(resolveRenderTheme('')).toBe('default');
  });
});

describe('engine selection', () => {
  it.each(V2_THEMES)('%s is a v2 theme', (key) => {
    expect(isV2Theme(key)).toBe(true);
    expect(isLegacyTheme(key)).toBe(false);
  });

  it.each(LEGACY_THEMES)('%s is a legacy theme', (key) => {
    expect(isLegacyTheme(key)).toBe(true);
    expect(isV2Theme(key)).toBe(false);
  });

  it('an unknown theme is neither (renders v2 through default, gets no accessory values)', () => {
    expect(isV2Theme('business-globe2')).toBe(false);
    expect(isLegacyTheme('business-globe2')).toBe(false);
    expect(isV2Theme(resolveRenderTheme('business-globe2'))).toBe(true);
  });
});
