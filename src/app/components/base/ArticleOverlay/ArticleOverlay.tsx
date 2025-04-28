'use client';
import React, { useEffect, useState, FC } from 'react';
import { SiteNode } from '@eidosmedia/neon-frontoffice-ts-sdk';
import ArticleActions from './components/ArticleActions';
import useAuth from '@/hooks/useAuth';
import useLoggedUserInfo from '@/hooks/useLoggedUserInfo';

interface OverlayProps {
  data: SiteNode;
  viewStatus: string;
  showOverlay?: boolean;
  children: React.ReactNode;
}
interface OverlayDataObj {
  id: string;
  title: string;
  authors: string[];
  pubInfo: {
    priority?: number;
    publicationTime: string;
  };
}

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

const ArticleOverlay: FC<OverlayProps> = ({ data, viewStatus, children }) => {
  const [overlayData, setOverlayData] = useState<OverlayDataObj>();
  const [objectNotFound, setObjectNotFound] = useState(false);

  const { data: loggedUserInfo } = useLoggedUserInfo();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/nodes/${data.id}`);
        if (response.ok) {
          const data = await response.json();
          setOverlayData(data);
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

  const getPriorityString = (priority: number) => {
    const priorityOption = priorityOptions.find(option => option.value === priority);
    return priorityOption?.content;
  };
  const getPublicationDateString = (publicationTime: string) => {
    const date = new Date(publicationTime);
    return `${date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })} - ${date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

  if (objectNotFound) {
    return null;
  }

  return (
    <>
      {loggedUserInfo.inspectItems && overlayData ? (
        <div className="border border-transparent hover:border-gray-700 relative group">
          <ArticleActions data={data} viewStatus={viewStatus} />
          {children}
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 z-10 bg-white p-2.5 shadow-lg border border-gray-300 rounded-xs
          hidden group-hover:grid group-hover:grid-cols-2 group-hover:gap-5 w-max"
          >
            {/* POINTING ARROW */}
            <div
              className="w-2.5 h-2.5 bg-white border-l border-t border-gray-300
            absolute top-[-5.5px] left-1/2 transform -translate-x-1/2 rotate-45"
            />
            {/* LEFT SIDE */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <h5 className="font-semibold">ID</h5>
                <p className="text-nowrap">{overlayData.id}</p>
              </div>
              <div className="flex flex-col gap-1">
                <h5 className="font-semibold">Title</h5>
                <p>{overlayData.title}</p>
              </div>
              <div className="flex flex-col gap-1">
                <h5 className="font-semibold">Author</h5>
                <p>{overlayData.authors[0]}</p>
              </div>
            </div>
            {/* DIVIDER */}
            <div className="w-px h-[calc(100%-20px)] bg-gray-300 absolute top-2.5 left-1/2 transform -translate-x-px" />
            {/* RIGHT SIDE */}
            <div className="flex flex-col gap-3">
              {overlayData.pubInfo?.priority && (
                <div className="flex flex-col gap-1">
                  <h5 className="font-semibold">Priority</h5>
                  <p>{getPriorityString(overlayData.pubInfo.priority)}</p>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <h5 className="font-semibold">Publication Date</h5>
                <p className="text-nowrap">{getPublicationDateString(overlayData.pubInfo.publicationTime)}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </>
  );
};

export default ArticleOverlay;
