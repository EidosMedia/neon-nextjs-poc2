import Link from 'next/link';
import ArticleOverlay from '../../ArticleOverlay';
import MainImage from '@/app/components/contentElements/MainImage';
import ContentEditable from '@/app/components/utilities/ContentEditable';
import useLoggedUserInfo from '@/hooks/useLoggedUserInfo';
import React from 'react';

type ArticleHeroProps = {
  data: any;
  linkedObject: any;
};

const extractSectionFromUrl = (url: string): string => url.split('/')[1];

const ArticleHero: React.FC<ArticleHeroProps> = ({ data, linkedObject }) => {
  const { data: loggedUserInfo } = useLoggedUserInfo();
  const url = linkedObject.url;

  const overhead = linkedObject.attributes?.overhead || linkedObject.overhead || extractSectionFromUrl(url);
  
  const titleId = linkedObject.attributes?.contentIds?.teaserTitle;
  const title = linkedObject.attributes?.teaser?.title || linkedObject.title;
  const summaryId = linkedObject.attributes?.contentIds?.teaserSummary;
  const summary = linkedObject.attributes?.teaser?.summary || linkedObject.summary;

  return (
    <ArticleOverlay data={linkedObject} viewStatus={data.siteData.viewStatus} width="max" data-type="article-hero">
      <Link
        id={linkedObject.id.replaceAll('-', '_')}
        className="no-underline"
        href={loggedUserInfo.inspectItems ? '' : url}
      >
        <div className="relative w-full h-[60vh] min-h-[400px] max-h-[500px] overflow-hidden group">
          {/* Background Image */}
          <div className="absolute inset-0">
            <MainImage data={linkedObject} format="Ultrawide_large" hideCaptions />
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

          {/* Content Overlay */}
          <div className="absolute inset-0 flex items-end">
            <div className="container mx-auto px-8 pb-12 max-w-7xl">
              <div className="text-white max-w-4xl">
                {/* Section */}
                <span className="subhead1 uppercase text-gray-200 mb-3 inline-block" data-type="overhead">
                  {overhead}
                </span>

                {/* Title */}
                <ContentEditable
                  showLockedByTooltip={linkedObject.sys?.lockedBy}
                  viewStatus={data.siteData.viewStatus}
                  data={linkedObject}
                  minimal
                >
                  <h1
                    className="text-5xl font-bold leading-tight mb-4 text-white group-hover:text-gray-100 transition-colors"
                    id={titleId}
                    data-type="title"
                  >
                    {title}
                  </h1>
                </ContentEditable>

                {/* Summary */}
                <ContentEditable
                  showLockedByTooltip={linkedObject.sys?.lockedBy}
                  viewStatus={data.siteData.viewStatus}
                  data={linkedObject}
                  minimal
                >
                  <p className="text-xl leading-relaxed text-gray-200 mb-3" id={summaryId} data-type="summary">
                    {summary}
                  </p>
                </ContentEditable>

                {/* Author */}
                {linkedObject.author && <span className="text-base text-gray-300">{linkedObject.author}</span>}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </ArticleOverlay>
  );
};

export default ArticleHero;
