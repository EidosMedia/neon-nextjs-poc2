import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from '../components/Navbar';
import Main from '../components/webpage/Main';
import Context from '../components/webpage/Context';
import Insight1 from '../components/webpage/Insight1';
import Insight2 from '../components/webpage/Insight2';
import Footer from '../components/Footer';

type PageProps = {
  data: PageData<WebpageModel>;
};

const SectionWebPage: React.FC<PageProps> = async ({ data }) => {
  return (
    <div className="container mx-auto">
      <Navbar data={data} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="col-span-1 relative group">
          <Main data={data} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="col-span-1 relative group">
          <Context data={data} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="col-span-1 relative group">
          <Insight1 data={data} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="col-span-1 relative group">
          <Insight2 data={data} />
        </div>
      </div>
      <Footer data={data} />
    </div>
  );
};

export default SectionWebPage;
