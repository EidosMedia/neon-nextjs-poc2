import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { WebpageModel, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from './Navbar';
import Footer from './Footer';
import Insight1 from '../../components/webpage/Insight1';
import Insight2 from '../../components/webpage/Insight2';
import WireArticleOrganism from './components/ArticleOrganism';

type PageProps = {
  data: PageData<WebpageModel>;
};

function WirePanel({ label, count, children }: { label: string; count?: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="wire-panel-header flex items-center justify-between">
        <span>{label}</span>
        {count && <span style={{ fontWeight: 400, color: '#6B6B6B' }}>{count}</span>}
      </div>
      <div className="bg-white border border-t-0 border-[#D4D4D4]">
        {children}
      </div>
    </div>
  );
}

const HomeWebPage: React.FC<PageProps> = async ({ data }) => {
  console.log('[NEON] render: wire/HomeWebPage');

  const [mainItems, contextItems] = await Promise.all([
    connection.getDwxLinkedObjects(data, 'main'),
    connection.getDwxLinkedObjects(data, 'context'),
  ]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F5' }}>
      <Navbar data={data} />

      <div className="w-full max-w-[1440px] mx-auto px-4 py-4">

        {/* Two-column layout: main feed (wide) + sidebar (narrow) */}
        <div className="flex gap-4">

          {/* ── Main feed column ────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            <WirePanel label="TOP STORIES" count="MAIN">
              {mainItems.map((item: WebpageNodeModel, i: number) => (
                <WireArticleOrganism
                  key={(item as any).id}
                  data={data}
                  linkedObject={item}
                  linkedObjects={mainItems}
                  index={i}
                  type={i === 0 ? 'article-xl' : 'article-md'}
                />
              ))}
            </WirePanel>

            <WirePanel label="LATEST" count="CONTEXT">
              {contextItems.map((item: WebpageNodeModel, i: number) => (
                <WireArticleOrganism
                  key={(item as any).id}
                  data={data}
                  linkedObject={item}
                  linkedObjects={contextItems}
                  index={i}
                  type="article-md"
                />
              ))}
            </WirePanel>
          </div>

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <div className="hidden lg:flex flex-col gap-4" style={{ width: 280, flexShrink: 0 }}>

            <div className="wire-meta-panel">
              <div className="wire-meta-panel-title">Feed Status</div>
              <div className="wire-meta-row">
                <span className="wire-meta-key">endpoint</span>
                <span className="wire-meta-val">/v2/feed</span>
              </div>
              <div className="wire-meta-row">
                <span className="wire-meta-key">format</span>
                <span className="wire-meta-val">JSON / NITF</span>
              </div>
              <div className="wire-meta-row">
                <span className="wire-meta-key">refresh</span>
                <span className="wire-meta-val">60 s</span>
              </div>
              <div className="wire-meta-row">
                <span className="wire-meta-key">status</span>
                <span className="wire-meta-val" style={{ color: '#008000' }}>200 OK</span>
              </div>
              <div className="wire-meta-row">
                <span className="wire-meta-key">latency</span>
                <span className="wire-meta-val">38 ms</span>
              </div>
            </div>

            <div>
              <div className="wire-panel-header">INSIGHTS · ZONE 1</div>
              <div className="bg-white border border-t-0 border-[#D4D4D4] p-2">
                <Insight1 data={data} />
              </div>
            </div>

            <div>
              <div className="wire-panel-header">INSIGHTS · ZONE 2</div>
              <div className="bg-white border border-t-0 border-[#D4D4D4] p-2">
                <Insight2 data={data} />
              </div>
            </div>

          </div>
        </div>

        {/* Mobile-only insight zones */}
        <div className="lg:hidden">
          <WirePanel label="INSIGHTS · ZONE 1">
            <Insight1 data={data} />
          </WirePanel>
          <WirePanel label="INSIGHTS · ZONE 2">
            <Insight2 data={data} />
          </WirePanel>
        </div>

      </div>

      <Footer data={data} />
    </div>
  );
};

export default HomeWebPage;
