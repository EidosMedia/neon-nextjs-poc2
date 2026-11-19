import { initials } from '@/app/_v2/chrome/initials';

describe('initials', () => {
  it('is total', () => {
    expect(initials(undefined)).toBe('');
    expect(initials('')).toBe('');
    expect(initials('Sports Arena')).toBe('SA');
    expect(initials('  web  ')).toBe('W');
  });
});
