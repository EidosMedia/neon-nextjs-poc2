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
  console.log('[NEON] render: financier/HomeWebPage');

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-neutral-bg, #f6f6f6)' }}>
      <Navbar data={data} />

      <div className="w-full max-w-[1300px] mx-auto px-4 py-4">

        {/* ── Hero zone: 2/3 + 1/3 ─────────────────────────────────────── */}
        <div className="financier-hero-grid">
          <div className="financier-hero-main">
            <Main data={data} />
          </div>
          <div className="financier-hero-stack financier-compact-articles">
            <Context data={data} />
          </div>
        </div>

        {/* ── Section divider ───────────────────────────────────────────── */}
        <div className="financier-section-header">More stories</div>

        {/* ── 4-col second row ──────────────────────────────────────────── */}
        <div className="financier-4col-grid">
          <div className="financier-compact-articles financier-square-images">
            <Insight1 data={data} imageFormat="Square_small" />
          </div>
          <Insight2 data={data} />
        </div>

      </div>

      <Footer data={data} />
    </div>
  );
};

export default HomeWebPage;
