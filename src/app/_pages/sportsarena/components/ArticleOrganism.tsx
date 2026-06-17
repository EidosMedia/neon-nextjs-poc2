'use client';

import Link from 'next/link';
import React from 'react';

type ArticleOrganismProps = {
  data: any;
  linkedObject: any;
  linkedObjects: any;
  index: number;
  type: string;
};

const extractSport = (url: string): string =>
  (url.split('/')[1] ?? '').toUpperCase();

const formatTimeAgo = (isoDate: string): string => {
  const mins = Math.round((Date.now() - new Date(isoDate).getTime()) / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
};

const ArticleOrganism: React.FC<ArticleOrganismProps> = ({
  data,
  linkedObject,
  linkedObjects,
  index,
  type,
}) => {
  React.useEffect(() => {
    console.log('[NEON] mount: sportsarena/ArticleOrganism');
  }, []);

  const url = linkedObject.url || linkedObjects[`${index}`]?.url || '#';
  const title = linkedObject.attributes?.teaser?.title ?? linkedObject.title ?? '';
  const sport =
    (linkedObject.attributes?.overhead as string | undefined) || extractSport(url);
  const pubDate: string | undefined = linkedObject.pubInfo?.pubDate;

  // Resolve a thumbnail URL from the teaser image ContentElement if available.
  // The SDK stores crop URLs in `elements[].attributes.src` inside the image ContentElement.
  const teaserImage = linkedObject.attributes?.teaser?.image;
  const thumbUrl: string | undefined =
    teaserImage?.elements?.find(
      (el: any) => el.nodeType === 'image',
    )?.attributes?.src ?? teaserImage?.elements?.[0]?.attributes?.src;

  return (
    <Link id={linkedObject.id.replaceAll('-', '_')} href={url} className="sa-card block">
      {/* Thumbnail */}
      <div className="sa-card-img">
        {thumbUrl ? (
          <img src={thumbUrl} alt="" aria-hidden="true" />
        ) : (
          <div className="w-full h-full" style={{ background: '#2a2a2a' }} />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        {sport && <div className="sa-card-sport">{sport}</div>}
        <div className="sa-card-title">{title}</div>
        {pubDate && (
          <div className="sa-card-meta">{formatTimeAgo(pubDate)}</div>
        )}
      </div>
    </Link>
  );
};

export default ArticleOrganism;
