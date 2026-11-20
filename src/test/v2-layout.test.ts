import {
  COMPOSITION_CAPACITY,
  groupByDate,
  planSlots,
  resolveAreaComposition,
  resolveComposition,
  type ConcreteComposition,
} from '@/app/_v2/lib/layout';

describe('resolveAreaComposition', () => {
  it('follows the host area when the block composition is auto', () => {
    expect(resolveAreaComposition('headers', 'auto', 'leadList')).toBe('grid2x2');
    expect(resolveAreaComposition('sidebars', 'auto', 'leadList')).toBe('threeUp');
  });
  it('keeps an explicit block composition over the area', () => {
    expect(resolveAreaComposition('headers', 'split', 'leadList')).toBe('split');
  });
  it('uses the zone fallback for areas without a composition', () => {
    expect(resolveAreaComposition('includes', 'auto', 'leadList')).toBe('leadList');
    expect(resolveAreaComposition(undefined, 'auto', 'threeUp')).toBe('threeUp');
  });
});

describe('resolveComposition', () => {
  it('returns a concrete composition unchanged', () => {
    expect(resolveComposition('grid2x2', 'main', 'homewebpage', {})).toBe('grid2x2');
  });

  it.each([
    ['homewebpage', 'main', 'leadList'],
    ['webpage', 'main', 'leadList'],
    ['homewebpage', 'context', 'threeUp'],
    ['homewebpage', 'insight1', 'split'],
    ['homewebpage', 'insight2', 'grid2x2'],
    ['homewebpage', 'insight3', 'overlayPair'],
    ['sectionwebpage', 'main', 'datedListing'],
    ['sectionwebpage', 'context', 'threeUp'],
    ['sectionwebpage', 'insight1', 'split'],
  ])('auto %s/%s -> %s', (base, zone, expected) => {
    expect(resolveComposition('auto', zone, base, {})).toBe(expected);
  });

  it('brand defaults override built-ins', () => {
    expect(resolveComposition('auto', 'main', 'homewebpage', { main: 'fourUp' })).toBe('fourUp');
  });

  it('section page main wins over brand defaults', () => {
    expect(resolveComposition('auto', 'main', 'sectionwebpage', { main: 'leadList' })).toBe('datedListing');
    expect(resolveComposition('auto', 'main', 'homewebpage', { main: 'leadList' })).toBe('leadList');
    expect(resolveComposition('grid2x2', 'main', 'sectionwebpage', { main: 'leadList' })).toBe('grid2x2');
  });

  it('falls back to threeUp for unknown zones', () => {
    expect(resolveComposition('auto', 'other', 'homewebpage', {})).toBe('threeUp');
  });
});

describe('planSlots', () => {
  it('leadList', () => {
    expect(planSlots('leadList', 5)).toEqual(['lead', 'compact', 'compact', 'compact', 'compact']);
  });
  it('overflow is compact', () => {
    expect(planSlots('leadList', 8)).toEqual(['lead', ...Array(7).fill('compact')]);
  });
  it('truncates to count', () => {
    expect(planSlots('leadList', 2)).toEqual(['lead', 'compact']);
  });
  it('threeUp and fourUp and datedListing are standard', () => {
    expect(planSlots('threeUp', 4)).toEqual(Array(4).fill('standard'));
    expect(planSlots('fourUp', 2)).toEqual(['standard', 'standard']);
    expect(planSlots('datedListing', 3)).toEqual(Array(3).fill('standard'));
  });
  it('split', () => {
    expect(planSlots('split', 5)).toEqual(['lead', 'compact', 'compact', 'compact', 'compact']);
  });
  it('grid2x2', () => {
    expect(planSlots('grid2x2', 4)).toEqual(Array(4).fill('compact'));
  });
  it('overlayPair and sponsored', () => {
    expect(planSlots('overlayPair', 3)).toEqual(['overlay', 'overlay', 'compact']);
    expect(planSlots('sponsored', 2)).toEqual(['overlay', 'overlay']);
  });
  it('banner takes one lead, highlight a lead then compacts, carousel stays standard', () => {
    expect(planSlots('banner', 1)).toEqual(['lead']);
    expect(planSlots('highlight', 4)).toEqual(['lead', 'compact', 'compact', 'compact']);
    expect(planSlots('carousel', 3)).toEqual(Array(3).fill('standard'));
  });
  it('count 0 gives []', () => {
    expect(planSlots('overlayPair', 0)).toEqual([]);
    expect(planSlots('threeUp', 0)).toEqual([]);
  });
});

describe('COMPOSITION_CAPACITY', () => {
  it('matches the table', () => {
    const c: Record<ConcreteComposition, number> = {
      leadList: 5,
      threeUp: Infinity,
      fourUp: Infinity,
      split: 4,
      grid2x2: 4,
      overlayPair: 2,
      datedListing: Infinity,
      sponsored: 2,
      banner: 1,
      highlight: 4,
      carousel: Infinity,
    };
    expect(COMPOSITION_CAPACITY).toEqual(c);
  });
});

describe('groupByDate', () => {
  const get = (t: { d?: string }) => t.d;
  it('groups same day in input order, undated last', () => {
    const items = [
      { id: 1, d: '2026-10-26T08:00:00Z' },
      { id: 2 },
      { id: 3, d: '2026-10-25T08:00:00Z' },
      { id: 4, d: '2026-10-26T20:00:00Z' },
    ];
    const g = groupByDate(items, get);
    expect(g.map((x) => x.key)).toEqual(['2026-10-26', '2026-10-25', 'undated']);
    expect(g[0].items.map((i) => i.id)).toEqual([1, 4]);
    expect(g[0].label).toBe('26 October 2026');
    expect(g[2]).toEqual({ key: 'undated', label: 'undated', items: [items[1]] });
  });
  it('respects timeZone', () => {
    const g = groupByDate([{ d: '2026-10-26T23:30:00Z' }], get, 'Europe/Rome');
    expect(g[0].key).toBe('2026-10-27');
    expect(g[0].label).toBe('27 October 2026');
  });
  it('treats invalid dates as undated and omits empty undated group', () => {
    expect(groupByDate([{ d: 'nope' }], get).map((x) => x.key)).toEqual(['undated']);
    expect(groupByDate([{ d: '2026-10-26T00:00:00Z' }], get).map((x) => x.key)).toEqual(['2026-10-26']);
  });
});
