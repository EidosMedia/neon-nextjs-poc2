'use client';

import React from 'react';
import { PageData, WebpageModel, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import ArticleOrganism from './base/Organism/ArticleOrganism';
import ArticleHero from './base/Organism/ArticleHero';

type ArticleWebpageWithHeroProps = {
  data: PageData<WebpageModel>;
  displayMainPicture: boolean;
  linkedObjects: WebpageNodeModel[];
};

const ArticleWebpageWithHero: React.FC<ArticleWebpageWithHeroProps> = ({
  data,
  displayMainPicture,
  linkedObjects,
}) => {
  // Se non ci sono articoli, non renderizzare nulla
  if (!linkedObjects || linkedObjects.length === 0) {
    return null;
  }

  // Primo articolo come hero
  const heroArticle = linkedObjects[0];
  // Resto degli articoli
  const remainingArticles = linkedObjects.slice(1);

  return (
    <>
      {/* Hero Article */}
      <ArticleHero data={data} linkedObject={heroArticle} />

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
          />
        );
      })}
    </>
  );
};

export default ArticleWebpageWithHero;
