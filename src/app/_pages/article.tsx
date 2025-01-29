import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';

type PageProps = {
  data: PageData;
};

const Article: React.FC<PageProps> = ({ data }) => {
  return <div>{JSON.stringify(data)}</div>;
};

export default Article;
