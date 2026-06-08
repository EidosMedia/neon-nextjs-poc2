import Link from 'next/link';
import ArticleOverlay from '../../ArticleOverlay';
import MainImage from '@/app/components/contentElements/MainImage';
import ContentEditable from '@/app/components/utilities/ContentEditable';
import LiveblogOrganismPosts from './LiveblogOrganismPosts';
import { CircleDot } from 'lucide-react';
import { headers } from 'next/headers';
import { getAuthOptions } from '@/utilities/security';
import React from 'react';

type LiveblogOrganismProps = {
  data: any;
  linkedObject: any;
  linkedObjects: any;
  index: number;
  type: string;
  imageFormat?: string;
};

const extractSectionFromUrl = (url: string): string => url.split('/')[1];

const LiveblogOrganism = async ({ data, linkedObject, linkedObjects, index, type, imageFormat = 'Wide_small' }: LiveblogOrganismProps) => {
  const url = linkedObject.url || linkedObjects[`${index}`].url;
  const overhead = linkedObject.attributes?.overhead || linkedObject.overhead || extractSectionFromUrl(url);
  const titleId = linkedObject.attributes?.contentIds?.teaserTitle;
  const summaryId = linkedObject.attributes?.contentIds?.teaserSummary;

  var title, summary;
  if (linkedObject.attributes?.teaser?.title) { title = linkedObject.attributes?.teaser?.title; } else { title = linkedObject.title; }
  if (linkedObject.attributes?.teaser?.summary) { summary = linkedObject.attributes?.teaser?.summary; } else { summary = linkedObject.summary; }

  const lockedBy = data?.sys?.lockedBy?.userId === 'CollaborationEditor' ? null : data?.sys?.lockedBy;

  const currentHeaders = await headers();
  const apiHostname = currentHeaders.get('x-neon-backend-url') ?? '';
  const auth = await getAuthOptions();
  const posts = await connection.getLiveBlogsPosts({ apiHostname, id: linkedObject.id, searchParams: new URLSearchParams(), auth });

  return (
    <ArticleOverlay data={linkedObject} viewStatus={data.siteData.viewStatus} width="max" data-type={type}>
      <Link id={linkedObject.id.replaceAll('-', '_')} className="no-underline" href={url}>
        <div className={`p-4 grid grid-cols-12 gap-4`}>
          <div className="flex flex-col col-span-5 max-[1024px]:col-span-12">
            <span className="subhead1 uppercase mt-2" data-type="section">{overhead}</span>
            <div className="flex items-center gap-1 mt-2 w-fit max-h-[30px] p-2 rounded-xs bg-feedback-red text-neutral-lightest">
              <CircleDot className="w-4 h-4" />
              <span className="subhead1 pt-[3px]">Live</span>
            </div>
            <ContentEditable showLockedByTooltip={lockedBy} viewStatus={data.siteData.viewStatus} data={linkedObject} minimal>
              <h2 className="mt-2" id={titleId} data-type="title"><p>{title}</p></h2>
            </ContentEditable>
            <ContentEditable showLockedByTooltip={lockedBy} viewStatus={data.siteData.viewStatus} data={linkedObject} minimal>
              <span className="mt-2" id={summaryId} data-type="summary"><p>{summary}</p></span>
            </ContentEditable>
            <span className="mt-2">{linkedObject.author}</span>
            <div className="mt-4">
              <LiveblogOrganismPosts liveblogId={linkedObject.id} initialPosts={posts} />
            </div>
          </div>
          <div className="flex justify-end items-end col-span-7 max-[1024px]:col-span-12">
            <MainImage data={linkedObject} format={imageFormat} hideCaptions />
          </div>
        </div>
      </Link>
    </ArticleOverlay>
  );
};
export default LiveblogOrganism;
