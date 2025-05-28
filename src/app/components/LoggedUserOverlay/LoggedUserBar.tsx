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
import PromotionButton from '../PromotionButton';
import InfoTooltip from './InfoTooltip';
import { SquareArrowOutUpRight } from 'lucide-react';

const LoggedUserBar: React.FC<LoggedUserBarProps> = ({ data, siteName }) => {
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
    <div
      id="loggedUserBar"
      className="flex items-center bg-(--color-toolbar-background) h-16 justify-between text-sm sticky top-0 z-10"
    >
      <div className="flex items-center">
        <ViewStatus data={data} />
        <Switch label="Inspect items" checked={inspectItemsEnabled} onChange={toggleInspectItems} />
        <Switch label="Analytics" checked={analyticsEnabled} onChange={toggleAnalytics} />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center text-white">{siteName || data.siteData?.siteName}</div>
        {'model' in data && (
          <>
            <PromotionButton data={data.model.data} viewStatus={data.siteData.viewStatus} />
            <InfoTooltip pageData={data} />
            <Link href={data.editUrl} target="_blank" className="flex items-center justify-center text-white">
              <SquareArrowOutUpRight />
            </Link>
            <History data={data} />
            <VisibilityChip data={data} />
          </>
        )}
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
