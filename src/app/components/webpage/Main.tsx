import React from 'react';
import { PageData, WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Link from 'next/link';
import ArticleOverlay from '../base/ArticleOverlay';
import ArticleWebpage from '../ArticleWebpage';

type WebpageFragmentProps = {
  data: PageData<WebpageModel>;
  displayMainPicture?: boolean;
};

const Main: React.FC<WebpageFragmentProps> = async ({ data, displayMainPicture = true }) => {
  const linkedObjects = await connection.getDwxLinkedObjects(data, 'main');

  return <ArticleWebpage data={data} displayMainPicture={displayMainPicture} linkedObjects={linkedObjects} />;
};

export default Main;
