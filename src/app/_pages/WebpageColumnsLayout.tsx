import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from '../components/Navbar';
import ArticleWebpage from '../components/ArticleWebpage';
import ArticleBanner from '../components/ArticleBanner';
import React from 'react';
import Main from '../components/webpage/Main';
import Context from '../components/webpage/Context';
import Insight1 from '../components/webpage/Insight1';
import Footer from '../components/Footer';
type PageProps = {
  data: PageData<WebpageModel>;
};

const WebpageColumnsLayout: React.FC<PageProps> = async ({ data }) => {
  return (
    <div className="container mx-auto p-4">
      <Navbar data={data}></Navbar>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="p-4 rounded-lg col-span-12 md:col-span-3">
          <Main data={data} />
        </div>

        <div className="p-4 rounded-lg col-span-12 md:col-span-6">
          <Context data={data} />
        </div>

        <div className="p-4 rounded-lg col-span-12 md:col-span-3">
          <Insight1 data={data} displayMainPicture={false} />
        </div>
      </div>

      <footer className="p-4 rounded-b-lg mt-4">
        <Footer data={data} />
      </footer>
    </div>
  );
};

export default WebpageColumnsLayout;
