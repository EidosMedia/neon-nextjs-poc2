import React from 'react';
import { PageData, WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import ArticleWebpage from '../ArticleWebpage';
import { getZoneAccessoryShapes } from '@/lib/accessories/defaultThemeAccessories';

type WebpageFragmentProps = {
  data: PageData<WebpageModel>;
  displayMainPicture?: boolean;
  accessories?: boolean;
};

const Context: React.FC<WebpageFragmentProps> = async ({ data, displayMainPicture = true, accessories = false }) => {
  const linkedObjects = await connection.getDwxLinkedObjects(data, 'context');

  return (
    <ArticleWebpage
      data={data}
      displayMainPicture={displayMainPicture}
      linkedObjects={linkedObjects}
      accessories={accessories ? getZoneAccessoryShapes(data, 'context', linkedObjects) : undefined}
    />
  );
};

export default Context;
