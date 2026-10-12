import React from 'react';
import { PageData, WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import ArticleWebpageWithHero from '../ArticleWebpageWithHero';
import { getZoneAccessoryShapes } from '@/lib/accessories/defaultThemeAccessories';

type WebpageFragmentProps = {
  data: PageData<WebpageModel>;
  displayMainPicture?: boolean;
  accessories?: boolean;
};

const MainWithHero: React.FC<WebpageFragmentProps> = async ({
  data,
  displayMainPicture = true,
  accessories = false,
}) => {
  const linkedObjects = await connection.getDwxLinkedObjects(data, 'main');

  return (
    <ArticleWebpageWithHero
      data={data}
      displayMainPicture={displayMainPicture}
      linkedObjects={linkedObjects}
      accessories={accessories ? getZoneAccessoryShapes(data, 'main', linkedObjects) : undefined}
    />
  );
};

export default MainWithHero;
