'use client';
import React from 'react';
import { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import ArticleOrganism from './base/Organism/ArticleOrganism';

type DefaultSectionItemsRendererProps = {
  data: PageData<BaseModel>;
};

const DefaultSectionItemsRenderer: React.FC<DefaultSectionItemsRendererProps> = ({ data }) => {
  const linkedObjects = data.model.data.children ? data.model.data.children.map(item => data.model.nodes[item]) : [];

  console.log('DefaultSectionItemsRenderer length', linkedObjects);

  if (linkedObjects.length === 0) {
    return <div className="container mx-auto flex align-center justify-center">No articles found.</div>;
  }

  return (
    <>
      <ArticleOrganism
        linkedObjects={linkedObjects}
        linkedObject={linkedObjects.pop()}
        index={0}
        data={data}
        type="article-xl"
      />
      <div className="grid grid-cols-12">
        <div className="col-span-8">
          {linkedObjects.map((linkedObject: any, index: number) => (
            <div key={linkedObject.id} className="relative group">
              <ArticleOrganism
                linkedObject={linkedObject}
                linkedObjects={linkedObjects}
                index={index}
                data={data}
                type="article-md"
              />
            </div>
          ))}
        </div>
        <div className="col-span-4"></div>
      </div>
    </>
  );
};

export default DefaultSectionItemsRenderer;
