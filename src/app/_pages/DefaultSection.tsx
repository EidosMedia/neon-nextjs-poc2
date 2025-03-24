import { WebpageModel } from '@/types/models/WebpageModel';
import Navbar from '../components/Navbar';
import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import DefaultSectionItemsRenderer from '../components/DefaultSectionItemsRenderer';

type PageProps = {
  data: PageData<WebpageModel>;
};

const Section: React.FC<PageProps> = ({ data }) => {
  return (
    <div>
      <Navbar data={data} />
      <DefaultSectionItemsRenderer data={data} />
    </div>
  );
};

export default Section;
