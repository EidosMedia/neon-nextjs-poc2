import { ArticleModel } from '@/types/models';
import { ContentElement, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Navbar from '../components/Navbar';
import { renderContent, findElementsInContentJson } from '@/utilities/content';
import Grouphead from '../components/contentElements/Grouphead';
import MainImage from '../components/contentElements/MainImage';

type PageProps = {
  data: PageData<ArticleModel>;
};

const Article: React.FC<PageProps> = ({ data }) => {
  console.log('data.model.data.files.content.data', data.model.data);

  return (
    <div className="container mx-auto">
      <Navbar data={data}></Navbar>
      <Grouphead data={data.model.data} />
      <MainImage data={data.model.data} />
      {renderContent(
        findElementsInContentJson(
          ['text'],
          data.model.data.files.content.data
        )[0]
      )}
    </div>
  );
};

export default Article;
