'use client';

import React from 'react';
import { PageData, WebpageModel, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Link from 'next/link';
import ContentEditable from './utilities/ContentEditable';
import useLoggedUserInfo from '@/hooks/useLoggedUserInfo';
import ArticleOverlay from './base/ArticleOverlay';

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
        titleId = linkedObject.attributes.contentIds.teaserTitle;
        summaryId = linkedObject.attributes.contentIds.teaserSummary;

        if (linkedObject.attributes?.teaser?.title) {
          title = linkedObject.attributes.teaser.title;
        } else {
          title = linkedObject.title;
        }
        if (linkedObject.attributes?.teaser?.summary) {
          summary = linkedObject.attributes.teaser.summary;
        } else {
          summary = linkedObject.summary;
        }

        const contentBlock = (
          <>
            <div className="self-stretch leading-snug">
              {displayMainPicture && (
                <img
                  alt="/static/img/nothumb.jpeg"
                  width="200"
                  height="200"
                  decoding="async"
                  data-nimg="1"
                  src={linkedObject.links?.system?.mainPicture[0].dynamicCropsResourceUrls.Portrait_small}
                  className="w-48 h-48 object-cover"
                  style={{ color: 'transparent' }}
                />
              )}
            </div>
            <ContentEditable key={key} articleId={linkedObject.id} lockedBy={linkedObject.sys?.lockedBy}>
              <div id={titleId} className="text-black text-lg font-semibold font-source-sans leading-snug">
                <p>{title}</p>
              </div>
            </ContentEditable>
            <ContentEditable key={key1} articleId={linkedObject.id} lockedBy={linkedObject.sys?.lockedBy}>
              <div id={summaryId} className="text-black text-xs font-normal font-source-sans leading-snug">
                <p>{summary}</p>
              </div>
            </ContentEditable>
            <div className="self-stretch text-[#5d5d5d] text-xs font-normal font-source-sans leading-snug">
              {linkedObject.pubInfo.publicationTime}
            </div>
          </>
        );
        return (
          <div key={linkedObject.id} data-layer="article">
            {loggedUserInfo?.inspectItems ? (
              <ArticleOverlay data={linkedObject} viewStatus={data.siteData.viewStatus}>
                {contentBlock}
              </ArticleOverlay>
            ) : (
              <Link className="no-underline" href={linkedObjects[`${index}`].url}>
                {contentBlock}
              </Link>
            )}
            <br />
          </div>
        );
      })}
    </>
  );
};

export default ArticleWebpage;
