'use client';

import React from 'react';
import { PageData, WebpageModel, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import ArticleOrganism from './base/Organism/ArticleOrganism';
import ArticleHero from './base/Organism/ArticleHero';
import { itemShape, zoneAccessoryClass, type ZoneAccessoryShapes } from '@/lib/accessories/shapeClasses';

type ArticleWebpageWithHeroProps = {
  data: PageData<WebpageModel>;
  displayMainPicture: boolean;
  linkedObjects: WebpageNodeModel[];
  accessories?: ZoneAccessoryShapes;
};

const ArticleWebpageWithHero: React.FC<ArticleWebpageWithHeroProps> = ({
  data,
  displayMainPicture,
  linkedObjects,
  accessories,
}) => {
  // Se non ci sono articoli, non renderizzare nulla
  if (!linkedObjects || linkedObjects.length === 0) {
    return null;
  }

  // Primo articolo come hero
  const heroArticle = linkedObjects[0];
  // Resto degli articoli
  const remainingArticles = linkedObjects.slice(1);

  const content = (
    <>
      {/* Hero Article */}
      <ArticleHero
        data={data}
        linkedObject={heroArticle}
        accessoryShape={itemShape(accessories?.zone, accessories?.links?.[0])}
      />

      {/* Remaining Articles */}
      {remainingArticles.map((linkedObject: any, index: number) => {
        return (
          <ArticleOrganism
            key={linkedObject.id}
            data={data}
            linkedObject={linkedObject}
            linkedObjects={linkedObjects}
            index={index + 1} // +1 perché il primo è l'hero
            type="article-md"
            accessoryShape={itemShape(accessories?.zone, accessories?.links?.[index + 1])}
          />
        );
      })}
    </>
  );

  const zoneClass = zoneAccessoryClass(accessories?.zone);
  return zoneClass ? <div className={zoneClass}>{content}</div> : content;
};

export default ArticleWebpageWithHero;
