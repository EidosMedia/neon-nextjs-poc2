import React from 'react';
import { PageData, WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from './Navbar';
import Footer from './Footer';
import Main from '../../components/webpage/Main';
import MainWithHero from '../../components/webpage/MainWithHero';
import Context from '../../components/webpage/Context';
import Insight1 from '../../components/webpage/Insight1';

type PageProps = {
  data: PageData<WebpageModel>;
};

const WebpageColumnsLayout: React.FC<PageProps> = async ({ data }) => {
  console.log('[NEON] render: foghorn/WebpageColumnsLayout');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f6f6f6' }}>
      <Navbar data={data} />
      <div className="w-full max-w-[1300px] mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="col-span-12">
            <MainWithHero data={data} />
          </div>
          <div className="col-span-12">
            <Context data={data} />
          </div>
          <div className="col-span-12">
            <Insight1 data={data} displayMainPicture={false} />
          </div>
        </div>
      </div>
      <Footer data={data} />
    </div>
  );
};

export default WebpageColumnsLayout;
