import type { BaseModel, PageData, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import PageShell from '../chrome/PageShell';
import ZoneRenderer from '../zones/ZoneRenderer';

type PageProps = { data: PageData<BaseModel> };

function ChildrenPage(props: PageProps) {
  const { data } = props;
  const children = data.model.data.children ?? [];
  const items = children
    .map((id) => data.model.nodes[id] as unknown as WebpageNodeModel | undefined)
    .filter((n): n is WebpageNodeModel => Boolean(n));
  const rest = data.model.data.sys?.baseType === 'site' ? 'threeUp' : 'datedListing';
  return (
    <PageShell data={data}>
      <div className="v2-container">
        <ZoneRenderer data={data} items={items.slice(0, 5)} composition="leadList" />
        <ZoneRenderer data={data} items={items.slice(5)} composition={rest} />
      </div>
    </PageShell>
  );
}

export default ChildrenPage;
