import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from '../components/Navbar';
import { WebpageModel } from '@/types/models/WebpageModel';
import DefaultSectionItemsRenderer from '../components/DefaultSectionItemsRenderer';
import Footer from '../components/Footer';

type PageProps = {
  data: PageData<WebpageModel>;
};

const Landing: React.FC<PageProps> = ({ data }) => {
  return (
    <div className="container mx-auto">
      <Navbar data={data} />
      <DefaultSectionItemsRenderer data={data} />
      <Footer data={data} />
    </div>
  );
};

export default Landing;
