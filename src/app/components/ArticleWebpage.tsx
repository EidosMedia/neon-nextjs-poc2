'use client';

import React from 'react';
import { PageData, WebpageModel, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import ArticleOrganism from './base/Organism/ArticleOrganism';

type ArticleWepageProps = {
  data: PageData<WebpageModel>;
  displayMainPicture: boolean;
  linkedObjects: WebpageNodeModel[];
};

const ArticleWebpage: React.FC<ArticleWepageProps> = ({ data, displayMainPicture, linkedObjects }) => {
  return (
    <>
      {linkedObjects.map((linkedObject: any, index: number) => {
        return (
          <ArticleOrganism
            key={linkedObject.id}
            data={data}
            linkedObject={linkedObject}
            linkedObjects={linkedObjects}
            index={index}
            type={ index === 0 ? "article-xl" : "article-md"}
          />
        );
      })}
    </>
  );
};

export default ArticleWebpage;
