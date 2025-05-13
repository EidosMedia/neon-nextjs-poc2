import React from 'react';
import { PageData, WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Link from 'next/link';
import ArticleOverlay from '../base/ArticleOverlay';

type WebpageFragmentProps = {
  data: PageData<WebpageModel>;
};

const Insight2: React.FC<WebpageFragmentProps> = async ({ data }) => {
  const linkedObjects = await connection.getDwxLinkedObjects(data, 'insight2');

  return (
    <>
      {linkedObjects.map((linkedObject: any, index: number) => {
        var title, summary;
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

        return (
          <div key={linkedObject.id} className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="col-span-1 relative group">
              <ArticleOverlay data={linkedObject} viewStatus={data.siteData.viewStatus}>
                <Link className="no-underline" href={linkedObjects[`${index}`].url}>
                  <div className="p-4">
                    <img
                      alt="/static/img/nothumb.jpeg"
                      width="200"
                      height="200"
                      decoding="async"
                      data-nimg="1"
                      src={linkedObject.links.system.mainPicture[0].dynamicCropsResourceUrls.Portrait_small}
                      className="w-48 h-48 object-cover"
                      style={{ color: 'transparent' }}
                    />
                    <div className="mt-2">
                      <div>
                        <span className="text-base">{title}</span>
                      </div>
                      <h6 className="text-xl font-semibold">{title}</h6>
                      <p className="text-base">{summary}</p>
                    </div>
                  </div>
                </Link>
              </ArticleOverlay>
            </div>
          </div>
        )}
      )}
    </>
  );
};

export default Insight2;
