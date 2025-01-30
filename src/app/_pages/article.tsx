import { ArticleModel } from '@/types/models';
import { PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';

type PageProps = {
  data: PageData<ArticleModel>;
};

const Article: React.FC<PageProps> = ({ data }) => {
  return <div>{JSON.stringify(data.model.data)}</div>;
};

export default Article;
