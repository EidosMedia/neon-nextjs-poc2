import useVersions from '@/hooks/useVersions';
import clsx from 'clsx';
import Link from 'next/link';
import { LoggedUserBarProps } from './LoggedUserOverlay.types';
import React from 'react';
import useAuthContext from '@/hooks/useAuthContext';
import {
  getSwitchTargetViewStatus,
  normalizeViewStatus,
  ViewStatus as ViewStatusEnum,
} from '@eidosmedia/neon-frontoffice-ts-sdk';

const ViewStatus: React.FC<LoggedUserBarProps> = ({ data }) => {
  const { data: authContext } = useAuthContext();
  const normalizedViewStatus = normalizeViewStatus(data.siteData.viewStatus);
  const canUseVersions = normalizedViewStatus === ViewStatusEnum.PREVIEW || authContext.hasEditorialAuth;

  const { getVersionLabelFromVersion, getLatestViewVersion } = useVersions({
    currentNode: 'model' in data ? data.model.data : undefined,
    viewStatus: normalizedViewStatus,
    enabled: canUseVersions,
  });
  const { getLatestViewVersion: getLatestPreviewVersion } = useVersions({
    currentNode: 'model' in data ? data.model.data : undefined,
    viewStatus: ViewStatusEnum.PREVIEW,
    enabled: canUseVersions && normalizedViewStatus === ViewStatusEnum.LIVE,
  });

  const version = canUseVersions
    ? getVersionLabelFromVersion(
        'model' in data && data.model?.data?.version
          ? data.model.data.version
          : normalizedViewStatus === ViewStatusEnum.LIVE && 'model' in data && data.model?.data?.id
            ? data.model.data.id
            : '',
        normalizedViewStatus,
      )
    : normalizedViewStatus;

  const isLastPreview = version === ViewStatusEnum.PREVIEW;
  const isLastLive = version === ViewStatusEnum.LIVE;
  const isLive = version.startsWith(ViewStatusEnum.LIVE);

  const colorClass = () => {
    if (isLastLive || isLive) {
      return 'bg-(--color-live-background)';
    }
    if (isLastPreview) {
      return 'bg-gray-600';
    }
    return 'bg-gray-300';
  };

  const textClass = () => {
    if (isLive) {
      return 'text-white';
    }
    return 'text-black';
  };

  const goToUrl = (): string => {
    if (!('model' in data && data.model.data.url)) {
      return '';
    }

    const targetViewStatus = getSwitchTargetViewStatus(normalizedViewStatus);
    let pathname = data.model.data.url;

    if (normalizedViewStatus === ViewStatusEnum.LIVE && targetViewStatus === ViewStatusEnum.PREVIEW) {
      try {
        pathname = new URL(getLatestPreviewVersion(ViewStatusEnum.PREVIEW).pubInfo.canonical, window.location.origin).pathname;
      } catch (error) {
        console.warn('Unable to resolve latest preview version URL for view switch', error);
      }
    }

    const targetUrl = new URL(pathname, window.location.origin);
    targetUrl.searchParams.set('switch-view', targetViewStatus);
    return `${targetUrl.pathname}${targetUrl.search}`;
  };

  if (!('model' in data && data.model.data.url)) {
    return '';
  }

  return (
    <>
      <div className={clsx('flex items-center justify-center text-white px-5 h-16', colorClass())}>
        {isLastLive || isLastPreview ? (
          version
        ) : (
          <div className="flex flex-col justify-center items-center">
            <span className={clsx('font-normal', textClass())}>{version}</span>
            <Link href={canUseVersions ? getLatestViewVersion(normalizedViewStatus).pubInfo.canonical : '#'}>
              <span className={clsx('underline font-normal', textClass())}>Back to latest version</span>
            </Link>
          </div>
        )}
      </div>
      {(isLastLive || isLastPreview) && 'model' in data && data.model.data.url && (
        <Link
          href="#"
          className="fit-content cursor-pointer px-4 py-2 rounded-[2px] text-white bg-[#2847E2] hover:bg-[#191FBD] duration-300 ease-in-out ml-4"
          onClick={e => {
            e.preventDefault();
            window.location.href = goToUrl();
          }}
        >
          {isLastLive ? 'GO TO PREVIEW' : 'GO TO LIVE'}
        </Link>
      )}
    </>
  );
};

export default ViewStatus;
