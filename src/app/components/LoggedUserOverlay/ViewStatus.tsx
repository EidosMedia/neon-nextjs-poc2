import useVersions from '@/hooks/useVersions';
import clsx from 'clsx';
import Link from 'next/link';
import { LoggedUserBarProps } from './LoggedUserOverlay.types';
import { setViewStatus as setViewStatusAction } from '@/lib/features/loggedUserSlice';
import { use, useEffect } from 'react';
import { useDispatch } from 'react-redux';
const ViewStatus: React.FC<LoggedUserBarProps> = ({ data }) => {
  const { getVersionLabelFromVersion, getLatestViewVersion } = useVersions({
    currentNode: 'model' in data ? data.model.data : undefined,
    viewStatus: data.siteData.viewStatus,
  });
  /*const dispatch = useDispatch();
   useEffect(() => {
    if (data.siteData.viewStatus) {
      console.log('******** Setting view status to', data.siteData.viewStatus);
      dispatch(setViewStatusAction(data.siteData.viewStatus));
    }
  }, [data.siteData.viewStatus]);*/

  const version = getVersionLabelFromVersion(
    'model' in data && data.model?.data?.version
      ? data.model.data.version
      : data.siteData.viewStatus === 'LIVE' && 'model' in data && data.model?.data?.id
      ? data.model.data.id
      : '',
    data.siteData.viewStatus
  );

  const isLastPreview = version === 'PREVIEW';
  const isLastLive = version === 'LIVE';

  const isPreview = version.startsWith('PREVIEW');
  const isLive = version.startsWith('LIVE');

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
    } else {
      return 'text-black';
    }
  };

  return (
    <div className={clsx('flex items-center justify-center text-white px-5 h-16', colorClass())}>
      {isLastLive || isLastPreview ? (
        version
      ) : (
        <div className="flex flex-col justify-center items-center">
          <span className={clsx('font-normal', textClass())}>{version}</span>
          <Link href={getLatestViewVersion(data.siteData.viewStatus).pubInfo.canonical}>
            <span className={clsx('underline font-normal', textClass())}>Back to latest version</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ViewStatus;
