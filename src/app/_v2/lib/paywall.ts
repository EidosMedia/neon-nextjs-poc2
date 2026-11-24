export const PAYWALL_LEVELS = ['FREE', 'FREEMIUM', 'METERED', 'PREMIUM'] as const;
export type PaywallLevel = typeof PAYWALL_LEVELS[number];
export const DAILY_METERED_ALLOWANCE = 10;
export const PREVIEW_READER_TIERS = ['FREE', 'REGISTERED', 'PREMIUM'] as const;
export type PreviewReaderTier = typeof PREVIEW_READER_TIERS[number];

export function resolvePaywallLevel(value: unknown): PaywallLevel {
  if (value === undefined || value === null || value === '') return 'FREE';
  if (PAYWALL_LEVELS.some(level => level === value)) return value as PaywallLevel;
  console.warn('Unknown paywall level; treating as restricted content', value);
  return 'PREMIUM';
}

export type ReaderAccess = 'open' | 'login' | 'metered' | 'subscription' | 'upgrade';

export function readerAccess(level: PaywallLevel, registered: boolean, previewTier?: PreviewReaderTier): ReaderAccess {
  if (level === 'FREE') return 'open';
  if (previewTier) registered = previewTier !== 'FREE';
  if (!registered) return 'login';
  if (level === 'PREMIUM' && previewTier === 'REGISTERED') return 'upgrade';
  if (level === 'METERED' && previewTier === 'PREMIUM') return 'open';
  if (level === 'METERED') return 'metered';
  // DEMO ONLY: reader tiers are unavailable. Every signed-in reader is assumed to subscribe.
  return level === 'PREMIUM' ? 'subscription' : 'open';
}

export type MeteredDay = { day: string; paths: string[] };
export type MeteredVisit = { record: MeteredDay; allowed: boolean; remaining: number };

export const meteredStorageKey = (siteName: string, preview = false) =>
  `neon:v2:meter:${preview ? 'preview:' : 'live:'}${encodeURIComponent(siteName)}`;
export const utcDay = (now: Date) => now.toISOString().slice(0, 10);

export function meteredPath(url: string): string {
  const path = new URL(url, 'https://meter.invalid').pathname;
  return path.replace(/\/(?:index\.html)?$/, '') || '/';
}

export function readMeteredDay(raw: string | null, now: Date): MeteredDay {
  const empty = { day: utcDay(now), paths: [] };
  if (raw === null) return empty;
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object' || !('day' in value) || !('paths' in value)
    || typeof value.day !== 'string' || !Array.isArray(value.paths)
    || !value.paths.every((path: unknown) => typeof path === 'string' && path.startsWith('/'))
    || value.paths.length > DAILY_METERED_ALLOWANCE) {
    throw new Error('Invalid stored metered-article history');
  }
  if (value.day !== empty.day) return empty;
  return { day: value.day, paths: [...new Set(value.paths.map(meteredPath))] };
}

export function recordMeteredVisit(record: MeteredDay, url: string, now: Date): MeteredVisit {
  const current = record.day === utcDay(now) ? record : { day: utcDay(now), paths: [] };
  const path = meteredPath(url);
  const visited = current.paths.includes(path);
  const allowed = visited || current.paths.length < DAILY_METERED_ALLOWANCE;
  const paths = allowed && !visited ? [...current.paths, path] : current.paths;
  return {
    record: { day: current.day, paths },
    allowed,
    remaining: Math.max(0, DAILY_METERED_ALLOWANCE - paths.length),
  };
}
