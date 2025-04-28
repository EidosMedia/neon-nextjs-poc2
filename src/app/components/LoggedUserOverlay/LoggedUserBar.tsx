'use client';
import React, { useState } from 'react';
import Switch from '../base/Switch';
import ViewStatus from './ViewStatus';
import History from './History';
import useAuth from '@/hooks/useAuth';
import { LoggedUserBarProps } from './LoggedUserOverlay.types';
import VisibilityChip from './VisibilityChip';
import { isNeonAppPreview } from '@eidosmedia/neon-frontoffice-ts-sdk';
import Link from 'next/link';
import useLoggedUserInfo from '@/hooks/useLoggedUserInfo';
import { loggedUserSlice } from '@/lib/features/loggedUserSlice';
import { useDispatch } from 'react-redux';

const LoggedUserBar: React.FC<LoggedUserBarProps> = ({ data }) => {
  const dispatch = useDispatch();
  const { data: loggedUserInfo, changeInspectItems } = useLoggedUserInfo();

  const inspectItemsEnabled = loggedUserInfo.inspectItems;
  const analyticsEnabled = loggedUserInfo.analytics;

  const toggleInspectItems = () => {
    changeInspectItems(!inspectItemsEnabled);
  };
  const toggleAnalytics = () => {
    dispatch(loggedUserSlice.actions.setAnalytics(!analyticsEnabled));
  };

  const { data: userData } = useAuth();

  if (!userData.user?.name) {
    return null;
  }

  if (isNeonAppPreview()) {
    return null;
  }

  return (
    <div className="relative flex items-center bg-(--color-toolbar-background) h-16 justify-between text-sm">
      <div className="flex items-center">
        <ViewStatus data={data} />
        <Switch label="Inspect items" checked={inspectItemsEnabled} onChange={toggleInspectItems} />
        <Switch label="Analytics" checked={analyticsEnabled} onChange={toggleAnalytics} />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center text-white">{data.siteData?.siteName}</div>
        <Link href={data.editUrl} target="_blank" className="flex items-center justify-center text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
            />
          </svg>
        </Link>
        <History data={data} />

        <div className="relative flex items-center justify-center text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
            />
          </svg>
        </div>
        <VisibilityChip data={data} />
        <div className="flex items-center justify-center text-white gap-3">
          <img
            className="w-10 h-10 rounded-full"
            src={`/api/users/picture?id=${userData?.user.id}`}
            alt="Rounded avatar"
          />
          {userData?.user?.alias}
        </div>
        <a>
          <i></i>
        </a>
      </div>
    </div>
  );
};

export default LoggedUserBar;
