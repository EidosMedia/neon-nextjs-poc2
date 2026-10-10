import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from '../components/Navbar';
import ArticleWebpage from '../components/ArticleWebpage';
import ArticleBanner from '../components/ArticleBanner';
import React from 'react';
import Main from '../components/webpage/Main';
import MainWithHero from '../components/webpage/MainWithHero';
import Context from '../components/webpage/Context';
import Insight1 from '../components/webpage/Insight1';
import Footer from '../components/Footer';
import { getPageChrome } from '@/lib/accessories/defaultThemeAccessories';
type PageProps = {
  data: PageData<WebpageModel>;
};

const WebpageColumnsLayout: React.FC<PageProps> = async ({ data }) => {
  console.log('[NEON] render: default/WebpageColumnsLayout');
  const chrome = getPageChrome(data);

  return (
    <div className="container mx-auto p-4">
      {chrome.showHeader && <Navbar data={data} showSectionsMenu={chrome.showSectionsMenu}></Navbar>}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="p-4 rounded-lg col-span-12">
          {/* <Main data={data} /> */}
          <MainWithHero data={data} accessories />
        </div>

        <div className="p-4 rounded-lg col-span-12">
          <Context data={data} accessories />
        </div>
        <div className="p-4 rounded-lg col-span-12">
          <Insight1 data={data} displayMainPicture={false} accessories />
        </div>
      </div>

      {chrome.showFooter && (
        <footer className="p-4 rounded-b-lg mt-4">
          <Footer data={data} showMenu={chrome.showFooterMenu} />
        </footer>
      )}
    </div>
  );
};

export default WebpageColumnsLayout;
