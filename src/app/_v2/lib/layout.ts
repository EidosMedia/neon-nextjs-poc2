import type { ArticleItemVariant, Composition } from './settings';

export type ConcreteComposition = Exclude<Composition, 'auto'>;
export type SlotShape = ArticleItemVariant;

const ZONE_DEFAULTS: Record<string, ConcreteComposition> = {
  main: 'leadList',
  context: 'threeUp',
  insight1: 'split',
  insight2: 'grid2x2',
  insight3: 'overlayPair',
};

export function resolveComposition(
  c: Composition,
  zone: string,
  pageBaseType: string,
  brandDefaults: Partial<Record<string, ConcreteComposition>>,
): ConcreteComposition {
  if (c !== 'auto') return c;
  const brand = brandDefaults[zone];
  if (brand) return brand;
  if (zone === 'main' && pageBaseType === 'sectionwebpage') return 'datedListing';
  return ZONE_DEFAULTS[zone] ?? 'threeUp';
}

const FIXED_SLOTS: Record<ConcreteComposition, SlotShape[] | null> = {
  leadList: ['lead', 'compact', 'compact', 'compact', 'compact'],
  threeUp: null,
  fourUp: null,
  split: ['lead', 'compact', 'compact', 'compact'],
  grid2x2: ['compact', 'compact', 'compact', 'compact'],
  overlayPair: ['overlay', 'overlay'],
  datedListing: null,
  sponsored: ['overlay', 'overlay'],
};

export const COMPOSITION_CAPACITY: Record<ConcreteComposition, number> = {
  leadList: 5,
  threeUp: Number.POSITIVE_INFINITY,
  fourUp: Number.POSITIVE_INFINITY,
  split: 4,
  grid2x2: 4,
  overlayPair: 2,
  datedListing: Number.POSITIVE_INFINITY,
  sponsored: 2,
};

export function planSlots(c: ConcreteComposition, count: number): SlotShape[] {
  const n = Math.max(0, Math.floor(count));
  const fixed = FIXED_SLOTS[c];
  return Array.from({ length: n }, (_, i): SlotShape => (fixed ? (fixed[i] ?? 'compact') : 'standard'));
}

function dayKey(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const p = (t: string) => parts.find((x) => x.type === t)?.value ?? '';
  return `${p('year')}-${p('month')}-${p('day')}`;
}

export function groupByDate<T>(
  items: T[],
  getDate: (t: T) => string | undefined,
  timeZone = 'UTC',
): { key: string; label: string; items: T[] }[] {
  const groups = new Map<string, { key: string; label: string; items: T[] }>();
  const undated: T[] = [];
  const label = new Intl.DateTimeFormat('en-GB', { timeZone, day: 'numeric', month: 'long', year: 'numeric' });
  for (const item of items) {
    const raw = getDate(item);
    const date = raw ? new Date(raw) : undefined;
    if (!date || Number.isNaN(date.getTime())) {
      undated.push(item);
      continue;
    }
    const key = dayKey(date, timeZone);
    const group = groups.get(key) ?? { key, label: label.format(date), items: [] };
    group.items.push(item);
    groups.set(key, group);
  }
  const result = [...groups.values()];
  if (undated.length) result.push({ key: 'undated', label: 'undated', items: undated });
  return result;
}
