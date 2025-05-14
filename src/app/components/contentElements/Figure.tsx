import {ContentElement} from '@eidosmedia/neon-frontoffice-ts-sdk';
import {findElementsInContentJson} from "@/utilities/content";

type MainImageProps = {
    data: ContentElement;
    alt: string;
};

/*const getImageUrl = (data: ContentElement, format: string) => {
    const element = data.elements.find((elem) => elem.attributes.softCrop === format);
    return element && element.dynamicCropsResourceUrls
        ? element.dynamicCropsResourceUrls[format]
        : undefined;
};*/

const getRasterElements = (data: any, softCrop: string): ContentElement[] => {
    return findElementsInContentJson('image', data)
        .filter((img) => img.attributes?.softCrop === softCrop);
};

const Figure: React.FC<MainImageProps> = ({data, alt}) => {
    let imageWidth = 1024;
    let imageHeight = 576;

    const baseUrl = "https://theglobe-test-region-a-site.neon.com";
    const svgElements = findElementsInContentJson(['graphic'], data);
    const rasterElements = getRasterElements(data, 'Wide');

    const images = [
        ...rasterElements.map((el, idx) => ({
            type: 'raster',
            url: el.attributes?.src,
            width: imageWidth,
            height: imageHeight,
            key: `raster-${idx}`
        })),
        ...svgElements.map((el, idx) => ({
            type: 'svg',
            url: `${baseUrl}${el.attributes.fileref.startsWith("/") ? "" : "/"}${el.attributes.fileref}`,
            width: el.attributes.width,
            height: el.attributes.height,
            key: `svg-${idx}`
        }))
    ];

    return (
        <div className="image-gallery">
            {images.length > 0 ? (
                images.map((img) => (
                    <img
                        key={img.key}
                        src={img.url}
                        alt={alt}
                        width={img.width}
                        height={img.height}
                    />
                ))
            ) : (
                <p>No content images available</p>
            )}
        </div>
    );
};

export default Figure;