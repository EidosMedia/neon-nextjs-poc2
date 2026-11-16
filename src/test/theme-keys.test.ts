import { resolveRenderTheme, THEME_KEYS } from '@/app/themeKeys';

describe('resolveRenderTheme', () => {
  it.each(THEME_KEYS)('keeps known theme %s', (key) => {
    expect(resolveRenderTheme(key)).toBe(key);
  });

  it('falls back to default for an unknown explicit theme', () => {
    expect(resolveRenderTheme('business-globe2')).toBe('default');
    expect(resolveRenderTheme('')).toBe('default');
  });
});
