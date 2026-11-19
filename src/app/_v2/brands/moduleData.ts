import { isSafeHref } from '@/lib/accessories/sanitizeZoneSummary';
import type { BaseModel, PageData, WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';

/**
 * Data access for brand modules. Modules read ONLY `block.model.data`:
 *  - `title`, `summary`
 *  - `attributes.<key>` (keys documented per module)
 *  - `links.pagelink.main` items, resolved with `connection.getDwxLinkedObjects(block, 'main')`
 * Anything missing yields undefined or [] so the part (or the whole module) is hidden.
 */
export type BrandModuleProps = { block: PageData<BaseModel> };

const str = (v: unknown): string | undefined => {
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined;
};

type Attrs = Record<string, unknown>;
const asAttrs = (v: unknown): Attrs => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Attrs) : {});

const data = (block: PageData<BaseModel>) =>
  ((block?.model as unknown as { data?: Record<string, unknown> } | undefined)?.data ?? {}) as Record<string, unknown>;

export const blockTitle = (block: PageData<BaseModel>) => str(data(block).title);
export const blockSummary = (block: PageData<BaseModel>) => str(data(block).summary);
export const blockAttrs = (block: PageData<BaseModel>): Attrs => asAttrs(data(block).attributes);
export const attr = (attrs: Attrs, key: string) => str(attrs[key]);

/** The only way module hrefs are built: root-relative paths and absolute https URLs; anything else is undefined. */
export function safeHref(raw: unknown): string | undefined {
  const v = str(raw);
  return v && isSafeHref(v) ? v : undefined;
}

export type ModuleItem = { id: string; title: string; href?: string; summary?: string; time?: string; attrs: Attrs };

/** Linked items of the block's `main` link zone; items without a title are dropped. */
export async function blockItems(block: PageData<BaseModel>, limit = 8): Promise<ModuleItem[]> {
  const nodes = await connection.getDwxLinkedObjects(block as PageData<WebpageModel>, 'main');
  const out: ModuleItem[] = [];
  for (const n of nodes) {
    const title = str(n?.title);
    if (!title) continue;
    const pub = (n as { pubInfo?: { publicationTime?: string } }).pubInfo?.publicationTime;
    out.push({ id: String(n.id ?? title), title, href: safeHref(n.url), summary: str(n.summary), time: str(pub), attrs: asAttrs(n.attributes) });
  }
  return out.slice(0, limit);
}

/** `a|b|c` string or string[] to a list. */
export function parseList(v: unknown): string[] {
  const raw = Array.isArray(v) ? v : typeof v === 'string' ? v.split('|') : [];
  return raw.map(str).filter((s): s is string => Boolean(s));
}

/** `Label: Value|Label: Value` string or `{label, value}[]` to label/value pairs. */
export function parsePairs(v: unknown): { label: string; value: string }[] {
  if (Array.isArray(v)) {
    return v
      .map((p) => ({ label: str(asAttrs(p).label), value: str(asAttrs(p).value) }))
      .filter((p): p is { label: string; value: string } => Boolean(p.label && p.value));
  }
  if (typeof v !== 'string') return [];
  return v
    .split('|')
    .map((s) => {
      const i = s.indexOf(':');
      return { label: i > 0 ? s.slice(0, i).trim() : '', value: i > 0 ? s.slice(i + 1).trim() : '' };
    })
    .filter((p) => p.label && p.value);
}

export type MatchData = { home: string; away: string; score?: string; status?: string; competition?: string };

/**
 * Match keys: `attributes.teams` ("Home|Away", required), `attributes.score` ("2-1"),
 * `attributes.status` ("FT", "Live 63'", "Sat 15:00"), `attributes.competition`.
 */
export function readMatch(attrs: Attrs): MatchData | undefined {
  const [home, away] = parseList(attrs.teams);
  if (!home || !away) return undefined;
  return { home, away, score: attr(attrs, 'score'), status: attr(attrs, 'status'), competition: attr(attrs, 'competition') };
}
