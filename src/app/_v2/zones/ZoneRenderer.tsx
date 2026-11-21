import type { BaseModel, PageData, WebpageModel, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { normalizeViewStatus } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { getActiveTheme } from '@/lib/accessories/defaultThemeAccessories';
import { getBrand } from '../brands/registry';
import { COMPOSITION_CAPACITY, groupByDate, planSlots, resolveComposition, type ConcreteComposition } from '../lib/layout';
import { getItemSettings, getZoneSettings, V2_DEFAULTS, type ItemSettings } from '../lib/settings';
import { itemKind, nodePublicationDate } from '../lib/zoneItems';
import ItemSwitch from './ItemSwitch';
import ZoneTitle from './ZoneTitle';
import Cards from './compositions/Cards';
import DatedListing from './compositions/DatedListing';
import Grid2x2 from './compositions/Grid2x2';
import LeadList from './compositions/LeadList';
import OverlayPair from './compositions/OverlayPair';
import Split from './compositions/Split';
import Sponsored from './compositions/Sponsored';
import type { Cell } from './compositions/types';
import { ContentEditingProvider } from '@/app/components/utilities/ContentEditingContext';

type ZoneForm = { data: PageData<WebpageModel>; zone: string; container?: boolean };
type ItemsForm = { data: PageData<BaseModel>; items: WebpageNodeModel[]; composition: ConcreteComposition; title?: string; container?: boolean };
export type ZoneRendererProps = ZoneForm | ItemsForm;

const DEFAULT_ITEM_SETTINGS: Record<ItemSettings['kind'], ItemSettings> = {
  article: V2_DEFAULTS.articleItem,
  liveblog: V2_DEFAULTS.liveblogItem,
  gallery: V2_DEFAULTS.galleryItem,
};

export default async function ZoneRenderer(props: ZoneRendererProps) {
  const { data } = props;
  const viewStatus = normalizeViewStatus(data.siteData?.viewStatus);

  let nodes: WebpageNodeModel[];
  let composition: ConcreteComposition;
  let titleProps: { head?: Parameters<typeof ZoneTitle>[0]['head']; style: 'bar' | 'column'; moreLink?: string } | undefined;
  let sponsorName: string | undefined;
  let settingsFor: (node: WebpageNodeModel) => ItemSettings;

  if ('items' in props) {
    nodes = props.items;
    composition = props.composition;
    if (props.title) titleProps = { head: { title: props.title }, style: 'bar' };
    settingsFor = (node) => DEFAULT_ITEM_SETTINGS[itemKind(node)];
  } else {
    const zoneData = props.data;
    nodes = await connection.getDwxLinkedObjects(zoneData, props.zone);
    const zs = getZoneSettings(zoneData, props.zone);
    const baseType = zoneData.model?.data?.sys?.baseType ?? '';
    composition = resolveComposition(zs.composition, props.zone, baseType, getBrand(getActiveTheme(zoneData)).compositionDefaults);
    if (zs.showTitle) titleProps = { head: zs.head, style: zs.titleStyle, moreLink: zs.moreLink };
    sponsorName = zs.sponsorName;
    settingsFor = (node) => getItemSettings(zoneData, props.zone, node);
  }

  if (nodes.length === 0) return null;

  const slots = planSlots(composition, nodes.length);
  const titled = Boolean(titleProps?.head?.title);
  const cells: Cell[] = nodes.map((node, i) => {
    const settings = settingsFor(node);
    return {
      key: node.id,
      highlight: settings.kind === 'article' && settings.variant === 'highlight',
      el: (
        <div className="relative group">
          <ItemSwitch node={node} settings={settings} slot={slots[i]} viewStatus={viewStatus} titled={titled} />
        </div>
      ),
    };
  });

  const capacity = COMPOSITION_CAPACITY[composition];
  const drawn = Number.isFinite(capacity) ? cells.slice(0, capacity) : cells;
  const overflow = Number.isFinite(capacity) ? cells.slice(capacity) : [];

  let body: React.ReactNode;
  switch (composition) {
    case 'leadList': body = <LeadList cells={drawn} />; break;
    case 'split': body = <Split cells={drawn} />; break;
    case 'grid2x2': body = <Grid2x2 cells={drawn} />; break;
    case 'overlayPair': body = <OverlayPair cells={drawn} />; break;
    case 'threeUp': body = <Cards cells={cells} columns={3} />; break;
    case 'fourUp': body = <Cards cells={cells} columns={4} />; break;
    case 'sponsored': body = <Sponsored cells={drawn} sponsorName={sponsorName} />; break;
    case 'datedListing': {
      const byKey = new Map(cells.map((c, i) => [nodes[i], c] as const));
      const groups = groupByDate(nodes, nodePublicationDate).map((g) => ({
        key: g.key,
        label: g.label,
        cells: g.items.map((n) => byKey.get(n) as Cell),
      }));
      body = <DatedListing groups={groups} />;
      break;
    }
  }

  const section = (
    <section className={`v2-zone v2-zone--${titleProps?.style ?? 'bar'}`} data-composition={composition}>
      {titleProps && <ZoneTitle {...titleProps} />}
      <div className="v2-zone__body">
        {body}
        {overflow.length > 0 && (
          <div className="v2-zone__overflow">
            {overflow.map((c) => (
              <div key={c.key} className="v2-comp__cell">{c.el}</div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
  return (
    <ContentEditingProvider objectId={data.model.data.id} viewStatus={viewStatus} lockedBy={data.model?.data?.sys?.lockedBy}>
      {props.container ? <div className="v2-container">{section}</div> : section}
    </ContentEditingProvider>
  );
}
