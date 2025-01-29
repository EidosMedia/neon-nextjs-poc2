import Navbar from '../components/Navbar';

import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';

type PageProps = {
  data: PageData;
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
