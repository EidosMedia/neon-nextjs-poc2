import React from 'react';
import { PageData, WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from './Navbar';
import Footer from './Footer';
import Main from '../../components/webpage/Main';
import Context from '../../components/webpage/Context';
import Insight1 from '../../components/webpage/Insight1';
import Insight2 from '../../components/webpage/Insight2';

type PageProps = {
  data: PageData<WebpageModel>;
};

const HomeWebPage: React.FC<PageProps> = async ({ data }) => {
  console.log('[NEON] render: foghorn/HomeWebPage');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f6f6f6' }}>
      <Navbar data={data} />

      <div className="w-full max-w-[1300px] mx-auto px-4 py-4">

        {/* ── Hero zone: 2/3 + 1/3 ─────────────────────────────────────── */}
        <div className="foghorn-hero-grid">
          <div className="foghorn-hero-main">
            <Main data={data} />
          </div>
          <div className="foghorn-hero-stack">
            <Context data={data} />
          </div>
        </div>

        {/* ── Section divider ───────────────────────────────────────────── */}
        <div className="foghorn-section-header">More stories</div>

        {/* ── 4-col second row ──────────────────────────────────────────── */}
        <div className="foghorn-4col-grid">
          <Insight1 data={data} />
          <Insight2 data={data} />
        </div>

      </div>

      <Footer data={data} />
    </div>
  );
};

export default HomeWebPage;
