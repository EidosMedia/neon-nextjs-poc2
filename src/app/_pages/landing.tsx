import { PageModel } from '@/types/models';
import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from '../components/Navbar';

type PageProps = {
  data: PageData<PageModel>;
};

const Landing: React.FC<PageProps> = ({ data }) => {
  return (
    <div>
      <Navbar data={data}></Navbar>
      {JSON.stringify(data)}
    </div>
  );
};

export default Landing;
