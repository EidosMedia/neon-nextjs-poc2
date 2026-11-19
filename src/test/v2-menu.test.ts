import {
  MAX_MENU_DEPTH,
  activeAncestorKeys,
  countLinks,
  fitCount,
  filterLinks,
  isActiveHref,
  menuHref,
  menuItemsToLinks,
  siteNodesToLinks,
  toggleAccordion,
  megaGroups,
  containsActive,
  type MenuLink,
} from '@/app/_v2/lib/menu';

describe('menuHref', () => {
  it.each(['/news', '/news/index.html', 'https://example.com/x', 'http://example.com'])('keeps %s', href => {
    expect(menuHref(href)).toBe(href);
  });
  it.each(['', '  ', 'javascript:alert(1)', '//evil.com', 'data:text/html,x', 'abc123', 42, undefined])(
    'drops %p',
    href => {
      expect(menuHref(href)).toBeUndefined();
    }
  );
});

describe('menuItemsToLinks', () => {
  it('keeps every level, and turns items without a link but with children into groups', () => {
    const links = menuItemsToLinks([
      {
        label: 'Sport',
        type: 'GROUP',
        items: [
          { label: 'Football', url: '/sport/football', items: [{ label: 'Serie A', url: '/sport/football/a' }] },
          { label: 'Tennis', url: '/sport/tennis' },
        ],
      },
      { label: 'News', url: '/news' },
    ]);
    expect(links).toEqual([
      {
        label: 'Sport',
        items: [
          { label: 'Football', href: '/sport/football', items: [{ label: 'Serie A', href: '/sport/football/a' }] },
          { label: 'Tennis', href: '/sport/tennis' },
        ],
      },
      { label: 'News', href: '/news' },
    ]);
  });

  it('falls back to ref, and drops unlabeled, empty and unsafe items', () => {
    expect(
      menuItemsToLinks([
        { label: 'Ref', ref: '/ref' },
        { label: '', url: '/nolabel' },
        { label: 'Empty' },
        { label: 'Bad', url: 'javascript:alert(1)' },
        null,
        'x',
      ])
    ).toEqual([{ label: 'Ref', href: '/ref' }]);
  });

  it('returns [] for a missing menu', () => {
    expect(menuItemsToLinks(undefined)).toEqual([]);
  });

  it(`stops at ${MAX_MENU_DEPTH} levels`, () => {
    let node: Record<string, unknown> = { label: 'leaf', url: '/leaf' };
    for (let i = 0; i < MAX_MENU_DEPTH + 5; i++) node = { label: `l${i}`, url: `/l${i}`, items: [node] };
    let depth = 0;
    let level = menuItemsToLinks([node]);
    while (level.length) {
      depth++;
      level = level[0].items ?? [];
    }
    expect(depth).toBe(MAX_MENU_DEPTH);
  });
});

describe('siteNodesToLinks', () => {
  it('uses title (or name) and path, at every level', () => {
    expect(
      siteNodesToLinks([
        { title: 'Cronaca', path: '/cronaca', items: [{ name: 'roma', path: '/cronaca/roma', items: [] }] },
      ])
    ).toEqual([{ label: 'Cronaca', href: '/cronaca', items: [{ label: 'roma', href: '/cronaca/roma' }] }]);
  });
});

describe('large trees', () => {
  const big = siteNodesToLinks(
    Array.from({ length: 40 }, (_, i) => ({
      title: `Section ${i}`,
      path: `/s${i}`,
      items: Array.from({ length: 25 }, (_, j) => ({
        title: `Sub ${i}.${j}`,
        path: `/s${i}/sub${j}`,
        items: [{ title: `Città ${i}.${j}`, path: `/s${i}/sub${j}/city` }],
      })),
    }))
  );

  it('counts every node', () => {
    expect(countLinks(big)).toBe(40 + 40 * 25 * 2);
  });

  it('filters keeping ancestors, case- and accent-insensitive', () => {
    const out = filterLinks(big, 'CITTA 7.3');
    expect(out).toHaveLength(1);
    expect(out[0].label).toBe('Section 7');
    expect(out[0].items).toEqual([
      { label: 'Sub 7.3', href: '/s7/sub3', items: [{ label: 'Città 7.3', href: '/s7/sub3/city' }] },
    ]);
  });

  it('keeps the whole subtree of a matching node', () => {
    expect(filterLinks(big, 'section 12')[0].items).toHaveLength(25);
  });

  it('returns the tree unchanged for a blank query', () => {
    expect(filterLinks(big, '  ')).toBe(big);
  });

  it('finds the ancestors of the current page', () => {
    expect(activeAncestorKeys(big, '/s7/sub3/city/')).toEqual(['7', '7.3']);
    expect(activeAncestorKeys(big, '/s7/index.html')).toEqual([]);
    expect(activeAncestorKeys(big, '/nowhere')).toEqual([]);
  });
});

describe('isActiveHref', () => {
  it('ignores trailing slash and index.html but never marks the home link', () => {
    expect(isActiveHref('/news/', '/news/index.html')).toBe(true);
    expect(isActiveHref('/', '/')).toBe(false);
    expect(isActiveHref(undefined, '/news')).toBe(false);
  });
});

describe('fitCount', () => {
  const widths = [100, 100, 100, 100, 100];
  it('shows everything when it all fits (no More)', () => {
    expect(fitCount(widths, 540, 80, 10)).toBe(5);
    expect(fitCount([], 0, 80, 10)).toBe(0);
  });
  it('keeps room for More when it does not fit', () => {
    // 3 items = 320, + gap 10 + More 80 = 410 <= 420; a 4th would need 520
    expect(fitCount(widths, 420, 80, 10)).toBe(3);
    expect(fitCount(widths, 409, 80, 10)).toBe(2);
  });
  it('returns 0 when only More fits, never negative', () => {
    expect(fitCount(widths, 90, 80, 10)).toBe(0);
    expect(fitCount(widths, 0, 80, 10)).toBe(0);
  });
});

describe('toggleAccordion', () => {
  it('opens one branch per level and closes the siblings with their subtrees', () => {
    let s = toggleAccordion(new Set(), '0');
    s = toggleAccordion(s, '0.1');
    expect([...s].sort()).toEqual(['0', '0.1']);
    s = toggleAccordion(s, '2');
    expect([...s]).toEqual(['2']);
  });
  it('keeps ancestors when opening a nested sibling', () => {
    let s = new Set(['1', '1.0', '1.0.3']);
    s = toggleAccordion(s, '1.2');
    expect([...s].sort()).toEqual(['1', '1.2']);
  });
  it('closing a branch closes its descendants only', () => {
    const s = toggleAccordion(new Set(['1', '1.0', '1.0.3', '10']), '1.0');
    expect([...s].sort()).toEqual(['1', '10']);
  });
  it('does not treat key "10" as under "1"', () => {
    const s = toggleAccordion(new Set(['10', '10.2']), '1');
    expect([...s]).toEqual(['1']);
  });
});

describe('megaGroups', () => {
  const tree: MenuLink[] = [
    { label: 'News', href: '/news', items: [{ label: 'World', href: '/news/world' }, { label: 'Europe', href: '/news/europe', items: [{ label: 'Italy', href: '/news/europe/italy' }] }] },
    { label: 'Podcast', href: '/podcast' },
    { label: 'Group', items: Array.from({ length: 11 }, (_, i) => ({ label: `L${i}`, href: `/g/${i}` })) },
    { label: 'Orphan label' },
  ];
  it('keeps menu order, caps children and marks the active branch', () => {
    const groups = megaGroups(tree, 8, '/news/europe/italy/');
    expect(groups.map(g => g.link.label)).toEqual(['News', 'Podcast', 'Group']);
    expect(groups[0].active).toBe(true);
    expect(groups[2].active).toBe(false);
    expect(groups[1].shown).toEqual([]);
    expect(groups[2].shown).toHaveLength(8);
    expect(groups[2].hidden).toBe(3);
    expect(groups[0].hidden).toBe(0);
  });
  it('marks a leaf section active and drops label-only leaves', () => {
    const groups = megaGroups(tree, 8, '/podcast/');
    expect(groups.find(g => g.link.label === 'Podcast')?.active).toBe(true);
    expect(groups.some(g => g.link.label === 'Orphan label')).toBe(false);
  });
  it('treats a negative cap as zero', () => {
    expect(megaGroups(tree, -2, null)[0].shown).toEqual([]);
  });
});

describe('containsActive', () => {
  it('finds deep matches', () => {
    expect(containsActive({ label: 'a', items: [{ label: 'b', items: [{ label: 'c', href: '/x/' }] }] }, '/x')).toBe(true);
    expect(containsActive({ label: 'a', href: '/y' }, '/x')).toBe(false);
  });
});
