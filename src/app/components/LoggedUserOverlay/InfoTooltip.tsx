import React, { useRef, useEffect, useState, SyntheticEvent } from 'react';
import { priorityOptions } from '../base/ArticleOverlay/ArticleOverlay';
import { Info } from 'lucide-react';
import clsx from 'clsx';
import type { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';

interface InfoTooltipProps {
  pageData: PageData<BaseModel>;
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
  const author = 'authors' in data && Array.isArray(data.authors) ? data.authors[0] : undefined;
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleOnClick = (event: SyntheticEvent) => {
    if ((event as React.MouseEvent).metaKey || (event as React.MouseEvent).ctrlKey) {
      window.open(`${window.location.href}?neon.outputMode=raw`, '_blank');
      return;
    }
    setOpened(!opened);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpened(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <button type="button"
        onClick={handleOnClick}
        className={clsx('neon-admin__icon', opened && 'is-active')}
        aria-label="Info"
        aria-expanded={opened}
        title="Info"
      >
        <Info size={18} />
      </button>
      {opened && (
        <div
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-10 bg-white text-[#3f3c4e] p-2.5 shadow-lg border border-gray-300 rounded-xs
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
              <p>{author}</p>
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
            {data.pubInfo?.paywallLevel && (
              <div className="flex flex-col gap-1">
                <h5 className="font-semibold">Paywall</h5>
                <p>{data.pubInfo.paywallLevel}</p>
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
