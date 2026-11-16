import type { PageData, WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import PageShell from '../chrome/PageShell';
import ZoneRenderer from '../zones/ZoneRenderer';

type PageProps = { data: PageData<WebpageModel> };

const WebPage: React.FC<PageProps> = async ({ data }) => (
  <PageShell
    data={data}
    rail={
      <div className="v2-web-rail">
        {(['context', 'insight1', 'insight2', 'insight3'] as const).map((zone) => (
          <ZoneRenderer key={zone} data={data} zone={zone} />
        ))}
      </div>
    }
  >
    <ZoneRenderer data={data} zone="main" />
  </PageShell>
);

export default WebPage;
