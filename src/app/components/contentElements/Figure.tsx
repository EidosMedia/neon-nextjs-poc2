import {ContentElement} from '@eidosmedia/neon-frontoffice-ts-sdk';
import {findElementsInContentJson} from "@/utilities/content";

type MainImageProps = {
    data: ContentElement;
    alt: string;
};

const getImageUrls = (data: ContentElement, format: string): string[] => {
    return data.elements
        .filter((elem) => elem.attributes.crop === format && elem.dynamicCropsResourceUrls?.[format])
        .map((elem) => elem.dynamicCropsResourceUrls![format]);
};

const Figure: React.FC<MainImageProps> = ({data, alt}) => {
    let imageWidth = 1024;
    let imageHeight = 576;

    const baseUrl = "https://theglobe-test-region-a-site.neon.com";
    const imageUrls = getImageUrls(data, 'Wide_large');
    const svgElements = findElementsInContentJson(['graphic'], data);

    const images = [
        ...imageUrls.map((url, idx) => ({
            type: 'raster',
            url,
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