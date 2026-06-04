import Link from 'next/link';
import ArticleOverlay from '../../ArticleOverlay';
import MainImage from '@/app/components/contentElements/MainImage';
import ContentEditable from '@/app/components/utilities/ContentEditable';
import useLoggedUserInfo from '@/hooks/useLoggedUserInfo';
import React from 'react';

type ArticleOrganismProps = {
  data: any; // Adjust type as needed
  linkedObject: any; // Adjust type as needed
  linkedObjects: any; // Adjust type as needed
  index: number;
  type: string;
};

const extractSectionFromUrl = (url: string): string => url.split('/')[1];

const getArticleClasses = (type: string) => {
  // Centralized breakpoint values (for reference only - must be hardcoded in Tailwind classes)
  // BREAKPOINT_TABLET = 992px
  // BREAKPOINT_MOBILE = 576px

  const classMap: Record<string, {
    container: string;
    textColumn: string;
    imageColumn: string;
    section: string;
  }> = {
    // article-xl: Desktop 5-7, Tablet 5-7, Mobile 12-12
    'article-xl': {
      container: 'gap-4 max-[576px]:gap-3',
      textColumn: 'col-span-5 max-[1024px]:col-span-12 max-[1024px]:order-1',
      imageColumn: 'col-span-7 max-[1024px]:col-span-12 max-[1024px]:order-2 max-[1024px]:justify-start',
      section: 'mt-2 max-[1024px]:mt-0',
    },
    // article-lg: Desktop 12-12, Tablet 12-12, Mobile 12-12 (full width always)
    'article-lg': {
      container: 'gap-4',
      textColumn: 'col-span-12 order-2',
      imageColumn: 'col-span-12 order-1 justify-start',
      section: 'mt-2',
    },
    // article-md: Desktop 5-7, Tablet 6-6, Mobile 12-12
    'article-md': {
      container: 'gap-3 max-[1024px]:gap-2',
      textColumn: 'col-span-5 max-[1024px]:col-span-6 max-[1024px]:col-span-12 max-[1024px]:order-1',
      imageColumn: 'col-span-7 max-[1024px]:col-span-6 max-[1024px]:col-span-12 max-[1024px]:order-2 max-[1024px]:justify-start',
      section: 'mt-2 max-[1024px]:mt-0',
    },
    // article-sm: Desktop 12-12, Tablet 12-12, Mobile 12-12 (full width always)
    'article-sm': {
      container: 'gap-2',
      textColumn: 'col-span-12 order-2',
      imageColumn: 'col-span-12 order-1 justify-start',
      section: 'mt-1',
    },
    // article-xs: Desktop 9-3, Tablet 9-3, Mobile 9-3 (stays same at all breakpoints)
    'article-xs': {
      container: 'gap-2',
      textColumn: 'col-span-9 order-1',
      imageColumn: 'col-span-3 order-2 justify-end',
      section: 'mt-1',
    },
  };

  return classMap[type] || classMap['article-md']; // fallback to article-md if type not found
};

const ArticleOrganism: React.FC<ArticleOrganismProps> = ({ data, linkedObject, linkedObjects, index, type }) => {
  console.log('[NEON] render: ArticleOrganism');
  //console.log('ArticleOrganism Props:', { linkedObject, linkedObjects, index, type });
  console.log('linkedObject ID:', linkedObject?.id);
  
  const TitleComponent = type === 'article-xl' ? 'h1' : 'h2';
  const { data: loggedUserInfo } = useLoggedUserInfo();
  const url = linkedObject.url || linkedObjects[`${index}`].url;

  const overhead = linkedObject.attributes?.overhead || linkedObject.overhead || extractSectionFromUrl(url);

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
            <span className={`subhead1 uppercase ${classes.section}`} data-type="section">
              {overhead}
            </span>
            <ContentEditable
              showLockedByTooltip={lockedBy}
              viewStatus={data.siteData.viewStatus}
              data={linkedObject}
              minimal
            >
              <TitleComponent className="mt-2" id={titleId} data-type="title">
                <p>{title}</p>
              </TitleComponent>
            </ContentEditable>
            <ContentEditable
              showLockedByTooltip={lockedBy}
              viewStatus={data.siteData.viewStatus}
              data={linkedObject}
              minimal
            >
              <span className="mt-2" id={summaryId} data-type="summary">
                <p>{summary}</p>
              </span>
            </ContentEditable>
            <span className="mt-2">{linkedObject.author}</span>
          </div>
          <div className={`flex justify-end items-end ${classes.imageColumn}`}>
            <MainImage data={linkedObject} format="Wide_small" hideCaptions />
          </div>
        </div>
      </Link>
    </ArticleOverlay>
  );
};

export default ArticleOrganism;
