import React from 'react';
import { PageData, WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import ArticleWebpageWithHero from '../ArticleWebpageWithHero';

type WebpageFragmentProps = {
  data: PageData<WebpageModel>;
  displayMainPicture?: boolean;
};

const MainWithHero: React.FC<WebpageFragmentProps> = async ({ data, displayMainPicture = true }) => {
  const linkedObjects = await connection.getDwxLinkedObjects(data, 'main');

  return <ArticleWebpageWithHero data={data} displayMainPicture={displayMainPicture} linkedObjects={linkedObjects} />;
};

export default MainWithHero;
