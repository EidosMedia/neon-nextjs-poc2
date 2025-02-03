import { ContentElement } from '@eidosmedia/neon-frontoffice-ts-sdk';

type MainImageProps = {
  data: ContentElement;
  alt: string;
};

const getMainImageUrl = (data: ContentElement, format: string) => {
  const element = data.elements.find((elem) => elem.attributes.crop === format);
  return element && element.dynamicCropsResourceUrls
    ? element.dynamicCropsResourceUrls[format]
    : undefined;
};

const Figure: React.FC<MainImageProps> = ({ data, alt }) => {
  console.log('data figure', data);
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
            alt={alt}
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

export default Figure;
