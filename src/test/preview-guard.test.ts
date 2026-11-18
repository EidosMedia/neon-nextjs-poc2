import { leavesPage } from '@/utilities/previewGuard';

describe('leavesPage (embedded preview guard)', () => {
  it('blocks links to other pages and sites', () => {
    expect(leavesPage('/cronaca/')).toBe(true);
    expect(leavesPage('https://example.com/x')).toBe(true);
    expect(leavesPage('?id=1')).toBe(true);
    expect(leavesPage('mailto:a@b.c')).toBe(true);
  });

  it('allows in-page anchors and links that do not navigate', () => {
    expect(leavesPage('#top')).toBe(false);
    expect(leavesPage('')).toBe(false);
    expect(leavesPage(null)).toBe(false);
    expect(leavesPage('javascript:void(0)')).toBe(false);
  });
});
