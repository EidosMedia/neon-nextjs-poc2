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

function getCategoryColor(tag: string): string {
  const t = tag.toLowerCase();
  if (t.includes('tech') || t.includes('hardware') || t.includes('software')) return 'nf-badge--tech';
  if (t.includes('ai') || t.includes('ml') || t.includes('machine')) return 'nf-badge--ai';
  if (t.includes('sci') || t.includes('space') || t.includes('health')) return 'nf-badge--science';
  if (t.includes('review') || t.includes('test') || t.includes('rating')) return 'nf-badge--review';
  if (t.includes('polic') || t.includes('law') || t.includes('gov') || t.includes('legal')) return 'nf-badge--policy';
  return '';
}

function formatTimeAgo(isoDate: string): string {
  const mins = Math.round((Date.now() - new Date(isoDate).getTime()) / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

const ArticleOrganism: React.FC<ArticleOrganismProps> = ({
  linkedObject,
  linkedObjects,
  index,
  type,
}) => {
  React.useEffect(() => {
    console.log('[NEON] mount: nextfrontier/ArticleOrganism');
  }, []);

  const url = linkedObject.url || linkedObjects[`${index}`]?.url || '#';
  const title = linkedObject.attributes?.teaser?.title ?? linkedObject.title ?? '';
  const overhead = linkedObject.attributes?.overhead as string | undefined;
  const tag = overhead || (url.split('/')[1] ?? '').toUpperCase();
  const pubDate: string | undefined = linkedObject.pubInfo?.pubDate;

  const teaserImage = linkedObject.attributes?.teaser?.image;
  const thumbUrl: string | undefined =
    teaserImage?.elements?.find((el: any) => el.nodeType === 'image')?.attributes?.src ??
    teaserImage?.elements?.[0]?.attributes?.src;

  const badgeClass = getCategoryColor(tag);

  // Sidebar mode: horizontal thumb + title
  if (type === 'sidebar') {
    return (
      <Link id={linkedObject.id.replaceAll('-', '_')} href={url} className="nf-sidebar-item">
        {thumbUrl ? (
          <img src={thumbUrl} alt="" aria-hidden="true" className="nf-sidebar-thumb" />
        ) : (
          <div className="nf-sidebar-thumb" />
        )}
        <div className="nf-sidebar-title">{title}</div>
      </Link>
    );
  }

  // Category row card mode
  return (
    <Link id={linkedObject.id.replaceAll('-', '_')} href={url} className="nf-card">
      {thumbUrl ? (
        <img src={thumbUrl} alt={title} className="nf-card-img" />
      ) : (
        <div className="nf-card-img" />
      )}
      {tag && <span className={`nf-badge ${badgeClass}`}>{tag}</span>}
      <div className="nf-card-title">{title}</div>
      {pubDate && <div className="nf-card-meta">{formatTimeAgo(pubDate)}</div>}
    </Link>
  );
};

export default ArticleOrganism;
