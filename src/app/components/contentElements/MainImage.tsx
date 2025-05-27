import { ArticleModel } from '@/types/models';
import { findElementsInContentJson, renderContent } from '@/utilities/content';

type MainImageProps = {
  data: ArticleModel;
  format?: string;
  hideCaptions?: boolean;
};

const getMainImageUrl = (data: ArticleModel, format: string): string | undefined => {
  const mainPicture = data?.links?.system?.mainPicture?.[0];
  return mainPicture?.dynamicCropsResourceUrls?.[format];
};

const MainImage: React.FC<MainImageProps> = ({ data, format, hideCaptions }) => {
  let imageWidth = 1024;
  let imageHeight = 576;

  const mainImageUrl = getMainImageUrl(data, format || 'Wide_large');

  const render = (
    <div>
      <div>
        {mainImageUrl ? (
          <div>
            <img src={mainImageUrl} alt="" />
            {!hideCaptions &&
              renderContent(findElementsInContentJson(['web-image-caption'], data.files.content.data)[0])}
          </div>
        ) : (
          <p>No main image available</p>
        )}
      </div>
    </div>
  );
  return render;
};

export default MainImage;
