import {ContentElement} from '@eidosmedia/neon-frontoffice-ts-sdk';

type FigureProps = {
    data: ContentElement;
    alt: string;
    format: string;
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

const getDimensionsFromUrl = (url: string): { width: number; height: number } | null => {
    const match = url.match(/:(\d+)x(\d+):/);
    if (match) {
        const width = parseInt(match[1], 10);
        const height = parseInt(match[2], 10);
        return { width, height };
    }
    return null;
}

const Figure: React.FC<FigureProps> = ({data, alt, format}) => {
    const imageUrl = getSvgUrl(data) || getRasterUrl(data, format);
    const dimensions = imageUrl && getDimensionsFromUrl(imageUrl);

    return (
        <div>
            <div>
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
            </div>
        </div>
    );
};

export default Figure;