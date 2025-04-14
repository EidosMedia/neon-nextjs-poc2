import React from 'react';
import { BaseModel, PageData, PageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Link from 'next/link';
import ArticleOverlay from './base/ArticleOverlay';

type DefaultSectionItemsRendererProps = {
  data: PageData<BaseModel>;
};

const DefaultSectionItemsRenderer: React.FC<DefaultSectionItemsRendererProps> = async ({ data }) => {
  const linkedObjects = data.model.data.children ? data.model.data.children.map(item => data.model.nodes[item]) : [];

  return (
    <>
      {linkedObjects.map((linkedObject: any, index: number) => (
        <div key={linkedObject.id} className="p-4 relative group">
          <ArticleOverlay key={linkedObject.id} id={linkedObject.id}>
            <Link className="no-underline" href={linkedObjects[`${index}`].url}>
              <div className="p-4 bg-gray-100 rounded-lg shadow-md">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-6 h-6 text-gray-500"
                    focusable="false"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    data-testid="CircleIcon"
                  >
                    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2z"></path>
                  </svg>
                </div>
                <h6 className="mt-2 text-lg font-semibold text-gray-900">{linkedObject.title}</h6>
              </div>
            </Link>
          </ArticleOverlay>
        </div>
      ))}
    </>
  );
};

export default DefaultSectionItemsRenderer;
