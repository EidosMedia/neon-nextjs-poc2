import type { WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { getAccessoryTheme, getActiveTheme, type PageDataLike } from '@/lib/accessories/defaultThemeAccessories';
import { getAccessoryDefinitions } from '@/lib/accessories/definitions';
import { resolveAccessoryValues, type AccessoryContext } from '@/lib/accessories/resolveAccessories';
import { isSafeHref } from '@/lib/accessories/sanitizeZoneSummary';
import { getZoneSettings } from './settings';

type Values = Record<string, boolean | string> | undefined;
type HeaderVariant = 'standard' | 'compact';
type FooterVariant = 'standard' | 'minimal';
type Layout = 'stream' | 'cards' | 'list' | 'numbered';
type ContextStyle = 'plain' | 'box';

function resolve(data: PageDataLike, level: 'page' | 'zone', zone?: string): Values {
  const sys = data.model?.data?.sys;
  const theme = getAccessoryTheme(data);
  const definitions = getAccessoryDefinitions(theme);
  if (!definitions) return undefined;
  const context: AccessoryContext = { theme, type: sys?.type ?? '', baseType: sys?.baseType, level, zone };
  const stored = level === 'page'
    ? data.model?.data?.pubInfo?.attributes?.pageAccessories
    : (data.model?.data as WebpageModel | undefined)?.zoneAccessories?.[zone ?? ''];
  return resolveAccessoryValues(definitions, stored, context)?.[level === 'page' ? 'newsletter' : 'newsletterZone'];
}

function pick<T extends string>(value: boolean | string | undefined, options: readonly T[], fallback: T): T {
  return typeof value === 'string' && options.some(option => option === value) ? value as T : fallback;
}

function string(value: boolean | string | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

function url(value: boolean | string | undefined): string {
  const href = string(value);
  return isSafeHref(href) ? href : '';
}

export function getNewsletterPageSettings(data: PageDataLike) {
  const values = resolve(data, 'page');
  const arena = getActiveTheme(data) === 'sportsarena';
  return {
    header: pick<HeaderVariant>(values?.headerVariant, ['standard', 'compact'], arena ? 'compact' : 'standard'),
    footer: pick<FooterVariant>(values?.footerVariant, ['standard', 'minimal'], arena ? 'minimal' : 'standard'),
    showTitleSummary: pick(values?.titleVariant, ['summary', 'title'] as const, arena ? 'title' : 'summary') === 'summary',
    showForward: values?.showForward === true,
    preheader: string(values?.preheader),
    edition: string(values?.edition),
    browserUrl: url(values?.browserUrl),
    unsubscribeUrl: url(values?.unsubscribeUrl),
    preferencesUrl: url(values?.preferencesUrl),
    facebookUrl: url(values?.facebookUrl),
    instagramUrl: url(values?.instagramUrl),
    youtubeUrl: url(values?.youtubeUrl),
    telegramUrl: url(values?.telegramUrl),
    legal: string(values?.legal),
    forwardText: string(values?.forwardText),
  };
}

export function getNewsletterZoneSettings(data: PageDataLike, zone: 'main' | 'context' | 'insight1') {
  const values = resolve(data, 'zone', zone);
  const theme = getActiveTheme(data);
  const defaultLayout: Layout = zone === 'context'
    ? theme === 'sportsarena' || theme === 'nextfrontier' ? 'list' : 'numbered'
    : zone === 'main' && theme === 'sportsarena' ? 'cards' : 'stream';
  const defaultContext: ContextStyle = theme === 'sportsarena' || theme === 'nextfrontier' ? 'box' : 'plain';
  return {
    heading: pick(values?.heading, ['summary', 'title', 'hidden'] as const, 'summary'),
    layout: pick<Layout>(values?.layout, ['stream', 'cards', 'list', 'numbered'], defaultLayout),
    contextStyle: pick<ContextStyle>(values?.contextStyle, ['plain', 'box'], defaultContext),
    image: values?.image !== false,
    summary: values?.summary !== false,
    label: values?.label !== false,
    zone: getZoneSettings(data, zone),
  };
}
