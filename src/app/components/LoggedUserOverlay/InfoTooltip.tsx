import React, { SyntheticEvent, useState } from 'react';
import { priorityOptions } from '../base/ArticleOverlay/ArticleOverlay';
import { Info } from 'lucide-react';
import clsx from 'clsx';

interface InfoTooltipProps {
  pageData: any;
}

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

const InfoTooltip: React.FC<InfoTooltipProps> = ({ pageData }) => {
  const [opened, setOpened] = useState(false);
  const data = pageData.model.data;

  const handleOnClick = (event: SyntheticEvent) => {
    if ((event as React.MouseEvent).metaKey || (event as React.MouseEvent).ctrlKey) {
      window.open(`${window.location.href}?neon.outputMode=raw`, '_blank');
      return;
    }
    setOpened(!opened);
  };

  return (
    <div className="relative">
      <Info
        className={clsx('cursor-pointer', opened ? 'text-(--color-live-background)' : 'text-white')}
        onClick={handleOnClick}
      />
      {opened && (
        <div
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-10 bg-white p-2.5 shadow-lg border border-gray-300 rounded-xs
            grid grid-cols-2 gap-5 w-max text-xs"
          style={{ maxWidth: 'calc(100vw - 20px)' }} // Ensure tooltip fits within viewport
        >
          {/* POINTING ARROW */}
          <div
            className="w-2.5 h-2.5 bg-white border-l border-t border-gray-300
              absolute -top-1 left-1/2 transform -translate-x-1/2 rotate-45"
          />
          {/* LEFT SIDE */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h5 className="font-semibold">ID</h5>
              <p className="">{data.id}</p>
            </div>
            <div className="flex flex-col gap-1">
              <h5 className="font-semibold">Title</h5>
              <p>{data.title}</p>
            </div>
            <div className="flex flex-col gap-1">
              <h5 className="font-semibold">Author</h5>
              <p>{data.authors[0]}</p>
            </div>
          </div>
          {/* DIVIDER */}
          <div className="w-px h-[calc(100%-20px)] bg-gray-300 absolute top-2.5 left-1/2 transform -translate-x-px" />
          {/* RIGHT SIDE */}
          <div className="flex flex-col gap-3">
            {data.pubInfo?.priority && (
              <div className="flex flex-col gap-1">
                <h5 className="font-semibold">Priority</h5>
                <p>{getPriorityString(data.pubInfo.priority)}</p>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <h5 className="font-semibold">Publication Date</h5>
              <p className="text-nowrap">{getPublicationDateString(data.pubInfo.publicationTime)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
