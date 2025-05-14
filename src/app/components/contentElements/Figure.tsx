import { ContentElement } from '@eidosmedia/neon-frontoffice-ts-sdk';
import {findElementsInContentJson} from "@/utilities/content";

type MainImageProps = {
  data: ContentElement;
  alt: string;
};

const getImageUrl = (data: ContentElement, format: string) => {
  const element = data.elements.find((elem) => elem.attributes.crop === format);
  return element && element.dynamicCropsResourceUrls
    ? element.dynamicCropsResourceUrls[format]
    : undefined;
};

const Figure: React.FC<MainImageProps> = ({ data, alt }) => {
  let imageWidth = 1024;
  let imageHeight = 576;

  const imageUrl = getImageUrl(data, 'Wide_large');
  const svgImageUrl = findElementsInContentJson(['graphic'], data)[0];
  const baseUrl = "https://theglobe-test-region-a-site.neon.com";

  const render = (
      <div>
        <div>
          {imageUrl ? (
              <img
                  src={imageUrl}
                  alt={alt}
                  height={imageHeight}
                  width={imageWidth}
              />
          ) : svgImageUrl?.attributes?.fileref ? (
              <img
                  src={`${baseUrl}${svgImageUrl.attributes.fileref}`}
                  alt={alt}
                  height={svgImageUrl.attributes.height}
                  width={svgImageUrl.attributes.width}
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
