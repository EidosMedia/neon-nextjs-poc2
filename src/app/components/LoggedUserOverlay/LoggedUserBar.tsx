'use client';
import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import ViewStatus from './ViewStatus';
import History from './History';
import useAuth from '@/hooks/useAuth';
import { LoggedUserBarProps } from './LoggedUserOverlay.types';
import VisibilityChip from './VisibilityChip';
import Link from 'next/link';
import useLoggedUserInfo from '@/hooks/useLoggedUserInfo';
//import { loggedUserSlice } from '@/lib/features/loggedUserSlice';
import PromotionButton from '../PromotionButton';
import InfoTooltip from './InfoTooltip';
import { Braces, SquareArrowOutUpRight } from 'lucide-react';
import EditedChip from './EditedChip';
import { isNeonAppPreview } from '@/neon-frontoffice-ts-sdk/src';
import useAuthContext from '@/hooks/useAuthContext';
import { normalizeViewStatus, ViewStatus as ViewStatusEnum } from '@eidosmedia/neon-frontoffice-ts-sdk';
import PreviewReaderSelect from '@/app/_v2/chrome/PreviewReaderSelect';
import { siteThemeOf } from '@/lib/accessories/defaultThemeAccessories';
import { isV2Theme, resolveRenderTheme } from '@/app/themeKeys';
import { setEditorialBarVisible, setEditorialViewport, setViewportOrientation } from '@/lib/features/loggedUserSlice';
import ViewportSelector from './ViewportSelector';
import {
  ORIENTATION_QUERY_KEY, ORIENTATION_STORAGE_KEY, parseEditorialViewport, parseViewportOrientation,
  VIEWPORT_QUERY_KEY, VIEWPORT_STORAGE_KEY,
} from './viewport';

const LoggedUserBar: React.FC<LoggedUserBarProps> = ({ data, siteName }) => {
  const { data: loggedUserInfo, changeInspectItems } = useLoggedUserInfo();
  const dispatch = useDispatch();
  const barRef = useRef<HTMLDivElement>(null);

  const inspectItemsVisible = loggedUserInfo.inspectItemsVisible;
  const inspectItemsEnabled = loggedUserInfo.inspectItems;
  const toggleInspectItems = () => {
    changeInspectItems(!inspectItemsEnabled);
  };

  const { data: authContext } = useAuthContext();
  const normalizedViewStatus = normalizeViewStatus(data.siteData.viewStatus);
  const canLoadUser = normalizedViewStatus === ViewStatusEnum.PREVIEW || authContext.hasEditorialAuth;
  const { data: userData } = useAuth({ enabled: canLoadUser });

  const isBarVisible = !!userData.user?.name && !isNeonAppPreview();

  useEffect(() => {
    if (!isBarVisible) return;
    dispatch(setEditorialBarVisible(true));
    try {
      const url = new URL(window.location.href);
      const selected = parseEditorialViewport(url.searchParams.get(VIEWPORT_QUERY_KEY))
        ?? parseEditorialViewport(sessionStorage.getItem(VIEWPORT_STORAGE_KEY));
      const orientation = parseViewportOrientation(url.searchParams.get(ORIENTATION_QUERY_KEY))
        ?? parseViewportOrientation(sessionStorage.getItem(ORIENTATION_STORAGE_KEY));
      if (selected) {
        dispatch(setEditorialViewport(selected));
        sessionStorage.setItem(VIEWPORT_STORAGE_KEY, selected);
      }
      if (orientation) {
        dispatch(setViewportOrientation(orientation));
        sessionStorage.setItem(ORIENTATION_STORAGE_KEY, orientation);
      }
      if (url.searchParams.has(VIEWPORT_QUERY_KEY) || url.searchParams.has(ORIENTATION_QUERY_KEY)) {
        url.searchParams.delete(VIEWPORT_QUERY_KEY);
        url.searchParams.delete(ORIENTATION_QUERY_KEY);
        window.history.replaceState(window.history.state, '', url);
      }
    } catch (error) {
      console.warn('Unable to restore editorial viewport', error);
    }
    const bar = barRef.current;
    const updateHeight = () => {
      if (bar) document.documentElement.style.setProperty('--neon-bar-height', `${bar.offsetHeight}px`);
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    if (bar) observer.observe(bar);
    return () => {
      observer.disconnect();
      dispatch(setEditorialBarVisible(false));
      document.documentElement.style.removeProperty('--neon-bar-height');
    };
  }, [isBarVisible, dispatch]);

  if (!userData.user?.name) {
    return null;
  }

  if (isNeonAppPreview()) {
    return null;
  }

  const webPageType =
    'model' in data &&
    ['webpage', 'homewebpage', 'sectionwebpage'].includes(data.model.data.sys.baseType);

  const shouldShowInspectSwitch =
    'model' in data && (webPageType || (inspectItemsVisible && normalizedViewStatus === ViewStatusEnum.PREVIEW));
  const canUseVersions = normalizedViewStatus === ViewStatusEnum.PREVIEW || authContext.hasEditorialAuth;
  const v2 = isV2Theme(resolveRenderTheme(siteThemeOf('model' in data ? data.siteNode : data.siteData.root)));

  return (
    <div
      id="loggedUserBar"
      ref={barRef}
      className="neon-admin"
    >
      <div className="neon-admin__group">
        <span className="neon-admin__brand">
          <svg role="img" aria-label="Neon" viewBox="0 23 316 177" width="24" height="14" fill="#2847e2">
            <path d="M296.92,23.25c-6.08,0-11.19,2.58-14.67,7.44l-.08.11c-7.16,10.13-77.59,109.66-91.64,123.93h0c-3.02,3.33-6.57,5.65-11.15,5.65-5.87,0-11.19-4.22-12.92-8.79,0,0-4.13-9.78-.14-25.84l4.73-19.69c6.21-23.82,2.13-39.13.8-43.25-5.84-21.55-25.49-37.43-48.9-37.43-14.19,0-27,5.85-36.21,15.24l-.18.17c-4.96,4.93-34.09,42.04-34.09,42.04L5.07,144.06c-2.46,3.32-4.48,7.47-4.48,12.08,0,10.23,8.29,18.52,18.52,18.52,5.28,0,10.15-1.81,14.1-6.77l17.15-22.65,32.2-41.64c16.49-20.48,24.48-32.5,28.46-36.15,0,0,.85-.76,1.42-1.23h-.02c2.84-2.23,5.81-4.17,9.87-4.17,5.4,0,10.05,3.12,12.32,7.64,0,0,.07.14.21.44.18.37.3.75.44,1.14.12.34.24.73.37,1.19.07.28.16.56.22.84.3,1.22.57,2.84.76,4.76v.05s1.42,10.56-2.53,26.45c-4.11,16.52-6.57,29.59-6.5,43.76v.17c0,28.08,22.56,50.84,50.38,50.84,13.27,0,25.39-4.93,34.32-13.65,8.61-7.57,91.64-121.79,98.7-131.82l.12-.17c2.73-3.8,4.34-7.38,4.34-11.91,0-10.23-8.29-18.52-18.52-18.52Z" />
          </svg>
        </span>
        <ViewStatus data={data} />
        {v2 && normalizedViewStatus === ViewStatusEnum.PREVIEW && <PreviewReaderSelect />}
        <ViewportSelector />
        {shouldShowInspectSwitch && (
          <label className="neon-admin__switch">
            <input type="checkbox" checked={inspectItemsEnabled} onChange={toggleInspectItems} />
            <span className="neon-admin__switch-track" />
            {normalizedViewStatus === ViewStatusEnum.LIVE ? 'View Additional Information' : 'Edit Content Items'}
          </label>
        )}
      </div>
      <div className="neon-admin__group neon-admin__actions">
        {'model' in data && <VisibilityChip data={data} />}
        <span className="neon-admin__site">{siteName || data.siteData?.siteName}</span>
        {'model' in data && (
          <>
            <div className="neon-admin__promotion">
              <PromotionButton data={data.model.data} viewStatus={data.siteData.viewStatus ?? ''} />
            </div>
            <InfoTooltip pageData={data} />
            <Link
              aria-label="View Model"
              title={'View Model'}
              href={data.model.data.url + '?neon.outputMode=RAW'}
              target="_blank"
              prefetch={false}
              className="neon-admin__icon"
            >
              <Braces />
            </Link>
            <Link
              aria-label="Open in Editor"
              title={'Open in Editor'}
              href={data.editUrl}
              target="_blank"
              className="neon-admin__icon"
            >
              <SquareArrowOutUpRight />
            </Link>
            {canUseVersions && <History data={data} />}
            {canUseVersions && <EditedChip data={data} />}
          </>
        )}
        <div className="neon-admin__user">
          <img
            className="neon-admin__avatar"
            src={`/api/users/picture?id=${userData?.user.id}`}
            alt=""
          />
          {userData?.user?.alias}
        </div>
      </div>
    </div>
  );
};

export default LoggedUserBar;
