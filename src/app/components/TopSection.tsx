import React from 'react';
import { PageData, WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Link from 'next/link';

type TopSectionProps = {
  data: PageData<WebpageModel>;
};

const TopSection: React.FC<TopSectionProps> = async ({ data }) => {
  const linkedObjects = await connection.getDwxLinkedObjects(data, 'top');

  return (
    <>
      {linkedObjects.map((linkedObject: any, index: number) => (
        <div key={linkedObject.id} className="p-4">
          <div className="p-4 bg-gray-100 rounded-lg shadow-md">
            <Link href={linkedObjects[`${index}`].url}>
              <img
                alt="/static/img/nothumb.jpeg"
                width={550}
                height={287}
                decoding="async"
                src={linkedObject.links.system.mainPicture[0].dynamicCropsResourceUrls.Portrait_small}
              />
              <div className="p-4">
                <h6 className="text-lg font-semibold text-gray-900">{linkedObject.title}</h6>
                <p className="text-base text-gray-700">{linkedObject.summary}</p>
              </div>
            </Link>
          </div>
        </div>
      ))}
    </>
  );
};

export default TopSection;
