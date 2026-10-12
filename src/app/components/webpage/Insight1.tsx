import React from 'react';
import { PageData, WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Link from 'next/link';
import ArticleOverlay from '../base/ArticleOverlay';
import ArticleWebpage from '../ArticleWebpage';
import { getZoneAccessoryShapes } from '@/lib/accessories/defaultThemeAccessories';

type WebpageFragmentProps = {
  data: PageData<WebpageModel>;
  displayMainPicture?: boolean; // Make optional
  imageFormat?: string;
  accessories?: boolean;
};

const Insight1: React.FC<WebpageFragmentProps> = async ({
  data,
  displayMainPicture = true,
  imageFormat,
  accessories = false,
}) => {
  const linkedObjects = await connection.getDwxLinkedObjects(data, 'insight1');

  return (
    <ArticleWebpage
      data={data}
      displayMainPicture={displayMainPicture}
      linkedObjects={linkedObjects}
      imageFormat={imageFormat}
      accessories={accessories ? getZoneAccessoryShapes(data, 'insight1', linkedObjects) : undefined}
    />
  );
};

export default Insight1;
