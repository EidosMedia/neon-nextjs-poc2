import type { PageData, WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import PageShell from '../chrome/PageShell';
import ZoneRenderer from '../zones/ZoneRenderer';
import BlockSlot from '../blocks/BlockSlot';
import { extractBlockLinks } from '../lib/blocks';
import { planPageRail } from '../lib/leafView';

type PageProps = { data: PageData<WebpageModel> };

const RAIL_ZONES = ['context', 'insight1', 'insight2', 'insight3'] as const;

const WebPage: React.FC<PageProps> = async ({ data }) => {
  const zoneCounts = await Promise.all(
    RAIL_ZONES.map(async (zone) => (await connection.getDwxLinkedObjects(data, zone)).length),
  );
  const hasRail = planPageRail(zoneCounts, extractBlockLinks(data.model, 'sidebars').length);
  return (
    <PageShell
      data={data}
      rail={
        hasRail ? (
          <div className="v2-web-rail">
            {RAIL_ZONES.map((zone) => (
              <ZoneRenderer key={zone} data={data} zone={zone} />
            ))}
            <BlockSlot data={data} area="sidebars" />
          </div>
        ) : undefined
      }
    >
      <ZoneRenderer data={data} zone="main" />
    </PageShell>
  );
};

export default WebPage;
