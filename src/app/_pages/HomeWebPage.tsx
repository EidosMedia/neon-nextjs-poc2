import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from '../components/Navbar';
import Main from '../components/webpage/Main';
import Context from '../components/webpage/Context';
import Insight1 from '../components/webpage/Insight1';
import Insight2 from '../components/webpage/Insight2';

type PageProps = {
  data: PageData<WebpageModel>;
};

const HomeWebPage: React.FC<PageProps> = async ({ data }) => {
  return (
    <div className="container mx-auto">
      <Navbar data={data}></Navbar>
      <Main data={data} />
      <Context data={data} />
      <Insight1 data={data} />
      <Insight2 data={data} />
    </div>
  );
};

export default HomeWebPage;
