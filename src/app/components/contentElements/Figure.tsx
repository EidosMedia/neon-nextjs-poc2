import {ContentElement} from '@eidosmedia/neon-frontoffice-ts-sdk';
import {findElementsInContentJson} from "@/utilities/content";

type MainImageProps = {
    data: ContentElement;
    alt: string;
    format?: string;
};

const getRasterUrl = (data: ContentElement, format: string) => {
    const element = data.elements.find(elem => elem.attributes.crop === format || elem.attributes.softCrop === format);
    if (element?.attributes.src) {
        return element.attributes.src;
    }
    return element && element.dynamicCropsResourceUrls ? element.dynamicCropsResourceUrls[format] : undefined;
};

const getSvgUrl = (data: ContentElement): string | undefined => {
    const element = data.elements.find(elem => elem.nodeType === "graphic");
    return element?.attributes.fileref;
};

const Figure: React.FC<MainImageProps> = ({data, alt, format}) => {
    const imageUrl = getSvgUrl(data) || getRasterUrl(data, format || 'Wide');

    return (
        <div>
            <div>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={alt}
                    />
                ) : (
                    <p>No image available</p>
                )}
            </div>
        </div>
    );
};

export default Figure;