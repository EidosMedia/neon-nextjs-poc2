import useVersions from '@/hooks/useVersions';
import clsx from 'clsx';
import Link from 'next/link';
import { LoggedUserBarProps } from './LoggedUserOverlay.types';

const ViewStatus: React.FC<LoggedUserBarProps> = ({ data }) => {
  const { getVersion, getCurrentLiveVersion } = useVersions({
    currentNode: 'model' in data ? data : undefined,
  });

  const isPreview = data.siteData.viewStatus === 'PREVIEW';
  const version = isPreview ? 'PREVIEW' : getVersion('model' in data ? data.model?.data?.url : '');
  const isLive = version ? version === 'LIVE' : data.siteData.viewStatus;

  const colorClass = () => {
    if (isLive) {
      return 'bg-(--color-live-background)';
    }
    if (isPreview) {
      return 'bg-gray-600';
    }
    return 'bg-gray-100';
  };

  return (
    <div className={clsx('flex items-center justify-center text-white px-5 h-16', colorClass())}>
      {isLive || isPreview ? (
        version
      ) : (
        <div className="flex flex-col justify-center items-center">
          <span className="text-black font-semibold text-">Version {version}</span>
          <Link href={getCurrentLiveVersion().pubInfo.canonical}>
            <span className="text-black underline font-medium">Back to live version</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ViewStatus;
