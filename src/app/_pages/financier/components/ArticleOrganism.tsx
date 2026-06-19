'use client';

import Link from 'next/link';
import ArticleOverlay from '../../../components/base/ArticleOverlay';
import ContentEditable from '../../../components/utilities/ContentEditable';
import MainImage from '../../../components/contentElements/MainImage';
import useLoggedUserInfo from '@/hooks/useLoggedUserInfo';
import { LockIcon } from 'lucide-react';
import React from 'react';

type ArticleOrganismProps = {
  data: any;
  linkedObject: any;
  linkedObjects: any;
  index: number;
  type: string;
  imageFormat?: string;
};

const extractSectionFromUrl = (url: string): string => url.split('/')[1];

const getArticleClasses = (type: string) => {
  const classMap: Record<string, {
    container: string;
    textColumn: string;
    imageColumn: string;
    section: string;
  }> = {
    'article-xl': {
      container: 'gap-4 max-[576px]:gap-3',
      textColumn: 'col-span-5 max-[1024px]:col-span-12 max-[1024px]:order-1',
      imageColumn: 'col-span-7 max-[1024px]:col-span-12 max-[1024px]:order-2 max-[1024px]:justify-start',
      section: 'mt-2 max-[1024px]:mt-0',
    },
    'article-lg': {
      container: 'gap-4',
      textColumn: 'col-span-12 order-2',
      imageColumn: 'col-span-12 order-1 justify-start',
      section: 'mt-2',
    },
    'article-md': {
      container: 'gap-3 max-[1024px]:gap-2',
      textColumn: 'col-span-5 max-[1024px]:col-span-6 max-[1024px]:col-span-12 max-[1024px]:order-1',
      imageColumn: 'col-span-7 max-[1024px]:col-span-6 max-[1024px]:col-span-12 max-[1024px]:order-2 max-[1024px]:justify-start',
      section: 'mt-2 max-[1024px]:mt-0',
    },
    'article-sm': {
      container: 'gap-2',
      textColumn: 'col-span-12 order-2',
      imageColumn: 'col-span-12 order-1 justify-start',
      section: 'mt-1',
    },
    'article-xs': {
      container: 'gap-2',
      textColumn: 'col-span-9 order-1',
      imageColumn: 'col-span-3 order-2 justify-end',
      section: 'mt-1',
    },
  };

  return classMap[type] || classMap['article-md'];
};

const ArticleOrganism: React.FC<ArticleOrganismProps> = ({ data, linkedObject, linkedObjects, index, type, imageFormat = 'Wide_small' }) => {
  console.log('[NEON] render: financier/ArticleOrganism');

  const TitleComponent = type === 'article-xl' ? 'h1' : 'h2';
  const { data: loggedUserInfo } = useLoggedUserInfo();
  const url = linkedObject.url || linkedObjects[`${index}`].url;

  const overhead = linkedObject.attributes?.overhead || linkedObject.overhead || extractSectionFromUrl(url);
  const isPremium = !!linkedObject.pubInfo?.paywallLevel;

  const titleId = linkedObject.attributes?.contentIds?.teaserTitle;
  const summaryId = linkedObject.attributes?.contentIds?.teaserSummary;
  const classes = getArticleClasses(type);

  var title, summary;
  if (linkedObject.attributes?.teaser?.title) {
    title = linkedObject.attributes?.teaser?.title;
  } else {
    title = linkedObject.title;
  }
  if (linkedObject.attributes?.teaser?.summary) {
    summary = linkedObject.attributes?.teaser?.summary;
  } else {
    summary = linkedObject.summary;
  }

  const lockedBy = data?.sys?.lockedBy?.userId === 'CollaborationEditor' ? null : data?.sys?.lockedBy;

  return (
    <ArticleOverlay data={linkedObject} viewStatus={data.siteData.viewStatus} width="max" data-type={type}>
      <Link
        id={linkedObject.id.replaceAll('-', '_')}
        className="no-underline"
        href={loggedUserInfo.inspectItems ? '' : url}
      >
        <div className={`p-4 grid grid-cols-12 ${classes.container}`}>
          <div className={`flex flex-col ${classes.textColumn}`}>
            <div className={`flex items-center gap-2 ${classes.section}`}>
              <span className="financier-eyebrow uppercase" data-type="section">
                {overhead}
              </span>
              {isPremium && (
                <span className="financier-premium-badge" data-type="premium-badge">
                  <LockIcon className="w-2.5 h-2.5" />
                  Premium
                </span>
              )}
            </div>
            <ContentEditable
              showLockedByTooltip={lockedBy}
              viewStatus={data.siteData.viewStatus}
              data={linkedObject}
              minimal
            >
              <TitleComponent className="py-2" id={titleId} data-type="title">
                <p>{title}</p>
              </TitleComponent>
            </ContentEditable>
            <ContentEditable
              showLockedByTooltip={lockedBy}
              viewStatus={data.siteData.viewStatus}
              data={linkedObject}
              minimal
            >
              <div className="py-4" id={summaryId} data-type="summary">
                <p>{summary}</p>
              </div>
            </ContentEditable>
            <div className="py-2">{linkedObject.author}</div>
          </div>
          <div className={`flex justify-end items-end ${classes.imageColumn}`}>
            <MainImage data={linkedObject} format={imageFormat} hideCaptions />
          </div>
        </div>
      </Link>
    </ArticleOverlay>
  );
};

export default ArticleOrganism;
