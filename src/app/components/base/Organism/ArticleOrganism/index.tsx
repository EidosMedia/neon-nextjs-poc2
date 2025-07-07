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

const ArticleOrganism: React.FC<ArticleOrganismProps> = ({ data, linkedObject, linkedObjects, index, type }) => {
  const TitleComponent = type === 'article-xl' ? 'h1' : 'h2';
  const { data: loggedUserInfo } = useLoggedUserInfo();
  const url = linkedObject.url || linkedObjects[`${index}`].url;
  const titleId = linkedObject.attributes?.contentIds?.teaserTitle;
  const summaryId = linkedObject.attributes?.contentIds?.teaserSummary;

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

  return (
    <ArticleOverlay data={linkedObject} viewStatus={data.siteData.viewStatus} width="max" data-type={type}>
      <Link className="no-underline" href={loggedUserInfo.inspectItems ? '' : url}>
        <div className="p-4 grid grid-cols-12">
          <div className="flex flex-col col-span-5">
            <span className="mt-2 subhead1 uppercase">{extractSectionFromUrl(url)}</span>
            <ContentEditable showLockedByTooltip={linkedObject.sys?.lockedBy} viewStatus={data.siteData.viewStatus} data={linkedObject}>
              <TitleComponent className="mt-2 " id={titleId}>
                <p>{title}</p>
              </TitleComponent>
            </ContentEditable>
            <ContentEditable showLockedByTooltip={linkedObject.sys?.lockedBy} viewStatus={data.siteData.viewStatus} data={linkedObject}>
              <span className="mt-2" id={summaryId}>
                <p>{summary}</p>
              </span>
            </ContentEditable>
            <span className="mt-2">{linkedObject.author}</span>
          </div>
          <div className="col-span-7 flex justify-end items-end">
            <MainImage data={linkedObject} format="Wide_small" hideCaptions />
          </div>
        </div>
      </Link>
    </ArticleOverlay>
  );
};

export default ArticleOrganism;
