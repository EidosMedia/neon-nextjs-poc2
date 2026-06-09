import { ArticleModel } from '@/types/models';
import { findElementsInContentJson, renderContent } from '@/utilities/content';

type HeroCoverImageProps = {
  data: ArticleModel;
  format?: string;
  preferredImage?: string;
};

const getTeaserOrMainImageUrl = (
  data: ArticleModel,
  format: string,
  preferredImage?: string,
): string | undefined => {
  const teaserPicture = data?.links?.system?.teaserPicture?.[0];
  const teaserPictureFormat = teaserPicture?.dynamicCropsResourceUrls?.[format];

  const mainPicture = data?.links?.system?.mainPicture?.[0];
  const mainPictureFormat = mainPicture?.dynamicCropsResourceUrls?.[format];

  if (preferredImage === 'main') {
    return mainPictureFormat ?? teaserPictureFormat;
  }

  return teaserPictureFormat ?? mainPictureFormat;
};

const HeroCoverImage: React.FC<HeroCoverImageProps> = ({ data, format, preferredImage }) => {
  const imageUrl = getTeaserOrMainImageUrl(data, format || 'Ultrawide_large', preferredImage);
  const groupheadContent = findElementsInContentJson(['grouphead'], data.files.content.data)[0];

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden">
      {imageUrl ? (
        <>
          {/* Background Image */}
          <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />

          {/* Gradient Overlay - darker at bottom for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Content Overlay - Grouphead positioned at bottom */}
          <div className="absolute inset-0 flex items-end">
            <div className="container mx-auto px-5 xl:px-52 pb-12">
              <div className="text-white [&_h1]:text-white [&_h5]:text-white [&_h5]:text-gray-200">
                {groupheadContent && renderContent(groupheadContent, data, undefined, 'flex flex-col gap-4')}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full bg-gray-200">
          <p className="text-gray-500">No hero image available</p>
        </div>
      )}
    </div>
  );
};

export default HeroCoverImage;
