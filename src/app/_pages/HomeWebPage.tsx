import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from '../components/Navbar';
import Main from '../components/webpage/Main';
import Context from '../components/webpage/Context';
import Insight1 from '../components/webpage/Insight1';
import Insight2 from '../components/webpage/Insight2';
import { getPageChrome } from '@/lib/accessories/defaultThemeAccessories';

type PageProps = {
  data: PageData<WebpageModel>;
};

const HomeWebPage: React.FC<PageProps> = async ({ data }) => {
  console.log('[NEON] render: default/HomeWebPage');
  const chrome = getPageChrome(data);

  return (
    <div className="container mx-auto">
      {chrome.showHeader && <Navbar data={data} showSectionsMenu={chrome.showSectionsMenu}></Navbar>}
      <div className="grid grid-cols-1 gap-2">
        <div className="col-span-1 relative group">
          <Main data={data} accessories />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        <div className="col-span-1 relative group">
          <Context data={data} accessories />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        <div className="col-span-1 relative group">
          <Insight1 data={data} accessories />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        <div className="col-span-1 relative group">
          <Insight2 data={data} accessories />
        </div>
      </div>
    </div>
  );
};

export default HomeWebPage;
