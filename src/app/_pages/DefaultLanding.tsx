import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from '../components/Navbar';
import { WebpageModel } from '@/types/models/WebpageModel';
import DefaultSectionItemsRenderer from '../components/DefaultSectionItemsRenderer';

type PageProps = {
  data: PageData<WebpageModel>;
};

const Landing: React.FC<PageProps> = ({ data }) => {
  return (
    <div>
      <Navbar data={data} />
      <DefaultSectionItemsRenderer data={data} />
    </div>
  );
};

export default Landing;
