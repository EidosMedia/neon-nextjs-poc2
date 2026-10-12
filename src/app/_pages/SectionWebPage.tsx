import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from '../components/Navbar';
import Main from '../components/webpage/Main';
import Context from '../components/webpage/Context';
import Insight1 from '../components/webpage/Insight1';
import Insight2 from '../components/webpage/Insight2';
import Footer from '../components/Footer';
import { getPageChrome } from '@/lib/accessories/defaultThemeAccessories';

type PageProps = {
  data: PageData<WebpageModel>;
};

const SectionWebPage: React.FC<PageProps> = async ({ data }) => {
  console.log('[NEON] render: default/SectionWebPage');
  const chrome = getPageChrome(data);

  return (
    <div className="container mx-auto">
      {chrome.showHeader && <Navbar data={data} showSectionsMenu={chrome.showSectionsMenu} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="col-span-1 relative group">
          <Main data={data} accessories />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="col-span-1 relative group">
          <Context data={data} accessories />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="col-span-1 relative group">
          <Insight1 data={data} accessories />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="col-span-1 relative group">
          <Insight2 data={data} accessories />
        </div>
      </div>
      {chrome.showFooter && <Footer data={data} showMenu={chrome.showFooterMenu} />}
    </div>
  );
};

export default SectionWebPage;
