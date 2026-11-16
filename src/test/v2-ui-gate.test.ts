import { canShowStyleGuide } from '@/app/_v2/ui/gate';

describe('canShowStyleGuide', () => {
  it('hides the guide from readers in production', () => {
    expect(canShowStyleGuide(false, 'production')).toBe(false);
  });
  it('shows the guide to editors in production', () => {
    expect(canShowStyleGuide(true, 'production')).toBe(true);
  });
  it('shows the guide to anyone in development', () => {
    expect(canShowStyleGuide(false, 'development')).toBe(true);
  });
});
