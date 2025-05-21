import React from 'react';
import { PageData, WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Link from 'next/link';
import ArticleOverlay from './base/ArticleOverlay';

type ArticleWepageProps = {
  data: PageData<WebpageModel>;
  zone: string;
  displayMainPicture: boolean;
};

const ArticleWebpage: React.FC<ArticleWepageProps> = async ({ data, zone, displayMainPicture }) => {
  const linkedObjects = await connection.getDwxLinkedObjects(data, zone);
  return (
    <>
      {linkedObjects.map((linkedObject: any, index: number) => (
        <div key={linkedObject.id} data-layer="article">
          <ArticleOverlay data={linkedObject} viewStatus={data.siteData.viewStatus}>
            <Link className="no-underline" href={linkedObjects[`${index}`].url}>
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
              <div className="text-black text-lg font-semibold font-source-sans leading-snug">{linkedObject.title}</div>
              <div className="text-black text-xs font-normal font-source-sans leading-snug">{linkedObject.summary}</div>
              <div className="self-stretch text-[#5d5d5d] text-xs font-normal font-source-sans leading-snug">
                {linkedObject.pubInfo.publicationTime}
              </div>
            </Link>
          </ArticleOverlay>
          <br></br>
        </div>
      ))}
    </>
  );
};

export default ArticleWebpage;
