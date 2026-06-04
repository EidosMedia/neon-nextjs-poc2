'use client';

import Link from 'next/link';
import ArticleOverlay from '../../../components/base/ArticleOverlay';
import ContentEditable from '../../../components/utilities/ContentEditable';
import useLoggedUserInfo from '@/hooks/useLoggedUserInfo';
import React from 'react';

type ArticleOrganismProps = {
  data: any;
  linkedObject: any;
  linkedObjects: any;
  index: number;
  type: string;
};

// importance: 0–9 from linkedObject.pubInfo.importance
const IMPORTANCE_LABEL: Record<number, string> = {
  0: 'No Priority',
  1: 'Minor',
  2: 'Lowest',
  3: 'Low',
  4: 'Medium',
  5: 'High',
  6: 'Highest',
  7: 'Major',
  8: 'Critical',
  9: 'Breaking News',
};

const IMPORTANCE_CLASS: Record<number, string> = {
  0: 'wire-priority--minor',
  1: 'wire-priority--minor',
  2: 'wire-priority--normal',
  3: 'wire-priority--normal',
  4: 'wire-priority--normal',
  5: 'wire-priority--flash',
  6: 'wire-priority--flash',
  7: 'wire-priority--urgent',
  8: 'wire-priority--urgent',
  9: 'wire-priority--breaking',
};

const extractSectionFromUrl = (url: string): string => url.split('/')[1] ?? '';

const ArticleOrganism: React.FC<ArticleOrganismProps> = ({ data, linkedObject, linkedObjects, index, type }) => {
  React.useEffect(() => { console.log('[NEON] mount: wire/ArticleOrganism'); }, []);

  const { data: loggedUserInfo } = useLoggedUserInfo();
  const url = linkedObject.url || linkedObjects[`${index}`]?.url;
  const overhead = linkedObject.attributes?.overhead || linkedObject.overhead || extractSectionFromUrl(url);
  const importance: number = linkedObject.pubInfo?.importance ?? 4;
  const priorityLabel = IMPORTANCE_LABEL[importance] ?? IMPORTANCE_LABEL[4];
  const priorityClass = IMPORTANCE_CLASS[importance] ?? IMPORTANCE_CLASS[4];

  const title = linkedObject.attributes?.teaser?.title ?? linkedObject.title;
  const summary = linkedObject.attributes?.teaser?.summary ?? linkedObject.summary;
  const wordCount = linkedObject.attributes?.wordCount;
  const lockedBy = data?.sys?.lockedBy?.userId === 'CollaborationEditor' ? null : data?.sys?.lockedBy;

  const isLead = index === 0;

  return (
    <ArticleOverlay data={linkedObject} viewStatus={data.siteData.viewStatus} width="max" data-type={type}>
      <Link
        id={linkedObject.id.replaceAll('-', '_')}
        className="no-underline"
        href={loggedUserInfo.inspectItems ? '' : url}
      >
        <div
          className="flex items-start gap-3 px-4 py-3 border-b border-[#E8E8E8] hover:bg-[#F5F8FF] transition-colors"
          style={{ fontFamily: 'var(--font-meta)' }}
        >
          {/* Priority badge */}
          <span
            className={`${priorityClass} shrink-0 mt-0.5`}
            style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', padding: '2px 5px' }}
          >
            {priorityLabel}
          </span>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {overhead && (
              <span
                style={{
                  fontFamily: 'var(--font-meta)',
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#0050FF',
                  display: 'block',
                  marginBottom: 2,
                }}
              >
                {overhead}
              </span>
            )}

            <ContentEditable
              showLockedByTooltip={lockedBy}
              viewStatus={data.siteData.viewStatus}
              data={linkedObject}
              minimal
            >
              <p
                style={{
                  fontFamily: isLead ? 'var(--font-headline)' : 'var(--font-meta)',
                  fontSize: isLead ? 15 : 13,
                  fontWeight: isLead ? 700 : 600,
                  lineHeight: 1.35,
                  color: '#0A0A0A',
                  margin: 0,
                }}
                data-type="title"
              >
                {title}
              </p>
            </ContentEditable>

            {isLead && summary && (
              <ContentEditable
                showLockedByTooltip={lockedBy}
                viewStatus={data.siteData.viewStatus}
                data={linkedObject}
                minimal
              >
                <p
                  style={{
                    fontFamily: 'var(--font-meta)',
                    fontSize: 11,
                    color: '#4B4B4B',
                    marginTop: 4,
                    lineHeight: 1.5,
                  }}
                  data-type="summary"
                >
                  {summary}
                </p>
              </ContentEditable>
            )}
          </div>

          {/* Right metadata column */}
          <div
            className="shrink-0 text-right hidden sm:flex flex-col gap-0.5"
            style={{ fontFamily: 'var(--font-meta)', fontSize: 9, color: '#6B6B6B', minWidth: 60 }}
          >
            {linkedObject.author && <span>{linkedObject.author}</span>}
            {wordCount && <span>{wordCount}w</span>}
          </div>
        </div>
      </Link>
    </ArticleOverlay>
  );
};

export default ArticleOrganism;
