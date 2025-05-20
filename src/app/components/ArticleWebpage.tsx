'use client';

import React from 'react';
import { PageData, WebpageModel, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Link from 'next/link';
import ContentEditable from './utilities/ContentEditable';
import useLoggedUserInfo from '@/hooks/useLoggedUserInfo';

type ArticleWepageProps = {
  data: PageData<WebpageModel>;
  zone: string;
  displayMainPicture: boolean;
  linkedObjects: WebpageNodeModel[];
};

const ArticleWebpage: React.FC<ArticleWepageProps> = ({ data, zone, displayMainPicture, linkedObjects }) => {
  const key = new Date().toISOString() + Math.random().toString(36).substring(2, 15);
  const { data: loggedUserInfo } = useLoggedUserInfo();

  return (
    <>
      {linkedObjects.map((linkedObject: any, index: number) => {
        const contentBlock = (
          <>
            <div className="self-stretch leading-snug">
              {displayMainPicture && (
                <img
                  alt="/static/img/nothumb.jpeg"
                  decoding="async"
                  data-nimg="1"
                  src={linkedObject.links?.system?.mainPicture[0].dynamicCropsResourceUrls.Portrait_small}
                  style={{ color: 'transparent' }}
                />
              )}
            </div>
            <ContentEditable key={key} id="title" articleId={linkedObject.id} lockedBy={linkedObject.sys?.lockedBy}>
              <div className="text-black text-lg font-semibold font-source-sans leading-snug">{linkedObject.title}</div>
            </ContentEditable>
            <div className="text-black text-xs font-normal font-source-sans leading-snug">{linkedObject.summary}</div>
            <div className="self-stretch text-[#5d5d5d] text-xs font-normal font-source-sans leading-snug">
              {linkedObject.pubInfo.publicationTime}
            </div>
          </>
        );
        return (
          <div key={linkedObject.id} data-layer="article">
            {loggedUserInfo?.inspectItems ? (
              contentBlock
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
