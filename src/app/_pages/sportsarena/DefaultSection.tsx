import { WebpageModel } from '@/types/models/WebpageModel';
import Navbar from './Navbar';
import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import DefaultSectionItemsRenderer from '../../components/DefaultSectionItemsRenderer';
import Footer from './Footer';

type PageProps = {
  data: PageData<WebpageModel>;
};

const Section: React.FC<PageProps> = ({ data }) => {
  console.log('[NEON] render: sportsarena/DefaultSection');

  return (
    <div className="container mx-auto">
      <Navbar data={data} />
      <DefaultSectionItemsRenderer data={data} />
      <Footer data={data} />
    </div>
  );
};

export default Section;
