import { absoluteUrl } from '@/app/_v2/lib/share';

describe('absoluteUrl', () => {
  it('prefixes relative paths with the origin', () => {
    expect(absoluteUrl('/world/a/', 'https://x.test')).toBe('https://x.test/world/a/');
  });
  it('keeps absolute urls', () => {
    expect(absoluteUrl('https://y.test/a', 'https://x.test')).toBe('https://y.test/a');
  });
});
