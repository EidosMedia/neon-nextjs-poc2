'use client';

import React from 'react';
import { PageData, WebpageModel, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Link from 'next/link';
import ContentEditable from './utilities/ContentEditable';
import useLoggedUserInfo from '@/hooks/useLoggedUserInfo';
import ArticleOverlay from './base/ArticleOverlay';
import { getPublicationDateString } from '@/utilities/content';
import ArticleOrganism from './base/Organism/ArticleOrganism';

type ArticleWepageProps = {
  data: PageData<WebpageModel>;
  displayMainPicture: boolean;
  linkedObjects: WebpageNodeModel[];
};

const ArticleWebpage: React.FC<ArticleWepageProps> = ({ data, displayMainPicture, linkedObjects }) => {
  const key = new Date().toISOString() + Math.random().toString(36).substring(2, 15);
  const key1 = new Date().toISOString() + Math.random().toString(36).substring(2, 15);
  const { data: loggedUserInfo } = useLoggedUserInfo();

  return (
    <>
      {linkedObjects.map((linkedObject: any, index: number) => {
        var title, summary, titleId, summaryId;
        titleId = linkedObject.attributes?.contentIds?.teaserTitle;
        summaryId = linkedObject.attributes?.contentIds?.teaserSummary;

        if (linkedObject.attributes?.teaser?.title) {
          title = linkedObject.attributes?.teaser?.title;
        } else {
          title = linkedObject.title;
        }
        if (linkedObject.attributes?.teaser?.summary) {
          summary = linkedObject.attributes?.teaser?.summary;
        } else {
          summary = linkedObject.summary;
        }

        return (
          <ArticleOrganism
            key={linkedObject.id}
            data={data}
            linkedObject={linkedObject}
            linkedObjects={linkedObjects}
            index={index}
            type="article-xl"
          />
        );
      })}
    </>
  );
};

export default ArticleWebpage;
