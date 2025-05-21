import React from 'react';
import { OverlayDataObj, priorityOptions } from '../ArticleOverlay';

type ArticleInfoProps = {
  width?: 'normal' | 'max';
  overlayData: OverlayDataObj;
};

const ArticleInfo: React.FC<ArticleInfoProps> = ({ width, overlayData }) => {
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

  return (
    <div
      className={`absolute top-2 left-1/2 transform -translate-x-1/2 z-10 bg-white p-2.5 shadow-lg border border-gray-300 rounded-xs
           group-hover:grid group-hover:grid-cols-2 group-hover:gap-5 ${
             width === 'max' ? 'w-max max-w-screen' : 'w-[125%]'
           }`}
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
          <p className={`${width === 'max' && 'text-nowrap'}`}>{overlayData.id}</p>
        </div>
        <div className="flex flex-col gap-1">
          <h5 className="font-semibold">Title</h5>
          <p>{overlayData.title}</p>
        </div>
        <div className="flex flex-col gap-1">
          <h5 className="font-semibold">Author</h5>
          <p>{overlayData.authors?.[0] || ''}</p>
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
          <p className={`${width === 'max' && 'text-nowrap'}`}>
            {getPublicationDateString(overlayData?.pubInfo?.publicationTime)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ArticleInfo;
