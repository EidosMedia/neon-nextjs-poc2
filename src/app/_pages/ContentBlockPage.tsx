import { PageData, WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import ArticleWebpage from '../components/ArticleWebpage';
import { getActiveTheme, getZoneAccessoryShapes } from '@/lib/accessories/defaultThemeAccessories';

type PageProps = {
  data: PageData<WebpageModel>;
};

/** Rendered html of a content block, without the editor toolbar: its title and its main zone items. */
const ContentBlockPage: React.FC<PageProps> = async ({ data }) => {
  const linkedObjects = await connection.getDwxLinkedObjects(data, 'main');
  const accessories =
    getActiveTheme(data) === 'default' ? getZoneAccessoryShapes(data, 'main', linkedObjects) : undefined;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">{data.model.data.title}</h1>
      <ArticleWebpage data={data} displayMainPicture={false} linkedObjects={linkedObjects} accessories={accessories} />
    </div>
  );
};

export default ContentBlockPage;
