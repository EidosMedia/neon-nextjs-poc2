'use client';

import Link from 'next/link';
import React from 'react';
import { getTeaserOrMainImageUrl } from '@/app/components/contentElements/MainImage';

type ArticleOrganismProps = {
  data: any;
  linkedObject: any;
  linkedObjects: any;
  index: number;
  type: string;
};

const ArticleOrganism: React.FC<ArticleOrganismProps> = ({
  linkedObject,
  linkedObjects,
  index,
}) => {
  React.useEffect(() => {
    console.log('[NEON] mount: business-globe/ArticleOrganism');
  }, []);

  const url = linkedObject.url || linkedObjects[`${index}`]?.url || '#';
  const title = linkedObject.attributes?.teaser?.title ?? linkedObject.title ?? '';
  const overhead = linkedObject.attributes?.overhead as string | undefined;
  const tag = overhead || (url.split('/')[1] ?? '').toUpperCase();

  const thumbUrl = getTeaserOrMainImageUrl(linkedObject, 'Square_large');

  return (
    <Link id={linkedObject.id.replaceAll('-', '_')} href={url} className="bgl-pick-card">
      {thumbUrl ? (
        <img src={thumbUrl} alt="" aria-hidden="true" className="bgl-pick-thumb" />
      ) : (
        <div className="bgl-pick-thumb" />
      )}
      <div>
        {tag && <div className="bgl-tag" style={{ marginBottom: '0.15rem' }}>{tag}</div>}
        <div className="bgl-pick-title">{title}</div>
      </div>
    </Link>
  );
};

export default ArticleOrganism;
