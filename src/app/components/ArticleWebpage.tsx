'use client';

import React from 'react';
import { PageData, WebpageModel, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import ArticleOrganism from './base/Organism/ArticleOrganism';
import LiveblogOrganism from './base/Organism/LiveblogOrganism';
import { itemShape, zoneAccessoryClass, type ZoneAccessoryShapes } from '@/lib/accessories/shapeClasses';

type ArticleWepageProps = {
  data: PageData<WebpageModel>;
  displayMainPicture: boolean;
  linkedObjects: WebpageNodeModel[];
  imageFormat?: string;
  accessories?: ZoneAccessoryShapes;
};

const ArticleWebpage: React.FC<ArticleWepageProps> = ({
  data,
  displayMainPicture,
  linkedObjects,
  imageFormat,
  accessories,
}) => {
  const items = (
    <>
      {linkedObjects.map((linkedObject: any, index: number) => {
        const type = index === 0 ? 'article-xl' : 'article-md';
        const accessoryShape = itemShape(accessories?.zone, accessories?.links?.[index]);
        return linkedObject.sys?.baseType === 'liveblog' ? (
          <LiveblogOrganism
            key={linkedObject.id}
            data={data}
            linkedObject={linkedObject}
            linkedObjects={linkedObjects}
            index={index}
            type={type}
            imageFormat={imageFormat}
            accessoryShape={accessoryShape}
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
            accessoryShape={accessoryShape}
          />
        );
      })}
    </>
  );

  const zoneClass = zoneAccessoryClass(accessories?.zone);
  return zoneClass ? <div className={zoneClass}>{items}</div> : items;
};

export default ArticleWebpage;
