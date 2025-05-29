import {ArticleModel} from '@/types/models';
import {findElementsInContentJson, renderContent} from '@/utilities/content';

type MainImageProps = {
  data: ArticleModel;
  format?: string;
  hideCaptions?: boolean;
};

const getTeaserOrMainImageUrl = (data: ArticleModel, format: string): string | undefined => {
  const teaserPicture = data?.links?.system?.teaserPicture?.[0];
  const mainPicture = data?.links?.system?.mainPicture?.[0];

  return teaserPicture?.dynamicCropsResourceUrls?.[format]
      ?? mainPicture?.dynamicCropsResourceUrls?.[format];
};

const MainImage: React.FC<MainImageProps> = ({ data, format, hideCaptions }) => {
  const imageUrl = getTeaserOrMainImageUrl(data, format || 'Wide_large');

  return (
      <div>
          <div>
              {imageUrl ? (
                  <div className="flex flex-col gap-2 mb-8">
                      <img src={imageUrl} alt="" />
                      {!hideCaptions &&
                          renderContent(findElementsInContentJson(['web-image-caption'], data.files.content.data)[0])}
                  </div>
              ) : (
                  <p>No main image available</p>
              )}
          </div>
      </div>
  );
};

export default MainImage;
