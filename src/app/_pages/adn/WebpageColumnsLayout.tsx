import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from './Navbar';
import React from 'react';
import MainWithHero from '../../components/webpage/MainWithHero';
import Context from '../../components/webpage/Context';
import Insight1 from '../../components/webpage/Insight1';
import Footer from './Footer';

type PageProps = {
  data: PageData<WebpageModel>;
};

const WebpageColumnsLayout: React.FC<PageProps> = async ({ data }) => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar data={data} />
      <div className="container mx-auto px-4 py-6 flex flex-col gap-6">
        <MainWithHero data={data} />
        <Context data={data} />
        <Insight1 data={data} displayMainPicture={false} />
      </div>
      <Footer data={data} />
    </div>
  );
};

export default WebpageColumnsLayout;
