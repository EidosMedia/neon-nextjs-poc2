import { ArticleModel } from '@/types/models';

type MainImageProps = {
  data: ArticleModel;
};

const getMainImageUrl = (data: ArticleModel, format: string) => {
  console.log('data', data.links.system.mainPicture);
  return data.links.system.mainPicture[0].dynamicCropsResourceUrls[format];
};

const MainImage: React.FC<MainImageProps> = ({ data }) => {
  let imageWidth = 1024;
  let imageHeight = 576;

  const mainImageUrl = getMainImageUrl(data, 'Wide_large');

  // let tmx = data?.pageContext?.mainPicture?.metadata.softCrops?.Wide?.tmx;
  // if (tmx === undefined)
  //   tmx = data?.pageContext?.mainPicture?.metadata.softCrops?.Square?.tmx;

  // if (tmx !== undefined) {
  //   let tokens = tmx.split(' ');
  //   imageWidth = tokens[tokens.length - 2];
  //   imageHeight = tokens[tokens.length - 1];
  // }

  const render = (
    <div>
      <div>
        {mainImageUrl ? (
          <img
            src={mainImageUrl}
            alt=""
            height={imageHeight}
            width={imageWidth}
          />
        ) : (
          <p>No image available</p>
        )}
      </div>
    </div>
  );
  return render;
};

export default MainImage;
