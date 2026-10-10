import React from 'react';
import { PageData, WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Link from 'next/link';
import ArticleOverlay from '../base/ArticleOverlay';
import ArticleWebpage from '../ArticleWebpage';
import { getZoneAccessoryShapes } from '@/lib/accessories/defaultThemeAccessories';

type WebpageFragmentProps = {
  data: PageData<WebpageModel>;
  displayMainPicture?: boolean;
  accessories?: boolean;
};

const Insight2: React.FC<WebpageFragmentProps> = async ({ data, displayMainPicture = true, accessories = false }) => {
  const linkedObjects = await connection.getDwxLinkedObjects(data, 'insight2');

  return (
    <ArticleWebpage
      data={data}
      displayMainPicture={displayMainPicture}
      linkedObjects={linkedObjects}
      accessories={accessories ? getZoneAccessoryShapes(data, 'insight2', linkedObjects) : undefined}
    />
  );
};

export default Insight2;
