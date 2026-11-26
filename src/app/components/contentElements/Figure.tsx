import { ContentElement } from '@eidosmedia/neon-frontoffice-ts-sdk';

type FigureProps = {
  data: ContentElement;
  alt: string;
  format: string;
};

const getRasterUrl = (data: ContentElement, format: string): string | undefined => {
  const targetFormat = format.toLowerCase();
  const imageElements = data.elements.filter(elem => elem.nodeType === 'image');

  const element = imageElements.find(elem => {
    const attrs = elem.attributes || {};
    const softCrop = attrs.softCrop?.toLowerCase();
    return softCrop === targetFormat;
  });

  if (element?.attributes?.src) {
    return element.attributes.src;
  }

  return imageElements[0]?.attributes?.src; // fallback to first available
};

const getGraphic = (data: ContentElement): ContentElement | undefined =>
  data.elements.find(elem => elem.nodeType === 'graphic');

const getSvgUrl = (data: ContentElement): string | undefined => getGraphic(data)?.attributes?.fileref;

type GraphicCrop = { imageWidth: number; imageHeight: number; width: number; height: number; transform: string };

const TRANSFORM_FUNCTION = /^(matrix|translate|scale|rotate|skewX|skewY)\(\s*-?[\d.]+(?:[\s,]+-?[\d.]+)*\s*\)$/;

/**
 * The editor stores a graphic crop as `tmx` ("imageW imageH containerW containerH") plus an `xtransform`
 * list of transform functions, e.g. "translate(-557 -638) scale(3.02 3.02)", that places the image inside
 * the container. The delivery layer does not crop graphics, so the crop is applied here.
 */
export const getGraphicCrop = (graphic: ContentElement | undefined): GraphicCrop | null => {
  const tmx = graphic?.attributes?.tmx;
  const xtransform = graphic?.attributes?.xtransform;
  if (!tmx || !xtransform) return null;

  const [imageWidth, imageHeight, width, height] = tmx.trim().split(/\s+/).map(Number);
  if (![imageWidth, imageHeight, width, height].every(n => Number.isFinite(n) && n > 0)) return null;

  const functions = xtransform.trim().match(/[a-zA-Z]+\([^)]*\)/g);
  if (!functions || functions.join('').length < xtransform.replace(/\s+/g, '').length) return null;
  if (!functions.every(fn => TRANSFORM_FUNCTION.test(fn.trim()))) return null;

  return { imageWidth, imageHeight, width, height, transform: functions.join(' ') };
};

const getDimensionsFromUrl = (url: string): { width: number; height: number } | null => {
  const match = url.match(/:(\d+)x(\d+):/);
  if (match) {
    const width = parseInt(match[1], 10);
    const height = parseInt(match[2], 10);
    return { width, height };
  }
  return null;
};

const Figure: React.FC<FigureProps> = ({ data, alt, format }) => {
  const graphicUrl = getSvgUrl(data);
  const crop = graphicUrl ? getGraphicCrop(getGraphic(data)) : null;

  if (graphicUrl && crop) {
    return (
      <svg
        viewBox={`0 0 ${crop.width} ${crop.height}`}
        width={crop.width}
        style={{ maxWidth: '100%', height: 'auto' }}
        role="img"
        aria-label={alt}
        data-testid="cropped-graphic"
      >
        <image
          href={graphicUrl}
          width={crop.imageWidth}
          height={crop.imageHeight}
          transform={crop.transform}
        />
      </svg>
    );
  }

  const imageUrl = graphicUrl || getRasterUrl(data, format);
  const dimensions = imageUrl && getDimensionsFromUrl(imageUrl);

  return (
    <>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={alt}
          width={dimensions ? dimensions.width : undefined}
          height={dimensions ? dimensions.height : undefined}
        />
      ) : (
        <p>No image available</p>
      )}
    </>
  );
};

export default Figure;
