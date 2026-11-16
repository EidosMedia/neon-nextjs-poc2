import type { BaseModel, PageData, WebpageModel, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { normalizeViewStatus } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { getActiveTheme } from '@/lib/accessories/defaultThemeAccessories';
import { getBrand } from '../brands/registry';
import { groupByDate, planSlots, resolveComposition, type ConcreteComposition } from '../lib/layout';
import { getItemSettings, getZoneSettings, V2_DEFAULTS, type ItemSettings } from '../lib/settings';
import { itemKind, limitToCapacity, nodePublicationDate } from '../lib/zoneItems';
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

type ZoneForm = { data: PageData<WebpageModel>; zone: string };
type ItemsForm = { data: PageData<BaseModel>; items: WebpageNodeModel[]; composition: ConcreteComposition; title?: string };
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

  nodes = limitToCapacity(nodes, composition);
  if (nodes.length === 0) return null;

  const slots = planSlots(composition, nodes.length);
  const cells: Cell[] = nodes.map((node, i) => {
    const settings = settingsFor(node);
    return {
      key: node.id,
      highlight: settings.kind === 'article' && settings.variant === 'highlight',
      el: (
        <div className="relative group">
          <ItemSwitch node={node} settings={settings} slot={slots[i]} viewStatus={viewStatus} />
        </div>
      ),
    };
  });

  let body: React.ReactNode;
  switch (composition) {
    case 'leadList': body = <LeadList cells={cells} />; break;
    case 'split': body = <Split cells={cells} />; break;
    case 'grid2x2': body = <Grid2x2 cells={cells} />; break;
    case 'overlayPair': body = <OverlayPair cells={cells} />; break;
    case 'threeUp': body = <Cards cells={cells} columns={3} />; break;
    case 'fourUp': body = <Cards cells={cells} columns={4} />; break;
    case 'sponsored': body = <Sponsored cells={cells} sponsorName={sponsorName} />; break;
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

  return (
    <section className={`v2-zone v2-zone--${titleProps?.style ?? 'bar'}`} data-composition={composition}>
      {titleProps && <ZoneTitle {...titleProps} />}
      <div className="v2-zone__body">{body}</div>
    </section>
  );
}
