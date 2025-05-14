import { ArticleModel } from '@/types/models';
import { findElementsInContentJson, renderContent } from '@/utilities/content';

type MainImageProps = {
  data: ArticleModel;
};

const getMainImageUrl = (data: ArticleModel, format: string) => {
  return data.links?.system.mainPicture[0].dynamicCropsResourceUrls[format];
};

const MainImage: React.FC<MainImageProps> = ({ data }) => {
  let imageWidth = 1024;
  let imageHeight = 576;

  const mainImageUrl = getMainImageUrl(data, 'Wide_large');

  const render = (
    <div>
      <div>
        {mainImageUrl ? (
          <div>
            <img src={mainImageUrl} alt="" height={imageHeight} width={imageWidth} />
            {renderContent(findElementsInContentJson(['web-image-caption'], data.files.content.data)[0])}
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
