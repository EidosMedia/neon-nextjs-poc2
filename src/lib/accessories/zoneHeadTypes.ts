// Client-safe types for the sanitized zone title/summary; rendered as React elements, never as raw HTML.
export type SummaryAlign = 'left' | 'center' | 'right' | 'justify';

export type SummaryInline =
  | { kind: 'text'; text: string }
  | { kind: 'br' }
  | { kind: 'mark'; mark: 'strong' | 'em' | 'u' | 's'; children: SummaryInline[] }
  | { kind: 'link'; href: string; children: SummaryInline[] };

export type SummaryParagraph = { align?: SummaryAlign; children: SummaryInline[] };

export type ZoneHeadContent = {
  title?: string;
  summary?: SummaryParagraph[];
};
