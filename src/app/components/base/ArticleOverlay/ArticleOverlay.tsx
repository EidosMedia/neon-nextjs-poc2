'use client';
import React, { useEffect, useState, FC } from 'react';
import { SiteNode } from '@eidosmedia/neon-frontoffice-ts-sdk';
import ArticleActions from './components/ArticleActions';
import useLoggedUserInfo from '@/hooks/useLoggedUserInfo';

interface OverlayProps {
  data: SiteNode;
  viewStatus: string;
  showOverlay?: boolean;
  width?: 'normal' | 'max';
  children: React.ReactNode;
}
export type OverlayDataObj = {
  id: string;
  title: string;
  authors: string[];
  pubInfo: {
    priority?: number;
    publicationTime: string;
  };
  sys?: Record<string, any>;
};

export const priorityOptions = [
  {
    value: 0,
    content: 'No priority',
    icon: 'swing-icon-priority-no',
  },
  {
    value: 1,
    content: 'Minor',
    icon: 'swing-icon-priority-minor',
  },
  {
    value: 2,
    content: 'Lowest',
    icon: 'swing-icon-priority-lowest',
  },
  {
    value: 3,
    content: 'Low',
    icon: 'swing-icon-priority-low',
  },
  {
    value: 4,
    content: 'Medium',
    icon: 'swing-icon-priority-medium',
  },
  {
    value: 5,
    content: 'High',
    icon: 'swing-icon-priority-high',
  },
  {
    value: 6,
    content: 'Highest',
    icon: 'swing-icon-priority-highest',
  },
  {
    value: 7,
    content: 'Major',
    icon: 'swing-icon-priority-major',
  },
  {
    value: 8,
    content: 'Critical',
    icon: 'swing-icon-priority-critical',
  },
  {
    value: 9,
    content: 'Breaking news',
    icon: 'swing-icon-priority-breaking-news',
  },
];

const ArticleOverlay: FC<OverlayProps> = ({ data, viewStatus, width = 'normal', children }) => {
  const [overlayData, setOverlayData] = useState<OverlayDataObj>();
  const [objectNotFound, setObjectNotFound] = useState(false);

  const { data: loggedUserInfo } = useLoggedUserInfo();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/nodes/${data.id}`);
        if (response.ok) {
          const data = await response.json();

          const overlayObj: OverlayDataObj = {
            id: data.model.data.id,
            title: data.model.data.title,
            authors: data.model.data.authors || [],
            pubInfo: {
              priority: data.model.data.pubInfo?.priority,
              publicationTime: data.model.data.pubInfo?.publicationTime,
            },
          };

          setOverlayData(overlayObj);
        } else {
          console.error('Failed to fetch overlay data');
          setObjectNotFound(true);
        }
      } catch (error) {
        console.error('Error fetching overlay data:', error);
      }
    };

    fetchData();
  }, [data.id]);

  if (objectNotFound) {
    return null;
  }

  return (
    <>
      {loggedUserInfo.inspectItems && overlayData ? (
        <div className="border border-transparent hover:border-gray-700 relative group">
          <ArticleActions data={data} viewStatus={viewStatus} overlayData={overlayData} width={width} />
          {children}
        </div>
      ) : (
        children
      )}
    </>
  );
};

export default ArticleOverlay;
