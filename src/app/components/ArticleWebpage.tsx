'use client';

import React from 'react';
import { PageData, WebpageModel, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import ArticleOrganism from './base/Organism/ArticleOrganism';
import LiveblogOrganism from './base/Organism/LiveblogOrganism';

type ArticleWepageProps = {
  data: PageData<WebpageModel>;
  displayMainPicture: boolean;
  linkedObjects: WebpageNodeModel[];
  imageFormat?: string;
};

const ArticleWebpage: React.FC<ArticleWepageProps> = ({ data, displayMainPicture, linkedObjects, imageFormat }) => {
  return (
    <>
      {linkedObjects.map((linkedObject: any, index: number) => {
        const type = index === 0 ? 'article-xl' : 'article-md';
        return linkedObject.sys?.baseType === 'liveblog' ? (
          <LiveblogOrganism
            key={linkedObject.id}
            data={data}
            linkedObject={linkedObject}
            linkedObjects={linkedObjects}
            index={index}
            type={type}
            imageFormat={imageFormat}
          />
        ) : (
          <ArticleOrganism
            key={linkedObject.id}
            data={data}
            linkedObject={linkedObject}
            linkedObjects={linkedObjects}
            index={index}
            type={type}
            imageFormat={imageFormat}
          />
        );
      })}
    </>
  );
};

export default ArticleWebpage;
